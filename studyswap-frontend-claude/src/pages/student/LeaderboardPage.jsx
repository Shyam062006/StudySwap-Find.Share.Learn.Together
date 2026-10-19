import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { useFetch } from '../../hooks/useFetch';
import EmptyState, { ErrorState } from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => userService.leaderboard(), []);
  const rows = data?.data || [];

  const getRankBadge = (rank) => {
    if (rank === 1) return <span style={{ fontSize: '1.25rem', marginRight: '4px' }}>🥇</span>;
    if (rank === 2) return <span style={{ fontSize: '1.25rem', marginRight: '4px' }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: '1.25rem', marginRight: '4px' }}>🥉</span>;
    return <span style={{ fontWeight: 700, color: 'var(--text2)', marginRight: '6px' }}>#{rank}</span>;
  };

  return (
    <div className="stack">
      <div className="page-head">
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <Trophy size={28} className="red" /> Student Leaderboard
        </h1>
        <p>Real-time rankings based on student contributions and ratings.</p>
      </div>
      {loading ? <Loader /> : error ? <ErrorState error={error} onRetry={reload} /> : !rows.length ? (
        <EmptyState title="No contributors yet" text="Upload study materials to earn points and climb the leaderboard." action={{ label: 'Upload material', to: '/app/upload' }} />
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>College & Branch</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => {
                const isMe = user && (String(u._id) === String(user._id) || String(u.userId) === String(user._id));
                const rankNum = u.rank ?? i + 1;
                return (
                  <tr key={u._id || i} style={isMe ? { background: 'rgba(239, 35, 60, 0.08)' } : {}}>
                    <td className="lb-rank">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getRankBadge(rankNum)}
                        <span style={{ fontWeight: 800 }}>{rankNum}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ fontWeight: 700 }}>{u.name}</span>
                        {isMe && <span className="badge badge-red" style={{ fontSize: '.68rem', padding: '1px 6px' }}>You</span>}
                      </div>
                    </td>
                    <td>
                      <span className="muted" style={{ fontSize: '.85rem' }}>
                        {u.college || 'Engineering College'} {u.branch ? `• ${u.branch} Sem ${u.semester || 5}` : ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary, #EF233C)' }}>
                        {u.contributionPoints ?? 0}
                      </span>
                      <span className="muted" style={{ fontSize: '.75rem', marginLeft: '3px' }}>pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
