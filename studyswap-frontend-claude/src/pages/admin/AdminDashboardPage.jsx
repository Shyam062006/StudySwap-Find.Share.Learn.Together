import { reportService } from '../../services/reportService';
import { useFetch } from '../../hooks/useFetch';
import Loader from '../../components/common/Loader';
import { ErrorState } from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useFetch(() => reportService.stats(), []);
  const s = data?.data || {};
  const cards = [['Total users', s.totalUsers], ['Total resources', s.totalResources], ['Pending resources', s.pendingResources], ['Published resources', s.publishedResources], ['Open reports', s.openReports], ['Downloads', s.totalDownloads]];
  return (
    <div className="stack">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Admin overview</h1><p>Platform activity at a glance.</p></div>
      {loading ? <Loader /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <div className="grid grid-stats">{cards.map(([l, n]) => <div className="card stat" key={l}><strong>{n ?? 0}</strong><span>{l}</span></div>)}</div>
      )}
      <div className="row"><Button to="/admin/resources">Review pending resources</Button><Button to="/admin/reports" variant="ghost">View reports</Button><Button to="/admin/users" variant="ghost">Manage users</Button></div>
    </div>
  );
}
