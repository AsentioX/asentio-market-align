import { useState } from 'react';
import { Plus, Target, ChevronDown, ChevronUp, Trash2, TrendingUp, Sparkles, TreePine } from 'lucide-react';
import { useWOBuddyGoals, usePerformanceDrivers } from '@/hooks/useWOBuddyGoals';
import {
  GOAL_CATEGORIES, METRICS, PERFORMANCE_DRIVERS, GOAL_TEMPLATES,
  getGoalStatusColor, getCategoryConfig, generateInsights,
} from './goalMappings';

const GoalsPage = () => {
  const { goals, loading, createGoal, updateGoal, deleteGoal, isAuthenticated } = useWOBuddyGoals();
  const drivers = usePerformanceDrivers();
  const [showCreate, setShowCreate] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('performance');
  const [newMetric, setNewMetric] = useState('reps');
  const [newTarget, setNewTarget] = useState(0);
  const [newTimeframe, setNewTimeframe] = useState('');
  const [newDrivers, setNewDrivers] = useState<string[]>([]);

  const insights = generateInsights(goals);
  const metricUnit = METRICS.find(m => m.id === newMetric)?.unit || '';

  const handleCreate = async () => {
    if (!newName || newTarget <= 0) return;
    await createGoal({
      name: newName, category: newCategory, metric: newMetric,
      target_value: newTarget, timeframe: newTimeframe || undefined, drivers: newDrivers,
    });
    setShowCreate(false);
    setNewName(''); setNewTarget(0); setNewDrivers([]); setNewTimeframe('');
  };

  const handleTemplate = (t: typeof GOAL_TEMPLATES[0]) => {
    setNewName(t.name);
    setNewCategory(t.category);
    setNewMetric(t.metric);
    setNewTarget(t.target);
    setNewDrivers(t.drivers);
    setShowCreate(true);
  };

  const toggleDriver = (name: string) => {
    setNewDrivers(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Target className="w-12 h-12 text-white/20" />
        <h2 className="text-lg font-bold">Sign in to set goals</h2>
        <p className="text-sm text-white/40">Create an account to track your goals and get coaching insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Goals</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTree(!showTree)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showTree ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
            <TreePine className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCreate(!showCreate)}
            className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Smart Insights */}
      {goals.length > 0 && (
        <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08] space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Coaching Insights</span>
          </div>
          {insights.slice(0, 3).map((insight, i) => (
            <p key={i} className="text-sm text-white/70">{insight}</p>
          ))}
        </div>
      )}

      {/* Goal Tree Visualization */}
      {showTree && goals.length > 0 && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] rounded-2xl p-4 border border-white/[0.06] space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
            <TreePine className="w-3.5 h-3.5" /> Goal Tree
          </h3>
          {goals.map(goal => {
            const cat = getCategoryConfig(goal.category);
            const pct = goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0;
            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-sm font-medium flex-1 truncate">{goal.name}</span>
                  <span className="text-xs text-emerald-400 font-mono">{pct}%</span>
                </div>
                {goal.drivers.length > 0 && (
                  <div className="ml-7 space-y-1">
                    {goal.drivers.map(d => {
                      const driverInfo = PERFORMANCE_DRIVERS.find(pd => pd.name === d);
                      return (
                        <div key={d} className="flex items-center gap-1.5 text-[11px] text-white/40">
                          <div className="w-3 h-px bg-white/10" />
                          <span>{driverInfo?.icon || '⚡'}</span>
                          <span>{d}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Form */}
      {showCreate && (
        <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold">Create Goal</h3>

          {/* Quick templates */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Quick Start</label>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_TEMPLATES.slice(0, 4).map((t, i) => (
                <button key={i} onClick={() => handleTemplate(t)}
                  className="text-[10px] px-2.5 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors border border-white/5">
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Goal Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Run 5K in under 25 min"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/30" />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Category</label>
            <div className="grid grid-cols-5 gap-1.5">
              {GOAL_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setNewCategory(c.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-medium transition-all border ${
                    newCategory === c.id ? `bg-gradient-to-b ${c.bg} ${c.border} ${c.color}` : 'bg-white/[0.03] border-white/5 text-white/30'
                  }`}>
                  <span className="text-base">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metric + Target */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Metric</label>
              <select value={newMetric} onChange={e => setNewMetric(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/30 appearance-none">
                {METRICS.map(m => <option key={m.id} value={m.id} className="bg-[#1a1a2e]">{m.label} ({m.unit})</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Target ({metricUnit})</label>
              <input type="number" value={newTarget || ''} onChange={e => setNewTarget(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/30 [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Timeframe (optional)</label>
            <input value={newTimeframe} onChange={e => setNewTimeframe(e.target.value)}
              placeholder="e.g. 12 weeks"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/30" />
          </div>

          {/* Performance Drivers */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Performance Drivers</label>
            <div className="flex flex-wrap gap-1.5">
              {PERFORMANCE_DRIVERS.map(d => (
                <button key={d.name} onClick={() => toggleDriver(d.name)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                    newDrivers.includes(d.name) ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-white/40'
                  }`}>
                  <span>{d.icon}</span> {d.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleCreate} disabled={!newName || newTarget <= 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100">
            Create Goal
          </button>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="text-center text-white/30 py-10 text-sm">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <Target className="w-8 h-8 text-white/15" />
          </div>
          <p className="text-sm text-white/40">No goals yet</p>
          <button onClick={() => setShowCreate(true)} className="text-xs text-emerald-400 font-medium">
            Create your first goal →
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {goals.map(goal => {
            const cat = getCategoryConfig(goal.category);
            const statusCfg = getGoalStatusColor(goal.status);
            const pct = goal.target_value > 0 ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100) : 0;
            const metric = METRICS.find(m => m.id === goal.metric);
            const isExpanded = expandedGoal === goal.id;

            return (
              <div key={goal.id}
                className={`bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl border border-white/[0.08] overflow-hidden transition-all`}>
                <button onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  className="w-full p-4 flex items-center gap-3 text-left">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center text-lg flex-shrink-0 border ${cat.border}`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{goal.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text} font-medium flex-shrink-0`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-white/40 font-mono w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                    {/* Progress update */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">Progress</span>
                      <span className="text-xs text-white/60 font-medium">
                        {goal.current_value} / {goal.target_value} {metric?.unit || ''}
                      </span>
                    </div>

                    {/* Update current value */}
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue={goal.current_value}
                        onBlur={e => {
                          const val = Number(e.target.value);
                          const newStatus = val >= goal.target_value ? 'achieved' : val >= goal.target_value * 0.6 ? 'on_track' : 'at_risk';
                          updateGoal(goal.id, { current_value: val, status: newStatus });
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 [&::-webkit-inner-spin-button]:appearance-none" />
                      <span className="text-xs text-white/30">{metric?.unit}</span>
                    </div>

                    {/* Drivers */}
                    {goal.drivers.length > 0 && (
                      <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Performance Drivers</span>
                        <div className="flex flex-wrap gap-1.5">
                          {goal.drivers.map(d => {
                            const driverInfo = PERFORMANCE_DRIVERS.find(pd => pd.name === d);
                            return (
                              <span key={d} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-[10px] text-white/50 border border-white/5">
                                {driverInfo?.icon} {d}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {goal.timeframe && (
                      <p className="text-[10px] text-white/30">Timeframe: {goal.timeframe}</p>
                    )}

                    <button onClick={() => deleteGoal(goal.id)}
                      className="flex items-center gap-1.5 text-[11px] text-red-400/60 hover:text-red-400 transition-colors mt-1">
                      <Trash2 className="w-3 h-3" /> Remove Goal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
