import { X } from 'lucide-react';
export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toasts" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
          <span>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}
