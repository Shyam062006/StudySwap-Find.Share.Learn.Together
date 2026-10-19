import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} icon={<ChevronLeft size={16} />}>Previous</Button>
      <span className="muted" aria-live="polite">Page {page} of {totalPages}</span>
      <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next<ChevronRight size={16} /></Button>
    </nav>
  );
}
