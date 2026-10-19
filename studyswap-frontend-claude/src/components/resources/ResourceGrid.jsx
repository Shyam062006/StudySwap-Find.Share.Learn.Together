import ResourceCard from './ResourceCard';
export default function ResourceGrid({ items, onToggleBookmark }) {
  return <div className="grid grid-resources">{items.map((r) => <ResourceCard key={r._id} resource={r} onToggleBookmark={onToggleBookmark} />)}</div>;
}
