import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  FolderKanban,
  User,
  MessageSquare,
  FileText,
  Plus,
  LogOut,
  Bell,
  Code2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useSocket from '../hooks/useSocket';
import NotificationDrawer from './NotificationDrawer';

const navItems = [
  { path: '/feed', label: 'Feed', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/applications', label: 'Applications', icon: FileText },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/profile', label: 'Profile', icon: User },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchUnread = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  useSocket(() => fetchUnread());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/feed" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">DevCollab</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname.startsWith(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-chrome text-ink'
                        : 'text-muted hover:bg-chrome/60 hover:text-ink'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/projects/new"
              className="btn-primary hidden sm:inline-flex !py-2 !text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </Link>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative rounded-lg p-2 text-muted transition hover:bg-chrome hover:text-ink"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="hidden items-center gap-3 border-l border-border pl-3 sm:flex">
              <Link to="/profile" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chrome text-sm font-semibold text-ink">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-muted transition hover:bg-chrome hover:text-ink"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-chrome text-ink' : 'text-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCountChange={setUnreadCount}
      />
    </>
  );
};

export default Navbar;
