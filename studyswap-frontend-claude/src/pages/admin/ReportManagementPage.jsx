import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function ReportManagementPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => reportService.adminList(), []);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState('');
  useEffect(() => { if (data) setItems(data.data || []); }, [data]);
  const resolve = async (r) => {
    setBusy(r._id);
    try { await reportService.adminUpdate(r._id, { status: 'resolved' }); setItems((l) => l.map((x) => (x._id === r._id ? { ...x, status: 'resolved' } : x))); toast.success('Report resolved.'); }
    catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  return (
    <div className="stack">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Reports</h1><p>Issues raised by students.</p></div>
      {loading ? <Loader /> : error ? <ErrorState error={error} onRetry={reload} /> : !items.length ? <EmptyState icon={Flag} title="No reports" text="Reported materials will show up here." /> : (
        <div className="card table-wrap"><table><thead><tr><th>Material</th><th>Reason</th><th>Reported by</th><th>Date</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead>
          <tbody>{items.map((r) => (<tr key={r._id}>
            <td>{r.resource?._id ? <Link className="red" to={`/app/materials/${r.resource._id}`}>{r.resource.title}</Link> : '—'}</td>
            <td>{r.reason}{r.details && <div className="hint">{r.details}</div>}</td><td>{r.reporter?.name || '—'}</td><td>{formatDate(r.createdAt)}</td>
            <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
            <td>{r.status !== 'resolved' && <Button size="sm" loading={busy === r._id} onClick={() => resolve(r)}>Resolve</Button>}</td></tr>))}</tbody></table></div>
      )}
    </div>
  );
}
