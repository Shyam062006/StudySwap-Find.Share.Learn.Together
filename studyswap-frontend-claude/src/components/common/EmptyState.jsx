import { Inbox } from 'lucide-react';
import Button from './Button';
export default function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="empty"><Icon size={34} aria-hidden="true" /><h3>{title}</h3>{text && <p className="muted">{text}</p>}
      {action && <Button to={action.to} onClick={action.onClick} variant={action.variant || 'primary'}>{action.label}</Button>}
    </div>
  );
}
export function ErrorState({ error, onRetry }) {
  return (
    <div className="alert" role="alert"><strong>Something went wrong.</strong> <span>{error?.message || 'Please try again.'}</span>
      {onRetry && <div style={{ marginTop: '.6rem' }}><Button size="sm" variant="ghost" onClick={onRetry}>Retry</Button></div>}
    </div>
  );
}
