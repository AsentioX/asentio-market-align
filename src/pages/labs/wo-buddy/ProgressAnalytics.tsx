import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, Award, Flame, Dumbbell, Footprints, Activity, Trophy,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { useWOBuddyStats, type PersonalRecord, type ExerciseTrendMeta } from '@/hooks/useWOBuddyStats';

const chartTooltipStyle = {
  contentStyle: { background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 12, color: '#1c1917', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  labelStyle: { color: 'rgba(28,25,23,0.55)' },
};

const PR_PALETTE = [
  { color: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/15', iconColor: 'text-blue-300' },
  { color: 'from-orange-500/15 to-orange-600/5', border: 'border-orange-500/15', iconColor: 'text-orange-300' },
  { color: 'from-purple-500/15 to-purple-600/5', border: 'border-purple-500/15', iconColor: 'text-purple-300' },
  { color: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/15', iconColor: 'text-amber-300' },
  { color: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/15', iconColor: 'text-emerald-300' },
  { color: 'from-pink-500/15 to-pink-600/5', border: 'border-pink-500/15', iconColor: 'text-pink-300' },
];

function TypeIcon({ type, className }: { type: PersonalRecord['type']; className?: string }) {
  if (type === 'cardio') return <Footprints className={className} />;
  if (type === 'strength') return <Dumbbell className={className} />;
  return <Activity className={className} />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDelta(pr: PersonalRecord): string | null {
  if (pr.delta === undefined || pr.delta <= 0) return null;
  if (pr.type === 'strength') return `+${Math.round(pr.delta)} lbs`;
  if (pr.type === 'cardio') return `+${(Math.round(pr.delta * 10) / 10)} mi`;
  return `+${Math.round(pr.delta)} reps`;
}

const ProgressAnalytics = () => {
  const { exerciseTrends, personalRecords, consistency, loading } = useWOBuddyStats();
  const [chartName, setChartName] = useState<string | null>(null);

  // Default to first available trend whenever the list changes.
  useEffect(() => {
    if (exerciseTrends.length === 0) {
      if (chartName !== null) setChartName(null);
      return;
    }
    if (!chartName || !exerciseTrends.find(t => t.meta.name === chartName)) {
      setChartName(exerciseTrends[0].meta.name);
    }
  }, [exerciseTrends, chartName]);

  const activeTrend = useMemo(
    () => exerciseTrends.find(t => t.meta.name === chartName) ?? null,
    [exerciseTrends, chartName],
  );

  return (
    <div className="space-y-5">

      {/* Consistency streak */}
      <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 rounded-2xl p-4 border border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-stone-900/65 uppercase tracking-wider">Current Streak</p>
            <p className="text-3xl font-bold mt-0.5">
              {consistency.currentStreak} <span className="text-base text-stone-900/65">days</span>
            </p>
          </div>
          <Flame className="w-8 h-8 text-emerald-400/60" />
        </div>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-[10px] text-stone-900/55">Longest</p>
            <p className="text-sm font-semibold text-stone-900/70">{consistency.longestStreak}d</p>
          </div>
          <div>
            <p className="text-[10px] text-stone-900/55">This Month</p>
            <p className="text-sm font-semibold text-stone-900/70">{consistency.thisMonth} sessions</p>
          </div>
          <div>
            <p className="text-[10px] text-stone-900/55">Avg/Week</p>
            <p className="text-sm font-semibold text-stone-900/70">{consistency.avgPerWeek}</p>
          </div>
        </div>
      </div>

      {/* Trend charts */}
      <div className="bg-stone-900/[0.04] rounded-2xl border border-stone-900/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-stone-900">Performance Trends</span>
        </div>

        {exerciseTrends.length === 0 ? (
          <div className="py-10 text-center">
            <TrendingUp className="w-8 h-8 text-stone-900/15 mx-auto mb-2" />
            <p className="text-xs text-stone-900/65">
              {loading ? 'Loading…' : 'Log workouts across at least two weeks to see trends.'}
            </p>
          </div>
        ) : (
          <>
            {/* Selector – one pill per real exercise */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
              {exerciseTrends.map(t => {
                const isActive = chartName === t.meta.name;
                return (
                  <button
                    key={t.meta.name}
                    onClick={() => setChartName(t.meta.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-stone-900/5 text-stone-900/65 border border-stone-900/10'
                    }`}
                  >
                    <TypeIcon type={t.meta.type} className="w-3 h-3" />
                    {t.meta.name}
                  </button>
                );
              })}
            </div>

            {activeTrend && <TrendChart meta={activeTrend.meta} points={activeTrend.points} />}
          </>
        )}
      </div>

      {/* Personal Bests */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-stone-900">Personal Bests</span>
        </div>

        {loading ? (
          <p className="text-xs text-stone-900/65">Loading…</p>
        ) : personalRecords.length === 0 ? (
          <div className="bg-stone-900/[0.04] rounded-2xl border border-stone-900/10 p-6 text-center">
            <Trophy className="w-8 h-8 text-stone-900/15 mx-auto mb-2" />
            <p className="text-xs text-stone-900/65">Log a workout to set your first personal best.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {personalRecords.map((pb, i) => {
              const palette = PR_PALETTE[i % PR_PALETTE.length];
              const trendText = formatDelta(pb);
              return (
                <div
                  key={`${pb.exerciseName}-${pb.achievedAt}`}
                  className={`bg-gradient-to-br ${palette.color} rounded-xl border ${palette.border} p-3 text-center`}
                >
                  <TypeIcon type={pb.type} className={`w-5 h-5 mx-auto ${palette.iconColor}`} />
                  <p className="text-sm font-bold text-stone-900 mt-1.5 leading-tight">{pb.value}</p>
                  <p className="text-[10px] text-stone-900/75 mt-0.5 truncate">{pb.exerciseName}</p>
                  <p className="text-[9px] text-stone-900/55 mt-0.5">{formatDate(pb.achievedAt)}</p>
                  {trendText && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-emerald-400">
                      {trendText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

function TrendChart({ meta, points }: { meta: ExerciseTrendMeta; points: { week: string; value: number }[] }) {
  const tooltipFormatter = (v: number): [string, string] => [`${v} ${meta.unit}`, meta.metricLabel];

  if (meta.type === 'cardio') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="week" tick={{ fill: 'rgba(28,25,23,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(28,25,23,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipStyle} formatter={tooltipFormatter} />
          <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  if (meta.type === 'strength') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={points}>
          <defs>
            <linearGradient id="strengthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="week" tick={{ fill: 'rgba(28,25,23,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(28,25,23,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipStyle} formatter={tooltipFormatter} />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#strengthGrad)" dot={{ r: 3, fill: '#3b82f6' }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={points}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="week" tick={{ fill: 'rgba(28,25,23,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(28,25,23,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip {...chartTooltipStyle} formatter={tooltipFormatter} />
        <Bar dataKey="value" fill="#a855f7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ProgressAnalytics;
