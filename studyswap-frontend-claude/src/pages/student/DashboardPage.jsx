import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Bookmark, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { resourceService } from '../../services/resourceService';
import { bookmarkService } from '../../services/bookmarkService';
import { useFetch } from '../../hooks/useFetch';
import { useBookmarkToggle } from '../../hooks/useBookmarkToggle';
import ResourceGrid from '../../components/resources/ResourceGrid';
import Button from '../../components/common/Button';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import { CardSkeletons } from '../../components/common/Skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const { data, loading, error, reload } = useFetch(async () => {
    const [t, r, mine, saved] = await Promise.all([
      resourceService.list({ sort: 'downloads', limit: 4 }),
      resourceService.list({ sort: 'recent', limit: 4 }),
      resourceService.mine({ limit: 1 }),
      bookmarkService.list({ limit: 1 }),
    ]);
    return { t, r, mine, saved };
  }, []);
  useEffect(() => { if (data) { setTrending(data.t.data || []); setRecent(data.r.data || []); } }, [data]);
  const toggleT = useBookmarkToggle(setTrending);
  const toggleR = useBookmarkToggle(setRecent);

  const total = (r) => r?.pagination?.total ?? r?.data?.length ?? 0;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const subjects = Object.entries([...trending, ...recent].reduce((m, r) => { if (r.subject) m[r.subject] = (m[r.subject] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className="stack">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>{greet}, {user?.name?.split(' ')[0]}</h1><p>Find the right material and keep your learning moving.</p></div>
      <form className="hub-top" onSubmit={(e) => { e.preventDefault(); navigate(`/app/materials?q=${encodeURIComponent(q)}`); }}>
        <div className="search"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="dash-q">Search materials</label><input id="dash-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the Material Hub" /></div>
        <Button type="submit">Search</Button>
      </form>
      {error ? <ErrorState error={error} onRetry={reload} /> : (
        <div className="grid grid-stats">
          {[['Total resources', total(data?.t)], ['My uploads', total(data?.mine)], ['My saved materials', total(data?.saved)], ['Contribution points', user?.contributionPoints ?? 0]].map(([l, n]) => (
            <div className="card stat" key={l}><strong>{loading ? '—' : n}</strong><span>{l}</span></div>))}
        </div>
      )}
      <div className="row"><Button to="/app/upload" icon={<Upload size={16} />}>Upload material</Button><Button to="/app/saved" variant="ghost" icon={<Bookmark size={16} />}>Saved materials</Button></div>
      <section><h2 style={{ fontSize: '1.3rem' }}>Trending resources</h2>
        {loading ? <CardSkeletons count={4} /> : trending.length ? <ResourceGrid items={trending} onToggleBookmark={toggleT} /> : <EmptyState title="No resources yet" text="Approved materials will appear here." action={{ label: 'Upload the first one', to: '/app/upload' }} />}</section>
      <section><h2 style={{ fontSize: '1.3rem' }}>Recently uploaded</h2>
        {loading ? <CardSkeletons count={4} /> : recent.length ? <ResourceGrid items={recent} onToggleBookmark={toggleR} /> : <EmptyState title="Nothing uploaded yet" />}</section>
      <section><h2 style={{ fontSize: '1.3rem' }}>Popular subjects</h2>
        {subjects.length ? <div className="row">{subjects.map(([s, n]) => <Button key={s} variant="ghost" size="sm" to={`/app/materials?subject=${encodeURIComponent(s)}`}>{s} ({n})</Button>)}</div> : <p className="muted">Subjects will show up as materials are shared.</p>}</section>
      <section className="card"><h2 style={{ fontSize: '1.3rem' }}>Contribution overview</h2>
        <p className="muted" style={{ margin: 0 }}>You have <strong>{user?.contributionPoints ?? 0}</strong> contribution points. Upload materials and get them approved to earn more. <Button to="/app/leaderboard" variant="ghost" size="sm">See leaderboard</Button></p></section>
    </div>
  );
}
