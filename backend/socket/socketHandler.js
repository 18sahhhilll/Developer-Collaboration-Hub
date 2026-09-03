import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Project from '../models/Project.js';
import { encryptMessage, decryptMessage } from '../utils/encryption.js';

export const initSocket = (io) => {
  // ── JWT authentication middleware ──────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      // Explicit disconnect for invalid tokens
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.user.name} (${socket.user._id})`);
    socket.join(`user_${socket.user._id}`);

    // ── Join project room (verify membership) ──────────────────────────────
    socket.on('join_project', async (projectId) => {
      try {
        if (!projectId) return;

        const project = await Project.findById(projectId);
        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        const isMember = project.members.some(
          (m) => m.toString() === socket.user._id.toString()
        );

        if (!isMember) {
          socket.emit('error', { message: 'Access denied: not a project member' });
          return;
        }

        socket.join(`project_${projectId}`);
        console.log(`📌 ${socket.user.name} joined room project_${projectId}`);
      } catch (error) {
        console.error('Join project error:', error.message);
      }
    });

    // ── Leave project room ─────────────────────────────────────────────────
    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
    });

    // ── Send message (verify membership, encrypt, broadcast) ───────────────
    socket.on('send_message', async ({ projectId, content }) => {
      try {
        if (!content?.trim()) return;
        if (!projectId) return;

        const project = await Project.findById(projectId);
        if (!project) return;

        // Re-verify membership on every send (security)
        const isMember = project.members.some(
          (m) => m.toString() === socket.user._id.toString()
        );
        if (!isMember) {
          socket.emit('error', { message: 'Access denied: not a project member' });
          return;
        }

        let chat = await Chat.findOne({ projectId });
        if (!chat) {
          chat = await Chat.create({ projectId, messages: [] });
        }

        const encryptedContent = encryptMessage(content.trim());
        const message = {
          sender: socket.user._id,
          content: encryptedContent,
          createdAt: new Date(),
        };

        chat.messages.push(message);
        await chat.save();

        const populated = await Chat.findById(chat._id).populate(
          'messages.sender',
          'name username avatarUrl avatarConfig'
        );
        const newMessage = populated.messages[populated.messages.length - 1];

        // Decrypt before broadcasting so clients receive plain text
        const newMessageObj = newMessage.toObject();
        newMessageObj.content = decryptMessage(newMessageObj.content);

        io.to(`project_${projectId}`).emit('new_message', {
          projectId,
          message: newMessageObj,
        });
      } catch (error) {
        console.error('Send message error:', error.message);
      }
    });

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.user.name}`);
    });
  });
};

export default initSocket;
