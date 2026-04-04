import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Award, ArrowUpRight, Zap } from 'lucide-react';
import { mockProgressData, mockWeeklyTrend } from './mockData';

const personalRecords = [
  { label: 'Max Bench', value: '225 lbs', icon: '🏋️', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/10' },
  { label: 'Longest Run', value: '12.4 km', icon: '🏃', color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/10' },
  { label: 'Most Reps', value: '120', icon: '💪', color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/10' },
  { label: 'Best Day', value: '1,240 pts', icon: '🔥', color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/10' },
];

const ProgressPage = () => {
  const currentWeekScore = mockWeeklyTrend[mockWeeklyTrend.length - 1].score;
  const prevWeekScore = mockWeeklyTrend[mockWeeklyTrend.length - 2].score;
  const changePercent = Math.round(((currentWeekScore - prevWeekScore) / prevWeekScore) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Progress</h2>

      {/* Summary stat */}
      <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 rounded-2xl p-5 border border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">This Week</p>
            <p className="text-3xl font-bold mt-1">{currentWeekScore.toLocaleString()}</p>
            <p className="text-xs text-white/40 mt-0.5">total points</p>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full ${
            changePercent >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            <ArrowUpRight className={`w-4 h-4 ${changePercent < 0 ? 'rotate-90' : ''}`} />
            {Math.abs(changePercent)}%
          </div>
        </div>
      </div>

      {/* Weekly score chart */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">Weekly Score Trend</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={mockWeeklyTrend}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            />
            <Area type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2} fill="url(#scoreGradient)" dot={{ r: 3, fill: '#34d399' }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#0a0a0f' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Daily breakdown bar chart */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">This Week Breakdown</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-white/40"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Strength</span>
            <span className="flex items-center gap-1 text-[10px] text-white/40"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Cardio</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mockProgressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            />
            <Bar dataKey="strength" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
            <Bar dataKey="cardio" stackId="a" fill="#fb923c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Personal records */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold">Personal Records</h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {personalRecords.map((pr) => (
            <div key={pr.label} className={`bg-gradient-to-br ${pr.color} rounded-2xl p-4 border ${pr.border} text-center`}>
              <span className="text-3xl mb-2 block">{pr.icon}</span>
              <p className="text-lg font-bold">{pr.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{pr.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
