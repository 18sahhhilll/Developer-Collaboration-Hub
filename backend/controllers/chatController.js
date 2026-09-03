import Chat from '../models/Chat.js';
import Project from '../models/Project.js';
import { encryptMessage, decryptMessage } from '../utils/encryption.js';

// Decrypt messages in a chat document
const decryptChatMessages = (chat) => {
  if (!chat) return chat;
  const chatObj = chat.toObject ? chat.toObject() : { ...chat };
  chatObj.messages = (chatObj.messages || []).map((msg) => ({
    ...msg,
    content: decryptMessage(msg.content),
  }));
  return chatObj;
};

export const getChatByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Only team members can access chat' });
    }

    let chat = await Chat.findOne({ projectId }).populate('messages.sender', 'name username avatarUrl avatarConfig');

    if (!chat) {
      chat = await Chat.create({ projectId, messages: [] });
      chat = await Chat.findById(chat._id).populate('messages.sender', 'name username avatarUrl avatarConfig');
    }

    // Decrypt messages before sending
    const decrypted = decryptChatMessages(chat);
    res.json(decrypted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).select('title _id members');
    const projectIds = projects.map((p) => p._id);

    const chats = await Chat.find({ projectId: { $in: projectIds } })
      .populate('projectId', 'title')
      .populate('messages.sender', 'name username');

    const result = projects.map((project) => {
      const chat = chats.find((c) => c.projectId?._id?.toString() === project._id.toString());
      const lastMsg = chat?.messages?.[chat.messages.length - 1];
      const lastMessage = lastMsg
        ? { ...lastMsg.toObject(), content: decryptMessage(lastMsg.content) }
        : null;
      return {
        projectId: project._id,
        title: project.title,
        lastMessage,
        unread: false,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Only team members can send messages' });
    }

    let chat = await Chat.findOne({ projectId });
    if (!chat) {
      chat = await Chat.create({ projectId, messages: [] });
    }

    const message = {
      sender: req.user._id,
      content: encryptMessage(content.trim()), // Encrypt before storing
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    const populated = await Chat.findById(chat._id).populate('messages.sender', 'name username avatarUrl avatarConfig');
    const newMessage = populated.messages[populated.messages.length - 1];

    // Decrypt before sending response
    const newMessageObj = newMessage.toObject();
    newMessageObj.content = decryptMessage(newMessageObj.content);

    res.status(201).json(newMessageObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
