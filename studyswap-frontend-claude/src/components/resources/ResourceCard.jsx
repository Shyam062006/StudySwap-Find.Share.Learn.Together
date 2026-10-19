import { Link } from 'react-router-dom';
import { Bookmark, Download } from 'lucide-react';
import RatingStars from './RatingStars';
import { formatDate } from '../../utils/formatDate';

export default function ResourceCard({ resource: r, onToggleBookmark }) {
  const ext = (r.fileType || '').replace('.', '').slice(0, 4).toUpperCase() || 'FILE';
  return (
    <article className="card rcard">
      <div className="row row-between" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
        <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <span className="filetype" aria-label={`File type ${ext}`}>{ext}</span>
          <div><h3><Link to={`/app/materials/${r._id}`}>{r.title}</Link></h3><span className="muted" style={{ fontSize: '.85rem' }}>{r.subject}</span></div>
        </div>
        {onToggleBookmark && (
          <button className="bm" aria-pressed={!!r.isBookmarked} aria-label={r.isBookmarked ? `Remove ${r.title} from saved` : `Save ${r.title}`} onClick={() => onToggleBookmark(r)}>
            <Bookmark size={16} fill={r.isBookmarked ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="meta">
        {r.resourceType && <span className="badge badge-red">{r.resourceType}</span>}
        {r.semester && <span className="badge">Semester {r.semester}</span>}
        {r.unit && <span className="badge">Unit {r.unit}</span>}
      </div>
      <div className="foot">
        <span>{r.uploader?.name || 'Student'} · {formatDate(r.createdAt)}</span>
        <span className="row" style={{ gap: '.6rem' }}>
          <span className="row" style={{ gap: '.3rem' }}><RatingStars value={r.averageRating || 0} size={13} />{(r.averageRating || 0).toFixed(1)}</span>
          <span className="row" style={{ gap: '.2rem' }} title="Downloads"><Download size={13} />{r.downloadCount ?? 0}</span>
        </span>
      </div>
    </article>
  );
}
