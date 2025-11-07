import { useEffect, useMemo, useState } from 'react';
import { listGoalHistory } from '../api/processes';
import { useAuth } from '../hooks/useAuth';

function normalizeGoals(rawGoals) {
  return Array.isArray(rawGoals) ? rawGoals.map(goal => ({
    ...goal,
    metadata: goal.metadata?.map(m => ({
      ...m,
      route: m.route?.map(r => ({
        ...r,
        done: r.done !== undefined ? r.done : false,
      })) || [],
    })) || [],
  })) : [];
}

function computeProgress(goal) {
  const allRoutes = (goal.metadata || []).flatMap(m => m.route || []);
  const total = allRoutes.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) || 1;
  const done = allRoutes.filter(r => r.done).reduce((sum, r) => sum + (Number(r.percentage) || 0), 0);
  return Math.round((done / total) * 100);
}

function getGoalSummary(goal) {
  const metadataGoal = goal.metadata?.find(m => m.goal)?.goal;
  return metadataGoal || goal.goal || '';
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError('');
      try {
        const { result } = await listGoalHistory(user.id);
        const normalized = normalizeGoals(result);
        normalized.sort((a, b) => {
          const dateA = new Date(a.dateOfUpdate || a.createdAt || 0).getTime();
          const dateB = new Date(b.dateOfUpdate || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setHistory(normalized);
      } catch {
        setError('Failed to load goal history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user?.id]);

  useEffect(() => {
    setExpanded(prev => {
      const next = { ...prev };
      history.forEach(goal => {
        if (!(goal.id in next)) {
          next[goal.id] = false;
        }
      });
      return next;
    });
  }, [history]);

  const toggleExpand = (goalId) => {
    setExpanded(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const totalCompleted = useMemo(() => history.reduce((count, goal) => {
    const routes = (goal.metadata || []).flatMap(m => m.route || []);
    return count + routes.filter(r => r.done).length;
  }, 0), [history]);

  if (!user?.id) {
    return <div className="p-6">Please sign in to view history.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading history...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Goal History</h1>
          <p className="text-sm text-gray-600">Track how your plans evolved over time.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-sm text-gray-700">
          <div><span className="font-semibold text-gray-900">Total completions:</span> {totalCompleted}</div>
        </div>
      </div>

      {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">{error}</div>}

      {history.length === 0 && <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-5">No history recorded yet.</div>}

      {history.map(goal => {
        const progress = computeProgress(goal);
        const summary = getGoalSummary(goal);
        return (
          <div key={goal.id} className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 space-y-4">
            <div className="flex flex-wrap items-start gap-4 justify-between">
              <button
                className="mt-1 text-gray-500 hover:text-gray-700 transition"
                onClick={() => toggleExpand(goal.id)}
                aria-label={expanded[goal.id] ? 'Collapse goal details' : 'Expand goal details'}
              >
                {expanded[goal.id] ? '▾' : '▸'}
              </button>
              <div className="flex-1 min-w-[240px] space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-3 bg-gray-200 rounded-full flex-1 overflow-hidden">
                    <div className="h-3 bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{progress}%</span>
                </div>
                {summary && (
                  <div className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                    {summary}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {goal.dateOfUpdate ? `Updated ${new Date(goal.dateOfUpdate).toLocaleString()}` : 'No update timestamp'}
              </div>
            </div>
            {expanded[goal.id] && (
              <div className="space-y-4">
                {goal.metadata?.map((meta, idx) => {
                  const completedRoutes = (meta.route || []).filter(route => route.done);
                  if (completedRoutes.length === 0) return null;
                  return (
                    <div key={idx} className="border-l-4 border-purple-400 pl-4">
                      <div className="font-semibold text-lg text-purple-900 mb-3">{meta.big_title || 'Untitled Phase'}</div>
                      <div className="space-y-2">
                        {completedRoutes.map((route, ri) => (
                          <div
                            key={ri}
                            className="rounded-md border p-3 flex flex-col gap-1 border-green-200 bg-green-50"
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-green-700 line-through">{route.small_title}</span>
                              <span className="text-xs text-gray-500">({route.percentage}% weight)</span>
                              <span className="text-xs uppercase tracking-wide text-green-600 bg-green-100 px-2 py-0.5 rounded">Completed</span>
                            </div>
                            {route.description && <div className="text-sm text-gray-600">{route.description}</div>}
                            {route.deadline && (
                              <div className="text-xs text-gray-500">Deadline: {new Date(route.deadline).toLocaleString()}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
