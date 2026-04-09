import { useState, useMemo } from 'react';
import { TrendingUp, Award, ArrowUpRight, Zap, Calendar, Target, Flame, Activity, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useWOBuddyGoals } from '@/hooks/useWOBuddyGoals';

// ── Mock trend data (would come from DB in production) ──
const squatVolumeData = [
  { week: 'W1', volume: 4800 }, { week: 'W2', volume: 5200 }, { week: 'W3', volume: 5600 },
  { week: 'W4', volume: 4900 }, { week: 'W5', volume: 6200 }, { week: 'W6', volume: 6750 },
];
const runningPaceData = [
  { week: 'W1', pace: 9.2 }, { week: 'W2', pace: 8.9 }, { week: 'W3', pace: 8.7 },
  { week: 'W4', pace: 8.5 }, { week: 'W5', pace: 8.3 }, { week: 'W6', pace: 8.1 },
];
const rowingSplitData = [
  { week: 'W1', split: 2.15 }, { week: 'W2', split: 2.1 }, { week: 'W3', split: 2.05 },
  { week: 'W4', split: 2.08 }, { week: 'W5', split: 1.98 }, { week: 'W6', split: 1.95 },
];
const pushUpProgression = [
  { week: 'W1', max: 28 }, { week: 'W2', max: 30 }, { week: 'W3', max: 32 },
  { week: 'W4', max: 35 }, { week: 'W5', max: 38 }, { week: 'W6', max: 42 },
];
const weeklyFrequency = [
  { day: 'Mon', sessions: 1, minutes: 52 },
  { day: 'Tue', sessions: 1, minutes: 38 },
  { day: 'Wed', sessions: 0, minutes: 0 },
  { day: 'Thu', sessions: 1, minutes: 45 },
  { day: 'Fri', sessions: 2, minutes: 72 },
  { day: 'Sat', sessions: 1, minutes: 55 },
  { day: 'Sun', sessions: 0, minutes: 0 },
];

const personalBests = [
  { label: 'Squat', value: '225 lbs', icon: '🦵', trend: '+15 lbs', improving: true },
  { label: 'Bench Press', value: '185 lbs', icon: '🏋️', trend: '+10 lbs', improving: true },
  { label: 'Mile Time', value: '7:12', icon: '🏃', trend: '-0:18', improving: true },
  { label: '2K Row', value: '7:42', icon: '🚣', trend: '-0:08', improving: true },
  { label: 'Push-Ups', value: '42', icon: '💪', trend: '+6 reps', improving: true },
  { label: 'Deadlift', value: '275 lbs', icon: '⬆️', trend: '+20 lbs', improving: true },
];

const consistencyData = { currentStreak: 12, longestStreak: 18, thisMonth: 22, avgPerWeek: 5.1 };

type ChartView = 'volume' | 'pace' | 'rowing' | 'pushups';

const chartTooltipStyle = {
  contentStyle: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: 'rgba(255,255,255,0.5)' },
};

const ProgressAnalytics = () => {
  const [chartView, setChartView] = useState<ChartView>('volume');
  const { goals } = useWOBuddyGoals();

  const charts: { id: ChartView; label: string; icon: string }[] = [
    { id: 'volume', label: 'Squat Volume', icon: '🦵' },
    { id: 'pace', label: 'Run Pace', icon: '🏃' },
    { id: 'rowing', label: 'Row Split', icon: '🚣' },
    { id: 'pushups', label: 'Push-Ups', icon: '💪' },
  ];

  return (
    <div className="space-y-5">

      {/* Consistency streak */}
      <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 rounded-2xl p-4 border border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Current Streak</p>
            <p className="text-3xl font-bold mt-0.5">{consistencyData.currentStreak} <span className="text-base text-white/40">days</span></p>
          </div>
          <Flame className="w-8 h-8 text-emerald-400/60" />
        </div>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-[10px] text-white/30">Longest</p>
            <p className="text-sm font-semibold text-white/70">{consistencyData.longestStreak}d</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30">This Month</p>
            <p className="text-sm font-semibold text-white/70">{consistencyData.thisMonth} sessions</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30">Avg/Week</p>
            <p className="text-sm font-semibold text-white/70">{consistencyData.avgPerWeek}</p>
          </div>
        </div>
      </div>

      {/* Trend charts */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">Performance Trends</span>
        </div>

        {/* Chart selector */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
          {charts.map(c => (
            <button
              key={c.id}
              onClick={() => setChartView(c.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                chartView === c.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-white/40 border border-white/5'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          {chartView === 'volume' ? (
            <AreaChart data={squatVolumeData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fill="url(#volGrad)" dot={{ r: 3, fill: '#3b82f6' }} />
            </AreaChart>
          ) : chartView === 'pace' ? (
            <LineChart data={runningPaceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} reversed />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => [`${v.toFixed(1)} min/mi`, 'Pace']} />
              <Line type="monotone" dataKey="pace" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
            </LineChart>
          ) : chartView === 'rowing' ? (
            <LineChart data={rowingSplitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 0.1', 'dataMax + 0.1']} reversed />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => [`${v.toFixed(2)} min/500m`, 'Split']} />
              <Line type="monotone" dataKey="split" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
            </LineChart>
          ) : (
            <BarChart data={pushUpProgression}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="max" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Personal Bests */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Personal Bests</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {personalBests.map(pb => (
            <div key={pb.label} className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3 text-center">
              <span className="text-lg">{pb.icon}</span>
              <p className="text-sm font-bold text-white mt-1">{pb.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{pb.label}</p>
              <span className={`text-[10px] font-medium ${pb.improving ? 'text-emerald-400' : 'text-red-400'}`}>{pb.trend}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProgressAnalytics;
