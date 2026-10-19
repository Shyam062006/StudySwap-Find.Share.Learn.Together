import { Search } from 'lucide-react';
export default function ResourceSearch({ value, onChange, placeholder = 'Search by title, subject, description or tag' }) {
  return (
    <div className="search" role="search">
      <Search size={18} aria-hidden="true" />
      <label className="sr-only" htmlFor="hub-search">Search materials</label>
      <input id="hub-search" className="input" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
