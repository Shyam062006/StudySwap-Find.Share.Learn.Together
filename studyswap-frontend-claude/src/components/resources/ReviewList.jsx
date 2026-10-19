import { useState } from 'react';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatDate';

export default function ReviewList({ reviews, currentUserId, onEdit, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  if (!reviews.length) return <p className="muted">No reviews yet. Be the first to share how this material helped.</p>;
  const save = async (id) => {
    setBusy(true);
    try { await onEdit(id, text); setEditing(null); } finally { setBusy(false); }
  };
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="stack">
      {reviews.map((rv) => {
        const mine = rv.user?._id === currentUserId;
        return (
          <li key={rv._id} className="card">
            <div className="row row-between"><strong>{rv.user?.name || 'Student'}</strong><span className="muted" style={{ fontSize: '.8rem' }}>{formatDate(rv.createdAt)}</span></div>
            {editing === rv._id ? (
              <div className="stack" style={{ marginTop: '.5rem' }}>
                <label className="sr-only" htmlFor={`edit-${rv._id}`}>Edit review</label>
                <textarea id={`edit-${rv._id}`} className="input" value={text} onChange={(e) => setText(e.target.value)} />
                <div className="row"><Button size="sm" loading={busy} onClick={() => save(rv._id)} disabled={!text.trim()}>Save review</Button><Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
              </div>
            ) : <p style={{ margin: '.5rem 0' }}>{rv.comment}</p>}
            {mine && editing !== rv._id && (
              <div className="row"><Button size="sm" variant="ghost" onClick={() => { setEditing(rv._id); setText(rv.comment); }}>Edit</Button><Button size="sm" variant="danger" onClick={() => onDelete(rv._id)}>Delete</Button></div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
