import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Award, ArrowUpRight, Dumbbell, Footprints, Activity, Trophy } from 'lucide-react';
import { useWOBuddyStats, type PersonalRecord } from '@/hooks/useWOBuddyStats';

const PR_PALETTE = [
  { color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/10', iconColor: 'text-blue-300' },
  { color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/10', iconColor: 'text-orange-300' },
  { color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/10', iconColor: 'text-purple-300' },
  { color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/10', iconColor: 'text-amber-300' },
  { color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/10', iconColor: 'text-emerald-300' },
  { color: 'from-pink-500/20 to-pink-600/5', border: 'border-pink-500/10', iconColor: 'text-pink-300' },
];

function PRIcon({ pr, className }: { pr: PersonalRecord; className?: string }) {
  if (pr.type === 'cardio') return <Footprints className={className} />;
  if (pr.type === 'strength') return <Dumbbell className={className} />;
  return <Activity className={className} />;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const ProgressPage = () => {
  const { weeklyTrend, dailyBreakdown, personalRecords, loading } = useWOBuddyStats();

  const currentWeekScore = weeklyTrend.length > 0 ? weeklyTrend[weeklyTrend.length - 1].score : 0;
  const prevWeekScore = weeklyTrend.length > 1 ? weeklyTrend[weeklyTrend.length - 2].score : 0;
  const changePercent = prevWeekScore > 0
    ? Math.round(((currentWeekScore - prevWeekScore) / prevWeekScore) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Progress</h2>

      {/* Summary stat */}
      <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 rounded-2xl p-5 border border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-stone-700 uppercase tracking-wider">This Week</p>
            <p className="text-3xl font-bold mt-1">{currentWeekScore.toLocaleString()}</p>
            <p className="text-xs text-stone-700 mt-0.5">total points</p>
          </div>
          {prevWeekScore > 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full ${
              changePercent >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              <ArrowUpRight className={`w-4 h-4 ${changePercent < 0 ? 'rotate-90' : ''}`} />
              {Math.abs(changePercent)}%
            </div>
          )}
        </div>
      </div>

      {/* Weekly score chart */}
      <div className="bg-gradient-to-br from-stone-900/[0.05] to-stone-900/[0.03] rounded-2xl p-4 border border-stone-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">Weekly Score Trend</span>
        </div>
        {weeklyTrend.length === 0 ? (
          <p className="text-xs text-stone-700 py-8 text-center">No workout history yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyTrend}>
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
              <Area type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2} fill="url(#scoreGradient)" dot={{ r: 3, fill: '#34d399' }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#faf8f5' }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Daily breakdown bar chart */}
      <div className="bg-gradient-to-br from-stone-900/[0.05] to-stone-900/[0.03] rounded-2xl p-4 border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">This Week Breakdown</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-stone-700"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Strength</span>
            <span className="flex items-center gap-1 text-[10px] text-stone-700"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Cardio</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyBreakdown}>
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
          <h3 className="text-sm font-semibold">Personal Bests</h3>
        </div>

        {loading ? (
          <p className="text-xs text-stone-700">Loading…</p>
        ) : personalRecords.length === 0 ? (
          <div className="bg-gradient-to-br from-stone-900/[0.05] to-stone-900/[0.03] rounded-2xl p-6 border border-stone-200 text-center">
            <Trophy className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="text-xs text-stone-700">Log a workout to set your first personal best.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {personalRecords.map((pr, i) => {
              const palette = PR_PALETTE[i % PR_PALETTE.length];
              return (
                <div
                  key={`${pr.exerciseName}-${pr.achievedAt}`}
                  className={`bg-gradient-to-br ${palette.color} rounded-2xl p-4 border ${palette.border} text-center`}
                >
                  <PRIcon pr={pr} className={`w-7 h-7 mx-auto mb-2 ${palette.iconColor}`} />
                  <p className="text-lg font-bold leading-tight">{pr.value}</p>
                  <p className="text-[11px] text-stone-700 mt-1 truncate">{pr.exerciseName}</p>
                  <p className="text-[10px] text-stone-700 mt-0.5">{pr.label}</p>
                  <p className="text-[10px] text-stone-800 mt-1">{formatDate(pr.achievedAt)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
