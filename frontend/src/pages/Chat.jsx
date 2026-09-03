import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send, MessageSquare } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const Chat = () => {
  const { projectId } = useParams();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeProjectId = projectId || activeChat;

  useEffect(() => {
    api.get('/chat').then(({ data }) => {
      setChats(data);
      if (projectId) {
        setActiveChat(projectId);
      } else if (data.length > 0) {
        setActiveChat(data[0].projectId);
      }
    }).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (!activeProjectId) return;

    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, { auth: { token } });

    socketRef.current.emit('join_project', activeProjectId);

    socketRef.current.on('new_message', ({ projectId: pid, message }) => {
      if (pid === activeProjectId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    api.get(`/chat/${activeProjectId}`).then(({ data }) => {
      setMessages(data.messages || []);
    });

    return () => {
      socketRef.current?.emit('leave_project', activeProjectId);
      socketRef.current?.disconnect();
    };
  }, [activeProjectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeProjectId) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      socketRef.current?.emit('send_message', {
        projectId: activeProjectId,
        content,
      });
    } catch {
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container !py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="mt-1 text-muted">Project team conversations</p>
      </div>

      {chats.length === 0 ? (
        <div className="card py-16 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted" />
          <h3 className="mt-4 text-lg font-semibold">No chats yet</h3>
          <p className="mt-1 text-sm text-muted">
            Join a project team to start chatting with collaborators.
          </p>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <aside className="w-72 shrink-0 overflow-y-auto border-r border-border">
            <div className="p-3">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Projects
              </p>
              {chats.map((chat) => (
                <button
                  key={chat.projectId}
                  type="button"
                  onClick={() => setActiveChat(chat.projectId)}
                  className={`mt-1 w-full rounded-lg px-3 py-2.5 text-left transition ${
                    activeProjectId === chat.projectId
                      ? 'bg-chrome'
                      : 'hover:bg-chrome/60'
                  }`}
                >
                  <p className="truncate text-sm font-medium">{chat.title}</p>
                  {chat.lastMessage && (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {chat.lastMessage.sender?.name}: {chat.lastMessage.content}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex flex-1 flex-col">
            {activeProjectId ? (
              <>
                <div className="border-b border-border px-6 py-4">
                  <Link
                    to={`/projects/${activeProjectId}`}
                    className="font-semibold hover:text-accent"
                  >
                    {chats.find((c) => c.projectId === activeProjectId)?.title}
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-sm text-muted">No messages yet. Say hello!</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg._id} className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chrome text-xs font-semibold">
                            {msg.sender?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium">{msg.sender?.name}</span>
                              <span className="text-xs text-muted">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form onSubmit={handleSend} className="border-t border-border p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="input-field flex-1"
                      placeholder="Type a message..."
                    />
                    <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted">
                Select a project to start chatting
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
