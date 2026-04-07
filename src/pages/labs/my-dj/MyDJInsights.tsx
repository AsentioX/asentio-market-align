import { TrendingUp, Clock, Heart, Music2, Target } from 'lucide-react';

// Simulated historical data
const weeklyData = [
  { day: 'Mon', sessions: 2, minutes: 45, avgAlignment: 72 },
  { day: 'Tue', sessions: 1, minutes: 30, avgAlignment: 65 },
  { day: 'Wed', sessions: 3, minutes: 68, avgAlignment: 81 },
  { day: 'Thu', sessions: 0, minutes: 0, avgAlignment: 0 },
  { day: 'Fri', sessions: 2, minutes: 52, avgAlignment: 78 },
  { day: 'Sat', sessions: 1, minutes: 25, avgAlignment: 85 },
  { day: 'Sun', sessions: 0, minutes: 0, avgAlignment: 0 },
];

const modeBreakdown = [
  { mode: 'Focus', pct: 38, color: 'bg-violet-500' },
  { mode: 'Calm', pct: 25, color: 'bg-sky-500' },
  { mode: 'Endurance', pct: 20, color: 'bg-emerald-500' },
  { mode: 'Energize', pct: 12, color: 'bg-amber-500' },
  { mode: 'Recovery', pct: 5, color: 'bg-indigo-400' },
];

const MyDJInsights = () => {
  const totalMinutes = weeklyData.reduce((s, d) => s + d.minutes, 0);
  const totalSessions = weeklyData.reduce((s, d) => s + d.sessions, 0);
  const avgAlignment = Math.round(weeklyData.filter(d => d.avgAlignment > 0).reduce((s, d) => s + d.avgAlignment, 0) / weeklyData.filter(d => d.avgAlignment > 0).length);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Your Week</h2>
        <p className="text-xs text-white/40">Adaptive music insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Clock, label: 'Minutes', value: totalMinutes, color: 'text-violet-400' },
          { icon: Music2, label: 'Sessions', value: totalSessions, color: 'text-emerald-400' },
          { icon: Target, label: 'Aligned', value: `${avgAlignment}%`, color: 'text-sky-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-white/40">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity */}
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Daily Activity</p>
        <div className="flex items-end gap-1.5 h-24">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-white/5 rounded-t-md overflow-hidden flex-1 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-violet-500 to-purple-400 rounded-t-md transition-all"
                  style={{ height: `${d.minutes > 0 ? Math.max(10, (d.minutes / 70) * 100) : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-white/40">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Breakdown */}
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Mode Usage</p>
        <div className="space-y-2.5">
          {modeBreakdown.map((m) => (
            <div key={m.mode}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-white/70">{m.mode}</span>
                <span className="text-xs text-white/40">{m.pct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${m.color} transition-all`} style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Effectiveness */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <p className="text-xs text-white/50 uppercase tracking-wider">Effectiveness</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-red-400" />
            <div className="flex-1">
              <p className="text-xs text-white/70">Avg HR reduction in Calm mode</p>
              <p className="text-sm font-semibold text-emerald-400">-12 bpm over 15 min</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-violet-400" />
            <div className="flex-1">
              <p className="text-xs text-white/70">Focus session avg duration</p>
              <p className="text-sm font-semibold text-violet-400">32 min (↑ 8% vs last week)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDJInsights;
