import { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';

export default function UserManagementPage() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => reportService.users({ page, limit: 15 }), [page]);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState('');
  useEffect(() => { if (data) setItems(data.data || []); }, [data]);
  const setStatus = async (u, status) => {
    setBusy(u._id);
    try { await reportService.setUserStatus(u._id, status); setItems((l) => l.map((x) => (x._id === u._id ? { ...x, status } : x))); toast.success(status === 'restricted' ? 'User restricted.' : 'User restored.'); }
    catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  return (
    <div className="stack">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Users</h1><p>View accounts and restrict misuse.</p></div>
      {loading ? <Loader /> : error ? <ErrorState error={error} onRetry={reload} /> : !items.length ? <EmptyState title="No users found" /> : (
        <div className="card table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>College</th><th>Role</th><th>Points</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead>
          <tbody>{items.map((u) => { const restricted = u.status === 'restricted'; return (<tr key={u._id}>
            <td>{u.name}</td><td>{u.email}</td><td>{u.college}</td><td>{u.role}</td><td>{u.contributionPoints ?? 0}</td><td><span className={`badge badge-${u.status || 'active'}`}>{u.status || 'active'}</span></td>
            <td>{u._id !== me?._id && u.role !== 'admin' && <Button size="sm" variant={restricted ? 'ghost' : 'danger'} loading={busy === u._id} onClick={() => setStatus(u, restricted ? 'active' : 'restricted')}>{restricted ? 'Restore' : 'Restrict'}</Button>}</td></tr>); })}</tbody></table></div>
      )}
      <Pagination page={page} totalPages={data?.pagination?.totalPages} onChange={setPage} />
    </div>
  );
}
