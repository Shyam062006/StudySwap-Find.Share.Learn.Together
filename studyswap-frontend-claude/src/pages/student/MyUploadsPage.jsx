import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Upload } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatDate';

export default function MyUploadsPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => resourceService.mine({ page, limit: 10 }), [page]);
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setItems(data.data || []); }, [data]);

  const saveEdit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const res = await resourceService.update(edit._id, { title: edit.title.trim(), description: edit.description.trim(), tags: String(edit.tagsText || '').split(',').map((t) => t.trim()).filter(Boolean) });
      setItems((l) => l.map((x) => (x._id === edit._id ? { ...x, ...(res?.data || {}), title: edit.title, description: edit.description } : x)));
      toast.success('Changes saved.'); setEdit(null);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const confirmDelete = async () => {
    setBusy(true);
    try { await resourceService.remove(del._id); setItems((l) => l.filter((x) => x._id !== del._id)); toast.success('Material deleted.'); setDel(null); }
    catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="stack">
      <div className="row row-between page-head"><div><h1 style={{ fontSize: '2rem' }}>My uploads</h1><p>Track the status of everything you have shared.</p></div><Button to="/app/upload" icon={<Upload size={16} />}>Upload material</Button></div>
      {loading ? <Loader /> : error ? <ErrorState error={error} onRetry={reload} /> : !items.length ? <EmptyState title="You haven't uploaded anything yet" text="Share notes or papers to help other students." action={{ label: 'Upload material', to: '/app/upload' }} /> : (
        <div className="card table-wrap"><table>
          <thead><tr><th>Title</th><th>Uploaded</th><th>Status</th><th>Downloads</th><th>Rating</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{items.map((r) => (
            <tr key={r._id}>
              <td>
                <Link to={`/app/materials/${r._id}`} className="red" style={{ fontWeight: 600 }}>
                  {r.title}
                </Link>
                {r.subject && <div className="muted" style={{ fontSize: '.78rem' }}>{r.subject} {r.unit ? `• Unit ${r.unit}` : ''}</div>}
              </td>
              <td>{formatDate(r.createdAt)}</td>
              <td><span className="badge badge-approved">Published</span></td>
              <td>{r.downloadCount ?? 0}</td>
              <td>
                <span style={{ color: '#F59E0B', marginRight: '3px' }}>★</span>
                <strong>{(r.averageRating != null && r.averageRating > 0 ? r.averageRating : 5).toFixed(1)}</strong>
              </td>
              <td><div className="row" style={{ flexWrap: 'nowrap' }}>
                <Button size="sm" variant="ghost" icon={<Pencil size={14} />} onClick={() => setEdit({ ...r, tagsText: (r.tags || []).join(', ') })} aria-label={`Edit ${r.title}`}>Edit</Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setDel(r)} aria-label={`Delete ${r.title}`}>Delete</Button></div></td>
            </tr>))}</tbody></table></div>
      )}
      <Pagination page={page} totalPages={data?.pagination?.totalPages} onChange={setPage} />
      <Modal open={!!edit} title="Edit material" onClose={() => setEdit(null)}>
        {edit && <form onSubmit={saveEdit}>
          <Input label="Title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} required />
          <Input as="textarea" label="Description" value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
          <Input label="Tags" value={edit.tagsText} onChange={(e) => setEdit({ ...edit, tagsText: e.target.value })} hint="Separate with commas" />
          <div className="row"><Button type="submit" loading={busy} disabled={!edit.title.trim()}>Save changes</Button><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button></div></form>}
      </Modal>
      <Modal open={!!del} title="Delete this material?" onClose={() => setDel(null)}>
        <p className="muted">“{del?.title}” will be permanently removed. This cannot be undone.</p>
        <div className="row"><Button variant="danger" loading={busy} onClick={confirmDelete}>Delete material</Button><Button variant="ghost" onClick={() => setDel(null)}>Keep it</Button></div>
      </Modal>
    </div>
  );
}
