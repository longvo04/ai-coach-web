import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { listProcesses, updateProcess, deleteProcess, createProcess } from '../api/processes';
import { useAuth } from '../hooks/useAuth';

function computeProgress(goal) {
  const allRoutes = (goal.metadata || []).flatMap(m => m.route || []);
  const total = allRoutes.reduce((a, r) => a + (Number(r.percentage) || 0), 0) || 1;
  const done = allRoutes.filter(r => r.done).reduce((a, r) => a + (Number(r.percentage) || 0), 0);
  return Math.round((done / total) * 100);
}

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

function cloneGoals(goals) {
  return goals.map(goal => ({
    ...goal,
    metadata: goal.metadata?.map(m => ({
      ...m,
      route: m.route?.map(r => ({ ...r })) || [],
    })) || [],
  }));
}

function getGoalSummary(goal) {
  const metadataGoal = goal.metadata?.find(m => m.goal)?.goal;
  return metadataGoal || goal.goal || '';
}

export default function Goals() {
  const { user } = useAuth();
  const location = useLocation();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    (async () => {
      // If navigated with a freshly generated plan, save it
      const plan = location.state?.plan;
      if (plan && user?.id) {
        const payload = {
          goal: plan[0]?.goal || '',
          metadata: plan.map(g => ({
            ...(g.goal ? { goal: g.goal } : {}),
            big_title: g.big_title,
            route: (g.route || []).map(r => ({
              small_title: r.small_title,
              percentage: Number(r.percentage || r.weight) || 0,
              description: r.description,
              deadline: r.deadline,
              done: r.done || false,
            })),
          })),
        };
        try { await createProcess(user.id, payload); } catch { /* noop */ }
      }
      setLoading(true);
      try {
        if (user?.id) {
          const data = await listProcesses(user.id);
          setProcesses(normalizeGoals(data.result));
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    setExpanded(prev => {
      const next = { ...prev };
      processes.forEach(goal => {
        if (!(goal.id in next)) {
          next[goal.id] = true;
        }
      });
      return next;
    });
  }, [processes]);

  const toggleExpand = (goalId) => {
    setExpanded(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const toggleTask = async (goalId, metadataIdx, routeIdx) => {
    const prevState = cloneGoals(processes);
    const updated = cloneGoals(processes);
    const goal = updated.find(g => g.id === goalId);
    if (!goal) return;
    const metadata = goal.metadata?.[metadataIdx];
    const route = metadata?.route?.[routeIdx];
    if (!route || route.done) return;

    const confirmed = window.confirm('Mark this step as completed? This action cannot be undone.');
    if (!confirmed) return;

    route.done = true;
    setProcesses(updated);
    try {
      await updateProcess(goalId, { metadata: goal.metadata });
    } catch {
      setProcesses(prevState);
    }
  };

  const removeGoal = async (goalId) => {
    setProcesses(prev => prev.filter(g => g.id !== goalId));
    try { await deleteProcess(goalId); } catch { 
      // Reload on error
      if (user?.id) {
        const data = await listProcesses(user.id);
        setProcesses(normalizeGoals(data.result));
      }
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Your Goals</h1>
      {processes.length === 0 && <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-5">No goals yet.</div>}
      {processes.map((goal) => {
        const progress = computeProgress(goal);
        const goalSummary = getGoalSummary(goal);
        return (
          <div key={goal.id} className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <button
                className="mt-1 text-gray-500 hover:text-gray-700 transition"
                onClick={() => toggleExpand(goal.id)}
                aria-label={expanded[goal.id] ? 'Collapse goal details' : 'Expand goal details'}
              >
                {expanded[goal.id] ? '▾' : '▸'}
              </button>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-3 bg-gray-200 rounded-full flex-1 max-w-md overflow-hidden">
                    <div className="h-3 bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{progress}%</span>
                </div>
                {goalSummary && (
                  <div className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                    {goalSummary}
                  </div>
                )}
                {goal.dateOfUpdate && (
                  <div className="text-xs text-gray-500">Last updated: {new Date(goal.dateOfUpdate).toLocaleDateString()}</div>
                )}
              </div>
              <button
                className="text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-md px-3 py-1.5 transition-colors text-sm" 
                onClick={() => removeGoal(goal.id)}
              >
                Remove
              </button>
            </div>
            {expanded[goal.id] && (
              <div className="space-y-4">
                {goal.metadata?.map((meta, mi) => (
                  <div key={mi} className="border-l-4 border-blue-400 pl-4">
                    <div className="font-semibold text-lg text-blue-900 mb-3">{meta.big_title}</div>
                    <div className="space-y-2">
                      {meta.route?.map((route, ri) => (
                        <label 
                          key={ri} 
                          className={`flex items-start gap-3 p-3 rounded-md transition-colors ${
                            route.done 
                              ? 'bg-green-50 border border-green-200' 
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <input 
                            className="accent-green-600 mt-1" 
                            type="checkbox" 
                            checked={!!route.done} 
                            onChange={() => toggleTask(goal.id, mi, ri)} 
                            disabled={route.done}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${route.done ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                                {route.small_title}
                              </span>
                              <span className="text-xs text-gray-500">({route.percentage}%)</span>
                            </div>
                            {route.description && (
                              <div className="text-sm text-gray-600 mb-1">{route.description}</div>
                            )}
                            {route.deadline && (
                              <div className="text-xs text-gray-500">
                                Deadline: {new Date(route.deadline).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


