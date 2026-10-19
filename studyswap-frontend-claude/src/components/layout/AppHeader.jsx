import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings, User, Trophy, FolderOpen } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/NotificationContext';
import { notificationService } from '../../services/notificationService';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = () => notificationService.list().then((r) => alive && setUnread(r?.unreadCount ?? (r?.data || []).filter((n) => !n.read).length)).catch(() => {});
    load();
    window.addEventListener('notifications:changed', load);
    return () => { alive = false; window.removeEventListener('notifications:changed', load); };
  }, [pathname]);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    try { await logout(); navigate('/'); } catch (e) { toast.error(e.message); }
  };

  return (
    <header className="appheader">
      <Link to="/" className="brand only-mobile"><img src="/StudySwap.png" alt="StudySwap" style={{ objectFit: 'contain' }} />StudySwap</Link>
      <span className="muted" style={{ fontSize: '.9rem' }}>Find. Share. Learn. Together.</span>
      <div className="row" style={{ gap: '.5rem' }}>
        <ThemeToggle />
        <Link to="/app/notifications" className="btn btn-ghost btn-icon" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          <Bell size={18} />{unread > 0 && <span className="dot">{unread > 9 ? '9+' : unread}</span>}
        </Link>
        <div style={{ position: 'relative' }} ref={ref}>
          <button className="userbtn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
            <span className="avatar">{(user?.name || '?')[0].toUpperCase()}</span><span className="uname">{user?.name?.split(' ')[0]}</span>
          </button>
          {open && (
            <div className="menu" role="menu">
              <Link to="/app/profile" role="menuitem"><User size={16} />My Profile</Link>
              <Link to="/app/my-uploads" role="menuitem"><FolderOpen size={16} />My Uploads</Link>
              <Link to="/app/leaderboard" role="menuitem"><Trophy size={16} />Leaderboard</Link>
              <Link to="/app/settings" role="menuitem"><Settings size={16} />Settings</Link>
              <button role="menuitem" onClick={handleLogout}><LogOut size={16} />Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
