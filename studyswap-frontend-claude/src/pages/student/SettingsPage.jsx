import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const out = async () => { try { await logout(); navigate('/'); } catch (e) { toast.error(e.message); } };
  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Settings</h1></div>
      <section className="card"><h3>Theme</h3><p className="muted">Your choice is remembered on this device.</p>
        <div className="row"><Button variant={theme === 'dark' ? 'primary' : 'ghost'} icon={<Moon size={16} />} onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}>Dark</Button><Button variant={theme === 'light' ? 'primary' : 'ghost'} icon={<Sun size={16} />} onClick={() => setTheme('light')} aria-pressed={theme === 'light'}>Light</Button></div></section>
      <section className="card"><h3>Profile</h3><p className="muted">Update your name, college, degree, branch and semester.</p><Button to="/app/profile" variant="ghost">Edit profile</Button></section>
      <section className="card"><h3>Account</h3><dl className="kv"><dt>Name</dt><dd>{user?.name}</dd><dt>Email</dt><dd>{user?.email}</dd><dt>Role</dt><dd>{user?.role}</dd></dl>
        <div style={{ marginTop: '1rem' }}><Button variant="danger" icon={<LogOut size={16} />} onClick={out}>Log out</Button></div></section>
    </div>
  );
}
