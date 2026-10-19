import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { bookmarkService } from '../../services/bookmarkService';
import { resourceService } from '../../services/resourceService';
import { useFetch } from '../../hooks/useFetch';
import { useBookmarkToggle } from '../../hooks/useBookmarkToggle';
import { useToast } from '../../contexts/NotificationContext';
import ResourceCard from '../../components/resources/ResourceCard';
import Button from '../../components/common/Button';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import { CardSkeletons } from '../../components/common/Skeleton';

export default function SavedMaterialsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => bookmarkService.list(), []);
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  useEffect(() => { if (data) setItems((data.data || []).map((r) => ({ ...r, isBookmarked: true }))); }, [data]);
  const toggle = useBookmarkToggle(setItems, { removeOnUnsave: true });
  const download = async (r) => {
    setBusyId(r._id);
    try { await resourceService.download(r._id, r.title); } catch (e) { toast.error(e.message); } finally { setBusyId(null); }
  };
  return (
    <div className="stack">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Saved materials</h1><p>Your bookmarked resources.</p></div>
      {loading ? <CardSkeletons count={3} /> : error ? <ErrorState error={error} onRetry={reload} /> : !items.length ? <EmptyState title="Nothing saved yet" text="Tap the bookmark on any material to keep it here." action={{ label: 'Browse Material Hub', to: '/app/materials' }} /> : (
        <div className="grid grid-resources">{items.map((r) => (
          <div key={r._id} className="stack"><ResourceCard resource={r} onToggleBookmark={toggle} />
            <div className="row"><Button size="sm" to={`/app/materials/${r._id}`} variant="ghost">Open details</Button><Button size="sm" icon={<Download size={14} />} loading={busyId === r._id} onClick={() => download(r)}>Download</Button></div></div>))}</div>
      )}
    </div>
  );
}
