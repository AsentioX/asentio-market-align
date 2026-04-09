import { useState, useMemo } from 'react';
import { Activity, Flame, Target, Zap, ChevronRight, Dumbbell, Sparkles, Calendar, Star, Share2, TrendingUp, TrendingDown, Minus, X, BarChart3 } from 'lucide-react';
import ProgressAnalytics from './ProgressAnalytics';
import { mockUser, mockAchievements, mockExerciseStats, mockBodyTrend, mockMonthlyOverview, mockAllTimeOverview, mockWeeklyOverview, mockWorkouts } from './mockData';
import { useWOBuddyGoals } from '@/hooks/useWOBuddyGoals';
import { generateInsights } from './goalMappings';
import { shareContent, buildAchievementShareText } from './shareUtils';
import heroBg from '@/assets/wo-buddy/hero-bg.jpg';

/* ── Fun Fact Milestone System ────────────────────────────── */
interface Milestone {
  threshold: number;
  emoji: string;
  title: string;
  desc: string;
  color: string;
  border: string;
  accent: string;
  gradientBar: string;
}

interface MilestoneCategory {
  key: string;
  label: string;
  unit: string;
  icon: string;
  milestones: Milestone[];
}

const MILESTONE_CATEGORIES: MilestoneCategory[] = [
  {
    key: 'distance', label: 'Distance', unit: 'mi', icon: '🏃',
    milestones: [
      { threshold: 26.2, emoji: '🏅', title: 'Marathon Runner', desc: "You've run a full marathon!", color: 'from-amber-500/30 to-amber-600/10', border: 'border-amber-500/20', accent: 'text-amber-400', gradientBar: 'from-amber-500 to-amber-400' },
      { threshold: 100, emoji: '🗽', title: 'NYC to Philly', desc: "You've covered the distance from New York to Philadelphia!", color: 'from-blue-500/30 to-blue-600/10', border: 'border-blue-500/20', accent: 'text-blue-400', gradientBar: 'from-blue-500 to-blue-400' },
      { threshold: 238, emoji: '🇬🇧', title: 'London to Paris', desc: "You've run the distance from London to Paris!", color: 'from-rose-500/30 to-rose-600/10', border: 'border-rose-500/20', accent: 'text-rose-400', gradientBar: 'from-rose-500 to-rose-400' },
      { threshold: 500, emoji: '🏔️', title: 'Camino de Santiago', desc: "You've walked the legendary Camino pilgrimage route!", color: 'from-emerald-500/30 to-emerald-600/10', border: 'border-emerald-500/20', accent: 'text-emerald-400', gradientBar: 'from-emerald-500 to-emerald-400' },
      { threshold: 2450, emoji: '🌄', title: 'Appalachian Trail', desc: "You've conquered the full Appalachian Trail!", color: 'from-green-500/30 to-green-600/10', border: 'border-green-500/20', accent: 'text-green-400', gradientBar: 'from-green-500 to-green-400' },
      { threshold: 13171, emoji: '🐉', title: 'Great Wall of China', desc: "You've run the full length of the Great Wall!", color: 'from-red-500/30 to-red-600/10', border: 'border-red-500/20', accent: 'text-red-400', gradientBar: 'from-red-500 to-red-400' },
    ],
  },
  {
    key: 'volume', label: 'Volume Lifted', unit: 'lbs', icon: '🏋️',
    milestones: [
      { threshold: 4000, emoji: '🚗', title: 'Weight of a Car', desc: "You've lifted the weight of an average sedan!", color: 'from-cyan-500/30 to-cyan-600/10', border: 'border-cyan-500/20', accent: 'text-cyan-400', gradientBar: 'from-cyan-500 to-cyan-400' },
      { threshold: 14000, emoji: '🐘', title: 'African Elephant', desc: "You've lifted the weight of an African elephant!", color: 'from-violet-500/30 to-violet-600/10', border: 'border-violet-500/20', accent: 'text-violet-400', gradientBar: 'from-violet-500 to-violet-400' },
      { threshold: 50000, emoji: '🚌', title: 'School Bus', desc: "You've lifted the weight of a fully loaded school bus!", color: 'from-yellow-500/30 to-yellow-600/10', border: 'border-yellow-500/20', accent: 'text-yellow-400', gradientBar: 'from-yellow-500 to-yellow-400' },
      { threshold: 130000, emoji: '🐋', title: 'Blue Whale', desc: "You've lifted the weight of a blue whale!", color: 'from-sky-500/30 to-sky-600/10', border: 'border-sky-500/20', accent: 'text-sky-400', gradientBar: 'from-sky-500 to-sky-400' },
      { threshold: 400000, emoji: '✈️', title: 'Boeing 747', desc: "You've lifted the weight of a fully loaded 747!", color: 'from-slate-500/30 to-slate-600/10', border: 'border-slate-400/20', accent: 'text-slate-300', gradientBar: 'from-slate-400 to-slate-300' },
      { threshold: 1000000, emoji: '🚀', title: 'Space Shuttle', desc: "You've lifted the launch weight of the Space Shuttle!", color: 'from-orange-500/30 to-orange-600/10', border: 'border-orange-500/20', accent: 'text-orange-400', gradientBar: 'from-orange-500 to-orange-400' },
    ],
  },
  {
    key: 'pushups', label: 'Push-ups', unit: 'reps', icon: '💪',
    milestones: [
      { threshold: 100, emoji: '💪', title: 'Century Club', desc: "100 push-ups — that's a real warm-up!", color: 'from-pink-500/30 to-pink-600/10', border: 'border-pink-500/20', accent: 'text-pink-400', gradientBar: 'from-pink-500 to-pink-400' },
      { threshold: 500, emoji: '🎖️', title: 'Navy SEAL Trainee', desc: "You've done more push-ups than a Navy SEAL trainee in a week!", color: 'from-indigo-500/30 to-indigo-600/10', border: 'border-indigo-500/20', accent: 'text-indigo-400', gradientBar: 'from-indigo-500 to-indigo-400' },
      { threshold: 2000, emoji: '🏛️', title: 'Spartan Warrior', desc: "Ancient Spartans would be proud of this push-up count!", color: 'from-red-500/30 to-red-600/10', border: 'border-red-500/20', accent: 'text-red-400', gradientBar: 'from-red-500 to-red-400' },
      { threshold: 5000, emoji: '🦾', title: 'Iron Arms', desc: "5,000 push-ups — your arms are basically titanium!", color: 'from-zinc-500/30 to-zinc-600/10', border: 'border-zinc-400/20', accent: 'text-zinc-300', gradientBar: 'from-zinc-400 to-zinc-300' },
      { threshold: 10000, emoji: '🏆', title: 'Push-up Legend', desc: "10,000 push-ups! That's world-class dedication!", color: 'from-amber-500/30 to-amber-600/10', border: 'border-amber-500/20', accent: 'text-amber-400', gradientBar: 'from-amber-500 to-amber-400' },
    ],
  },
  {
    key: 'squats', label: 'Squat Volume', unit: 'lbs', icon: '🦵',
    milestones: [
      { threshold: 10000, emoji: '🦵', title: 'Leg Day Hero', desc: "10,000 lbs squatted — you never skip leg day!", color: 'from-lime-500/30 to-lime-600/10', border: 'border-lime-500/20', accent: 'text-lime-400', gradientBar: 'from-lime-500 to-lime-400' },
      { threshold: 50000, emoji: '⚡', title: 'Thunder Thighs', desc: "50k lbs — your legs generate their own electricity!", color: 'from-yellow-500/30 to-yellow-600/10', border: 'border-yellow-500/20', accent: 'text-yellow-400', gradientBar: 'from-yellow-500 to-yellow-400' },
      { threshold: 100000, emoji: '🏗️', title: 'Human Crane', desc: "You've squatted the weight of a construction crane!", color: 'from-teal-500/30 to-teal-600/10', border: 'border-teal-500/20', accent: 'text-teal-400', gradientBar: 'from-teal-500 to-teal-400' },
      { threshold: 200000, emoji: '🗻', title: 'Mountain Legs', desc: "200k lbs — your legs could carry you up Everest twice!", color: 'from-emerald-500/30 to-emerald-600/10', border: 'border-emerald-500/20', accent: 'text-emerald-400', gradientBar: 'from-emerald-500 to-emerald-400' },
    ],
  },
  {
    key: 'situps', label: 'Sit-ups', unit: 'reps', icon: '🔄',
    milestones: [
      { threshold: 500, emoji: '🎯', title: 'Core Soldier', desc: "500 sit-ups — your core is built like armor!", color: 'from-fuchsia-500/30 to-fuchsia-600/10', border: 'border-fuchsia-500/20', accent: 'text-fuchsia-400', gradientBar: 'from-fuchsia-500 to-fuchsia-400' },
      { threshold: 2000, emoji: '🔥', title: 'Abs of Steel', desc: "2,000 sit-ups — your six-pack has its own zip code!", color: 'from-orange-500/30 to-orange-600/10', border: 'border-orange-500/20', accent: 'text-orange-400', gradientBar: 'from-orange-500 to-orange-400' },
      { threshold: 6000, emoji: '💎', title: 'Diamond Core', desc: "6,000 sit-ups — your core is unbreakable!", color: 'from-cyan-500/30 to-cyan-600/10', border: 'border-cyan-500/20', accent: 'text-cyan-400', gradientBar: 'from-cyan-500 to-cyan-400' },
    ],
  },
];

interface DashboardProps {
  onNavigate: (tab: 'workout' | 'competitions' | 'settings' | 'goals') => void;
}

type Period = 'week' | 'month' | 'all';

const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const readiness = 82;
  const [period, setPeriod] = useState<Period>('week');
  const [milestoneIdx, setMilestoneIdx] = useState(0);
  const [funFactDismissed, setFunFactDismissed] = useState(false);
  const { goals } = useWOBuddyGoals();
  const insights = generateInsights(goals);

  // Compute all-time totals per category
  const categoryValues = useMemo(() => {
    const totalMiles = mockExerciseStats.filter(e => e.type === 'cardio').reduce((s, e) => s + (typeof e.allTime.value === 'number' ? e.allTime.value : 0), 0);
    const totalVolume = mockExerciseStats.filter(e => e.type === 'strength').reduce((s, e) => s + (typeof e.allTime.value === 'number' ? e.allTime.value : 0), 0);
    const pushups = mockExerciseStats.find(e => e.name === 'Push-ups')?.allTime.value || 0;
    const squats = mockExerciseStats.find(e => e.name === 'Squats')?.allTime.value || 0;
    const situps = mockExerciseStats.find(e => e.name === 'Sit-ups')?.allTime.value || 0;
    return { distance: totalMiles, volume: totalVolume, pushups: typeof pushups === 'number' ? pushups : 0, squats: typeof squats === 'number' ? squats : 0, situps: typeof situps === 'number' ? situps : 0 };
  }, []);

  // Gather all unlocked milestones across categories
  const allUnlocked = useMemo(() => {
    const results: Array<{ cat: MilestoneCategory; milestone: Milestone; next: Milestone | undefined; value: number }> = [];
    for (const cat of MILESTONE_CATEGORIES) {
      const val = categoryValues[cat.key as keyof typeof categoryValues] || 0;
      const unlocked = cat.milestones.filter(m => val >= m.threshold);
      if (unlocked.length > 0) {
        const latest = unlocked[unlocked.length - 1];
        const next = cat.milestones.find(m => val < m.threshold);
        results.push({ cat, milestone: latest, next, value: val });
      }
    }
    return results;
  }, [categoryValues]);

  const activeMilestoneIdx = milestoneIdx % Math.max(allUnlocked.length, 1);

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


      {/* 🎉 Fun Fact Milestones Carousel */}
      {!funFactDismissed && allUnlocked.length > 0 && (() => {
        const { cat, milestone, next, value } = allUnlocked[activeMilestoneIdx];
        return (
          <div className={`relative overflow-hidden rounded-2xl border ${milestone.border} bg-gradient-to-br ${milestone.color}`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-6 -top-6 text-[120px] leading-none select-none">{milestone.emoji}</div>
            </div>
            <div className="relative z-10 p-5">
              {/* Dismiss button */}
              <button
                onClick={() => setFunFactDismissed(true)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-20"
              >
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
              <div className="flex items-start gap-4 pr-6">
                <div className="text-5xl shrink-0 animate-[pulse_3s_ease-in-out_infinite]">{milestone.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{cat.label} Milestone</span>
                  </div>
                  <h4 className={`text-lg font-bold ${milestone.accent}`}>{milestone.title}</h4>
                  <p className="text-sm text-white/70 mt-0.5 leading-snug">{milestone.desc}</p>
                  <p className="text-[10px] text-white/30 mt-2">{typeof value === 'number' && value >= 1000 ? formatNum(value) : value.toFixed(1)} {cat.unit} total</p>
                </div>
              </div>
              {next && (
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className="text-white/40">Next: {next.emoji} {next.title}</span>
                    <span className="text-white/30">{formatNum(Math.round(next.threshold - value))} {cat.unit} to go</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${milestone.gradientBar} transition-all`}
                      style={{ width: `${Math.min((value / next.threshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {allUnlocked.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {allUnlocked.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMilestoneIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === activeMilestoneIdx ? `${milestone.accent.replace('text-', 'bg-')} scale-125` : 'bg-white/20 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

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

      {/* Goal Progress */}
      {goals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Goal Progress</span>
          </div>
          <div className="space-y-2">
            {goals.filter(g => g.status !== 'achieved').map(g => {
              const pct = g.target_value > 0 ? Math.min(100, Math.round(((g.current_value ?? 0) / g.target_value) * 100)) : 0;
              return (
                <div key={g.id} className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-white/70 truncate">{g.name}</span>
                    <span className="text-xs font-bold text-emerald-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-white/25">{g.current_value ?? 0} / {g.target_value} {g.metric}</span>
                    {g.deadline && <span className="text-[9px] text-white/20">Due {new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      

      {/* This Week + Daily Goal combined */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">This Week</span>
        </div>
        <div className="flex items-end gap-2 mb-4" style={{ height: 80 }}>
          {(() => {
            const dailyMins = [52, 38, 0, 45, 72, 55, 0]; // Mon–Sun minutes
            const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const todayIdx = mockUser.weeklyProgress;
            const maxMin = Math.max(...dailyMins, 1);
            return dayLabels.map((day, i) => {
              const mins = dailyMins[i];
              const isToday = i === todayIdx;
              const isPast = i < todayIdx;
              const hasData = mins > 0;
              const barH = hasData ? Math.max(12, (mins / maxMin) * 64) : 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex-1 w-full flex items-end justify-center">
                    <div
                      className={`w-full rounded-md transition-all ${
                        hasData
                          ? isToday
                            ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                            : 'bg-emerald-500/40'
                          : 'bg-white/[0.06]'
                      }`}
                      style={{ height: hasData ? barH : 8 }}
                    />
                  </div>
                  <span className={`text-[9px] ${isToday ? 'text-white/70 font-medium' : 'text-white/30'}`}>{day}</span>
                  <span className={`text-[9px] ${hasData ? 'text-emerald-400/70' : 'text-white/15'}`}>
                    {hasData ? `${mins}m` : ''}
                  </span>
                </div>
              );
            });
          })()}
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

      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl border border-white/[0.08] overflow-hidden">
        {/* Period tabs */}
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
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
        </div>

        <div className="p-4 space-y-5">
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
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
