import { Star } from 'lucide-react';
export default function RatingStars({ value = 0, onChange, size = 18, disabled }) {
  const interactive = typeof onChange === 'function';
  return (
    <span className="stars" role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${Number(value).toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= Math.round(value);
        const icon = <Star size={size} className={on ? 'on' : ''} fill={on ? 'currentColor' : 'none'} />;
        return interactive
          ? <button key={n} type="button" disabled={disabled} role="radio" aria-checked={n === Math.round(value)} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className={on ? 'on' : ''}>{icon}</button>
          : <span key={n} className={on ? 'on' : ''} style={{ color: on ? 'var(--warn)' : 'var(--text2)', lineHeight: 0 }}>{icon}</span>;
      })}
    </span>
  );
}
