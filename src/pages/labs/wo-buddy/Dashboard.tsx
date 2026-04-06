import { useState, useRef } from 'react';
import { Activity, Flame, Target, Zap, ChevronRight, Dumbbell, ArrowRight, Sparkles, Calendar, Star, Share2, TrendingUp, TrendingDown, Weight, Minus } from 'lucide-react';
import { mockUser, mockAchievements, mockExerciseStats, mockBodyTrend, mockMonthlyOverview, mockAllTimeOverview, mockWeeklyOverview, mockWorkouts } from './mockData';
import { useWOBuddyGoals } from '@/hooks/useWOBuddyGoals';
import { generateInsights } from './goalMappings';
import { shareContent, buildStatsShareText, buildAchievementShareText } from './shareUtils';
import heroBg from '@/assets/wo-buddy/hero-bg.jpg';

interface DashboardProps {
  onNavigate: (tab: 'workout' | 'competitions' | 'settings' | 'goals') => void;
}

type Period = 'week' | 'month' | 'all';

const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const readiness = 82;
  const [period, setPeriod] = useState<Period>('week');
  const { goals } = useWOBuddyGoals();
  const insights = generateInsights(goals);

  const overview = period === 'all' ? mockAllTimeOverview : period === 'month' ? mockMonthlyOverview : mockWeeklyOverview;
  const periodLabel = period === 'all' ? 'All Time' : period === 'month' ? 'This Month' : 'This Week';

  const bodyLatest = mockBodyTrend[mockBodyTrend.length - 1];
  const bodyPrev = mockBodyTrend[mockBodyTrend.length - 2];
  const weightDelta = bodyLatest.weight - bodyPrev.weight;
  const fatDelta = bodyLatest.bodyFat - bodyPrev.bodyFat;
  const muscleDelta = bodyLatest.muscleMass - bodyPrev.muscleMass;

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="relative rounded-3xl overflow-hidden h-44">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 h-full flex items-center justify-between px-5">
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em]">Good morning</p>
            <h2 className="text-2xl font-bold mt-1">{mockUser.name}</h2>
            <p className="text-emerald-400 text-xs mt-1 font-medium">Level {mockUser.level} · {mockUser.weeklyStreak}w streak 🔥</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="url(#readGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(readiness / 100) * 213.6} 213.6`} />
              <defs>
                <linearGradient id="readGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-emerald-400">{readiness}</span>
              <span className="text-[8px] text-white/50 uppercase tracking-widest">Ready</span>
            </div>
          </div>
        </div>
      </div>


      {/* Coaching Insights */}
      {goals.length > 0 && (
        <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Coaching</span>
            </div>
            <button onClick={() => onNavigate('goals')} className="text-xs text-emerald-400 flex items-center gap-0.5 font-medium">
              Goals <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {insights.slice(0, 2).map((insight, i) => (
            <p key={i} className="text-[12px] text-white/60 leading-relaxed">{insight}</p>
          ))}
        </div>
      )}

      {/* This Week + Daily Goal combined */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">This Week</span>
        </div>
        <div className="flex gap-2 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const active = i < mockUser.weeklyProgress;
            const isToday = i === mockUser.weeklyProgress;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs transition-all ${
                  active ? 'bg-gradient-to-b from-emerald-500/30 to-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/10' :
                  isToday ? 'bg-white/5 border border-emerald-500/20 text-white/60 ring-1 ring-emerald-400/30' :
                  'bg-white/[0.02] border border-white/5 text-white/20'
                }`}>
                  {active ? '✓' : ''}
                </div>
                <span className={`text-[9px] ${active ? 'text-emerald-400/60' : 'text-white/30'}`}>{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Daily Goal</span>
          </div>
          <span className="text-xs text-white/30">{mockUser.dailyProgress} / {mockUser.dailyGoal} pts</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all shadow-[0_0_12px_rgba(52,211,153,0.4)]"
            style={{ width: `${Math.min((mockUser.dailyProgress / mockUser.dailyGoal) * 100, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-emerald-400/70 mt-1.5 text-right">{mockUser.dailyGoal - mockUser.dailyProgress} pts to go</p>
      </div>

      {/* Period Toggle */}
      <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
        {(['week', 'month', 'all'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
              period === p
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-sm'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">{periodLabel} Overview</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Dumbbell className="w-4 h-4" />, value: overview.workouts, label: 'Workouts', color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/10' },
            { icon: <Flame className="w-4 h-4" />, value: formatNum(overview.caloriesBurned), label: 'Calories', color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/10' },
            { icon: <Zap className="w-4 h-4" />, value: `${overview.avgDuration}m`, label: 'Avg Duration', color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/10' },
            { icon: <Activity className="w-4 h-4" />, value: formatNum(overview.totalVolume), label: 'Volume (lbs)', color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/10' },
            { icon: <Star className="w-4 h-4" />, value: `${overview.totalDistance}`, label: 'Miles', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/10' },
            { icon: <Target className="w-4 h-4" />, value: formatNum(overview.totalReps), label: 'Total Reps', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/10' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-b ${stat.bg} backdrop-blur-sm rounded-2xl p-3.5 border ${stat.border}`}>
              <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} mb-2`}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Breakdowns */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Exercise Totals — {periodLabel}</h3>
        <div className="space-y-2">
          {mockExerciseStats.map((ex) => {
            const stat = period === 'all' ? ex.allTime : period === 'month' ? ex.month : ex.week;
            return (
              <div key={ex.name} className="flex items-center gap-3 bg-gradient-to-r from-white/[0.05] to-white/[0.02] rounded-2xl p-3.5 border border-white/[0.06]">
                <span className="text-2xl w-10 text-center">{ex.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{ex.name}</p>
                  <p className="text-[10px] text-white/40">{ex.type === 'cardio' ? 'Distance' : ex.type === 'strength' ? 'Volume lifted' : 'Reps completed'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{typeof stat.value === 'number' && stat.value >= 1000 ? formatNum(stat.value) : stat.value} <span className="text-[10px] text-white/40 font-normal">{stat.unit}</span></p>
                  {ex.pr && <p className="text-[9px] text-amber-400">PR: {ex.pr}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body Composition Trends */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Body Composition</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'Weight', value: `${bodyLatest.weight}`, unit: 'kg', delta: weightDelta, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/10', invertGood: true },
            { label: 'Body Fat', value: `${bodyLatest.bodyFat}`, unit: '%', delta: fatDelta, color: 'text-rose-400', bg: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/10', invertGood: true },
            { label: 'Muscle', value: `${bodyLatest.muscleMass}`, unit: 'kg', delta: muscleDelta, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/10', invertGood: false },
          ].map((m, i) => {
            const isGood = m.invertGood ? m.delta < 0 : m.delta > 0;
            const isNeutral = m.delta === 0;
            return (
              <div key={i} className={`bg-gradient-to-b ${m.bg} rounded-2xl p-3.5 border ${m.border}`}>
                <p className="text-[10px] text-white/40 mb-1">{m.label}</p>
                <p className="text-xl font-bold">{m.value}<span className="text-[10px] text-white/40 font-normal ml-0.5">{m.unit}</span></p>
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${isNeutral ? 'text-white/30' : isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isNeutral ? <Minus className="w-3 h-3" /> : isGood ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {Math.abs(m.delta).toFixed(1)} {m.unit}
                </div>
              </div>
            );
          })}
        </div>
        {/* Mini trend bars */}
        <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
          <div className="flex items-center justify-between text-[10px] text-white/30 mb-2">
            <span>Weight trend</span>
            <span>{mockBodyTrend[0].date} → {bodyLatest.date}</span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {mockBodyTrend.map((p, i) => {
              const minW = Math.min(...mockBodyTrend.map(t => t.weight));
              const maxW = Math.max(...mockBodyTrend.map(t => t.weight));
              const range = maxW - minW || 1;
              const pct = ((p.weight - minW) / range) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-500/40 to-blue-400/20 transition-all"
                    style={{ height: `${20 + pct * 0.8}%` }}
                  />
                  <span className="text-[8px] text-white/30">{p.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Achievements</h3>
          <span className="text-[10px] text-white/30">{mockAchievements.filter(a => a.unlocked).length}/{mockAchievements.length} unlocked</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {mockAchievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-2xl p-3.5 border text-center transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-b from-white/[0.06] to-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
                  : 'bg-white/[0.01] border-white/[0.03] opacity-40 grayscale'
              }`}
            >
              <span className="text-3xl block mb-1.5">{ach.icon}</span>
              <p className="text-[10px] font-medium leading-tight">{ach.title}</p>
              {ach.unlocked && ach.date && <p className="text-[9px] text-white/30 mt-0.5">{ach.date}</p>}
              {ach.unlocked && (
                <button
                  onClick={(e) => { e.stopPropagation(); shareContent(buildAchievementShareText(ach.title, ach.icon)); }}
                  className="mt-1.5 text-white/30 hover:text-emerald-400 transition-colors"
                >
                  <Share2 className="w-3 h-3 mx-auto" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Recent Activity</h3>
        </div>
        <div className="space-y-2">
          {mockWorkouts.slice(0, 3).map((w) => (
            <div key={w.id} className="flex items-center gap-3 bg-gradient-to-r from-white/[0.05] to-white/[0.02] rounded-2xl p-3.5 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                w.type === 'strength' ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/10' :
                w.type === 'cardio' ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/10' :
                'bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/10'
              }`}>
                {w.type === 'strength' ? '🏋️' : w.type === 'cardio' ? '🏃' : '💪'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{w.exercise}</p>
                <p className="text-[10px] text-white/40">{w.date}</p>
              </div>
              <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">+{w.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
