import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellOff } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/formatDate';

export default function NotificationsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => notificationService.list(), []);
  const [items, setItems] = useState([]);
  useEffect(() => { if (data) setItems(data.data || []); }, [data]);
  const unread = items.filter((n) => !n.read).length;
  const changed = () => window.dispatchEvent(new Event('notifications:changed'));
  const markRead = async (id) => { try { await notificationService.markRead(id); setItems((l) => l.map((n) => (n._id === id ? { ...n, read: true } : n))); changed(); } catch (e) { toast.error(e.message); } };
  const markAll = async () => { try { await notificationService.markAllRead(); setItems((l) => l.map((n) => ({ ...n, read: true }))); changed(); toast.success('All notifications marked as read.'); } catch (e) { toast.error(e.message); } };
  return (
    <div className="stack">
      <div className="row row-between page-head"><div><h1 style={{ fontSize: '2rem' }}>Notifications</h1><p>{unread} unread</p></div><Button variant="ghost" onClick={markAll} disabled={!unread}>Mark all as read</Button></div>
      {loading ? <Loader /> : error ? <ErrorState error={error} onRetry={reload} /> : !items.length ? <EmptyState icon={BellOff} title="You're all caught up" text="Updates about your uploads will appear here." /> : (
        <div className="stack">{items.map((n) => (
          <div key={n._id} className={`card notif ${n.read ? '' : 'unread'}`}>
            <div><p style={{ margin: 0, fontWeight: n.read ? 400 : 600 }}>{n.message}</p><span className="hint">{formatDate(n.createdAt)}</span>
              {n.resource && <div><Link className="red" to={`/app/materials/${n.resource._id || n.resource}`}>View material</Link></div>}</div>
            {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n._id)}>Mark as read</Button>}
          </div>))}</div>
      )}
    </div>
  );
}
