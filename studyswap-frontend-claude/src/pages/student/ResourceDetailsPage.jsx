import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bookmark, Download, Flag, FileX } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { bookmarkService } from '../../services/bookmarkService';
import { ratingService } from '../../services/ratingService';
import { reportService } from '../../services/reportService';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import RatingStars from '../../components/resources/RatingStars';
import ReviewList from '../../components/resources/ReviewList';
import { formatDate } from '../../utils/formatDate';
import { formatFileSize } from '../../utils/formatFileSize';

const REASONS = ['Incorrect or misleading content', 'Copyright concern', 'Inappropriate content', 'Spam or duplicate', 'Other'];

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => resourceService.get(id), [id]);
  const reviewsQ = useFetch(() => ratingService.reviews(id), [id]);
  const [r, setR] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState('');
  const [report, setReport] = useState(null);

  useEffect(() => { if (data) setR(data.data || data); }, [data]);
  useEffect(() => { if (reviewsQ.data) setReviews(reviewsQ.data.data || []); }, [reviewsQ.data]);

  if (loading) return <Loader />;
  if (error?.status === 404) return <EmptyState icon={FileX} title="Material not found" text="It may have been removed or is still awaiting approval." action={{ label: 'Back to Material Hub', to: '/app/materials' }} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!r) return null;

  const run = async (key, fn, ok) => { setBusy(key); try { await fn(); if (ok) toast.success(ok); } catch (e) { toast.error(e.message); } finally { setBusy(''); } };
  const download = () => run('dl', async () => { await resourceService.download(r._id, r.title); setR((x) => ({ ...x, downloadCount: (x.downloadCount || 0) + 1 })); });
  const bookmark = () => run('bm', async () => { if (r.isBookmarked) await bookmarkService.remove(r._id); else await bookmarkService.add(r._id); setR((x) => ({ ...x, isBookmarked: !x.isBookmarked })); }, r.isBookmarked ? 'Removed from saved.' : 'Saved.');
  const rate = (n) => run('rate', async () => { const res = await ratingService.rate(r._id, n); const d = res?.data || {}; setR((x) => ({ ...x, myRating: n, averageRating: d.averageRating ?? x.averageRating })); }, 'Rating saved.');
  const submitReview = (e) => { e.preventDefault(); run('rv', async () => { const res = await ratingService.addReview(r._id, comment.trim()); if (res?.data) setReviews((l) => [res.data, ...l]); else reviewsQ.reload(); setComment(''); }, 'Review posted.'); };
  const editReview = async (rid, text) => { try { await ratingService.editReview(rid, text); setReviews((l) => l.map((x) => (x._id === rid ? { ...x, comment: text } : x))); toast.success('Review updated.'); } catch (e) { toast.error(e.message); throw e; } };
  const deleteReview = async (rid) => { try { await ratingService.deleteReview(rid); setReviews((l) => l.filter((x) => x._id !== rid)); toast.success('Review deleted.'); } catch (e) { toast.error(e.message); } };
  const submitReport = (e) => { e.preventDefault(); run('rp', async () => { await reportService.create(r._id, { reason: report.reason, details: report.details.trim() }); setReport(null); }, 'Report submitted. Thank you for your feedback.'); };

  const formatFileType = (ft, fn) => {
    if (fn) {
      const ext = fn.split('.').pop()?.toUpperCase();
      if (ext && ext.length <= 5) return ext;
    }
    if (!ft) return 'PDF';
    const f = String(ft).toLowerCase();
    if (f.includes('wordprocessingml') || f.includes('msword') || f.includes('docx')) return 'DOCX';
    if (f.includes('presentationml') || f.includes('powerpoint') || f.includes('pptx')) return 'PPTX';
    if (f.includes('pdf')) return 'PDF';
    if (f.includes('png')) return 'PNG';
    if (f.includes('jpeg') || f.includes('jpg')) return 'JPG';
    if (ft.length <= 5) return ft.toUpperCase();
    return ft.split('/').pop().toUpperCase().slice(0, 8);
  };

  const meta = [['Subject', r.subject], ['College', r.college], ['Degree', r.degree], ['Branch', r.branch], ['Semester', r.semester], ['Unit', r.unit], ['Type', r.resourceType], ['File type', formatFileType(r.fileType, r.originalFilename)], ['File size', formatFileSize(r.fileSize)], ['Uploaded by', r.uploader?.name], ['Uploaded', formatDate(r.createdAt)], ['Downloads', r.downloadCount ?? 0]];

  return (
    <div className="stack">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>Back</Button>
      <div className="detail-grid">
        <div className="stack">
          <div className="card"><h1 style={{ fontSize: '1.8rem' }}>{r.title}</h1>
            <div className="row" style={{ marginBottom: '1rem' }}><RatingStars value={r.averageRating || 0} /><span className="muted">{(r.averageRating || 0).toFixed(1)} average</span></div>
            <p>{r.description}</p>
            {!!r.tags?.length && <div className="row">{r.tags.map((t) => <span key={t} className="badge">#{t}</span>)}</div>}</div>
          <div className="card"><h2 style={{ fontSize: '1.2rem' }}>Reviews</h2>
            <form onSubmit={submitReview} style={{ marginBottom: '1rem' }}>
              <Input as="textarea" label="Write a review" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
              <Button type="submit" size="sm" loading={busy === 'rv'} disabled={!comment.trim()}>Post review</Button></form>
            {reviewsQ.loading ? <Loader /> : reviewsQ.error ? <ErrorState error={reviewsQ.error} onRetry={reviewsQ.reload} /> : <ReviewList reviews={reviews} currentUserId={user?._id} onEdit={editReview} onDelete={deleteReview} />}</div>
        </div>
        <aside className="stack">
          <div className="card stack">
            <Button block icon={<Download size={16} />} loading={busy === 'dl'} onClick={download}>Download</Button>
            <Button block variant="ghost" icon={<Bookmark size={16} fill={r.isBookmarked ? 'currentColor' : 'none'} />} loading={busy === 'bm'} onClick={bookmark}>{r.isBookmarked ? 'Saved' : 'Save'}</Button>
            <Button block variant="ghost" icon={<Flag size={16} />} onClick={() => setReport({ reason: REASONS[0], details: '' })}>Report</Button>
            <div><span style={{ fontWeight: 600, fontSize: '.875rem' }}>Your rating</span><div><RatingStars value={r.myRating || 0} onChange={rate} disabled={busy === 'rate'} size={26} /></div></div>
          </div>
          <dl className="card kv">{meta.map(([k, v]) => v !== undefined && v !== '' && v !== null && <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </aside>
      </div>
      <Modal open={!!report} title="Report this material" onClose={() => setReport(null)}>
        {report && <form onSubmit={submitReport}>
          <Select label="Reason" value={report.reason} onChange={(e) => setReport({ ...report, reason: e.target.value })} options={REASONS} />
          <Input as="textarea" label="Details" value={report.details} onChange={(e) => setReport({ ...report, details: e.target.value })} />
          <div className="row"><Button type="submit" loading={busy === 'rp'}>Send report</Button><Button variant="ghost" onClick={() => setReport(null)}>Cancel</Button></div></form>}
      </Modal>
    </div>
  );
}
