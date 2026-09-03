import { useState, useEffect, useCallback } from 'react';
import { X, CheckCheck, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useSocket from '../hooks/useSocket';
import LoadingSpinner from './LoadingSpinner';

const typeLabels = {
  application_received: 'Application',
  application_accepted: 'Accepted',
  application_rejected: 'Rejected',
  team_added: 'Team',
  team_removed: 'Team',
  project_updated: 'Project',
  ownership_transferred: 'Ownership',
  application: 'Application',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const NotificationDrawer = ({ isOpen, onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      const unread = data.filter((n) => !n.read).length;
      onCountChange?.(unread);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  useSocket(() => {
    if (isOpen) fetchNotifications();
    else {
      api.get('/notifications/unread-count').then(({ data }) => onCountChange?.(data.count));
    }
  });

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      onCountChange?.(notifications.filter((n) => !n.read && n._id !== id).length);
    } catch {
      /* ignore */
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onCountChange?.(0);
    } catch {
      /* ignore */
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm" onClick={onClose} role="presentation" />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-elevated">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-accent hover:bg-chrome"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-chrome">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-3 text-sm text-muted">No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notif) => (
                <li
                  key={notif._id}
                  className={`px-6 py-4 transition hover:bg-cream ${!notif.read ? 'bg-blue-50/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-chrome px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">
                          {typeLabels[notif.type] || notif.type}
                        </span>
                        {!notif.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        )}
                      </div>
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="mt-0.5 text-sm text-muted">{notif.message}</p>
                      <p className="mt-1 text-xs text-muted">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                      {notif.projectId && (
                        <Link
                          to={`/projects/${notif.projectId}`}
                          onClick={onClose}
                          className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
                        >
                          View project
                        </Link>
                      )}
                    </div>
                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif._id)}
                        className="shrink-0 text-xs text-accent hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
};

export default NotificationDrawer;
