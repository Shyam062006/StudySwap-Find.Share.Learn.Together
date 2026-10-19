import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { resourceService } from '../../services/resourceService';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';
import { formatFileSize } from '../../utils/formatFileSize';

export default function ResourceModerationPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => reportService.pending(), []);
  const [items, setItems] = useState([]);
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  useEffect(() => { if (data) setItems(data.data || []); }, [data]);

  const decide = async (r, status, why) => {
    setBusy(r._id + status);
    try { await reportService.moderate(r._id, { status, reason: why }); setItems((l) => l.filter((x) => x._id !== r._id)); toast.success(status === 'approved' ? 'Resource approved.' : 'Resource rejected.'); setReject(null); setReason(''); }
    catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  const preview = async (r) => { try { await resourceService.download(r._id, r.title); } catch (e) { toast.error(e.message); } };

  return (
    <div className="stack">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Resource moderation</h1><p>Review each upload before it is published.</p></div>
      {loading ? <Loader /> : error ? <ErrorState error={error} onRetry={reload} /> : !items.length ? <EmptyState icon={ShieldCheck} title="Nothing waiting for review" /> : (
        <div className="stack">{items.map((r) => (
          <div className="card" key={r._id}>
            <div className="row row-between"><div><h3 style={{ margin: 0 }}>{r.title}</h3><span className="muted" style={{ fontSize: '.85rem' }}>{r.subject} · Sem {r.semester} · {r.resourceType} · {formatFileSize(r.fileSize)} · by {r.uploader?.name} on {formatDate(r.createdAt)}</span></div><span className="badge badge-pending">pending</span></div>
            <p className="muted">{r.description}</p>
            <div className="row"><Button size="sm" variant="ghost" onClick={() => preview(r)}>Download to inspect</Button>
              <Button size="sm" icon={<CheckCircle size={14} />} loading={busy === r._id + 'approved'} onClick={() => decide(r, 'approved')}>Approve</Button>
              <Button size="sm" variant="danger" icon={<XCircle size={14} />} onClick={() => setReject(r)}>Reject</Button></div>
          </div>))}</div>
      )}
      <Modal open={!!reject} title="Reject this material" onClose={() => setReject(null)}>
        <Input as="textarea" label="Reason (shown to the uploader)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="row"><Button variant="danger" disabled={!reason.trim()} loading={!!busy} onClick={() => decide(reject, 'rejected', reason.trim())}>Reject material</Button><Button variant="ghost" onClick={() => setReject(null)}>Cancel</Button></div>
      </Modal>
    </div>
  );
}
