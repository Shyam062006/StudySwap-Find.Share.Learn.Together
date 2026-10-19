import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import { useBookmarkToggle } from '../../hooks/useBookmarkToggle';
import ResourceSearch from '../../components/resources/ResourceSearch';
import ResourceFilters from '../../components/resources/ResourceFilters';
import ResourceGrid from '../../components/resources/ResourceGrid';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import { CardSkeletons } from '../../components/common/Skeleton';
import { SORT_OPTIONS, PAGE_SIZE } from '../../utils/constants';

const KEYS = ['college', 'degree', 'branch', 'semester', 'subject', 'unit', 'resourceType', 'rating'];

export default function MaterialHubPage() {
  const [params, setParams] = useSearchParams();
  const get = (k) => params.get(k) || '';
  const [search, setSearch] = useState(get('q'));
  const debounced = useDebounce(search, 400);
  const [items, setItems] = useState([]);
  const page = Number(get('page')) || 1;
  const sort = get('sort') || 'relevant';

  const update = (changes) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page'); // any filter change returns to page 1
    return next;
  }, { replace: true });

  useEffect(() => { if (debounced !== get('q')) update({ q: debounced }); /* eslint-disable-next-line */ }, [debounced]);

  const filters = useMemo(() => Object.fromEntries(KEYS.map((k) => [k, params.get(k) || ''])), [params]);
  const query = { q: get('q'), ...filters, sort, page, limit: PAGE_SIZE };
  const { data, loading, error, reload } = useFetch(() => resourceService.list(query), [params.toString()]);
  useEffect(() => { if (data) setItems(data.data || []); }, [data]);
  const toggle = useBookmarkToggle(setItems);
  const pagination = data?.pagination;
  const hasFilters = Object.values(filters).some(Boolean) || get('q');

  return (
    <div className="stack">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Material Hub</h1><p>Every approved study resource, in one place.</p></div>
      <div className="hub-top">
        <ResourceSearch value={search} onChange={setSearch} />
        <div style={{ minWidth: 200 }}><Select label="Sort by" value={sort} onChange={(e) => update({ sort: e.target.value })} options={SORT_OPTIONS} /></div>
      </div>
      <ResourceFilters values={filters} onChange={(k, v) => update({ [k]: v })} onReset={() => { setSearch(''); setParams({}, { replace: true }); }} />
      {pagination && <p className="muted" aria-live="polite">{pagination.total} material{pagination.total === 1 ? '' : 's'} found</p>}
      {loading ? <CardSkeletons count={PAGE_SIZE / 2} /> : error ? <ErrorState error={error} onRetry={reload} />
        : items.length ? <><ResourceGrid items={items} onToggleBookmark={toggle} /><Pagination page={page} totalPages={pagination?.totalPages} onChange={(p) => { update({ page: String(p) }); window.scrollTo({ top: 0 }); }} /></>
        : <EmptyState title={hasFilters ? 'No materials match your search' : 'No materials yet'} text={hasFilters ? 'Try removing a filter or searching with different words.' : 'Be the first to share something useful.'} action={hasFilters ? { label: 'Clear filters', variant: 'ghost', onClick: () => { setSearch(''); setParams({}, { replace: true }); } } : { label: 'Upload material', to: '/app/upload' }} />}
    </div>
  );
}
