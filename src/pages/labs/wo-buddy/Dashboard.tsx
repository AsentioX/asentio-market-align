import { useState, useRef } from 'react';
import { Activity, Flame, Target, Zap, ChevronRight, Trophy, Dumbbell, Timer, ArrowRight } from 'lucide-react';
import { mockUser, mockCompetitions, mockWorkouts } from './mockData';
import heroBg from '@/assets/wo-buddy/hero-bg.jpg';
import compWarrior from '@/assets/wo-buddy/comp-warrior.jpg';
import compBurn from '@/assets/wo-buddy/comp-burn.jpg';
import compStrength from '@/assets/wo-buddy/comp-strength.jpg';
import compCardio from '@/assets/wo-buddy/comp-cardio.jpg';

interface DashboardProps {
  onNavigate: (tab: 'workout' | 'competitions' | 'settings') => void;
}

const competitionImages: Record<string, { image: string; gradient: string }> = {
  '1': { image: compWarrior, gradient: 'from-amber-500/80 to-orange-600/80' },
  '2': { image: compBurn, gradient: 'from-rose-500/80 to-pink-600/80' },
  '3': { image: compStrength, gradient: 'from-blue-500/80 to-indigo-600/80' },
  '4': { image: compCardio, gradient: 'from-emerald-500/80 to-teal-600/80' },
};

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const readiness = 82;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCompIdx, setActiveCompIdx] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.scrollWidth / mockCompetitions.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveCompIdx(idx);
  };

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
            <p className="text-emerald-400 text-xs mt-1 font-medium">Level {18} · 12w streak 🔥</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="url(#readGrad)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(readiness / 100) * 213.6} 213.6`}
              />
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

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Flame className="w-4 h-4" />, value: mockUser.dailyProgress, label: 'Points today', color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/10' },
          { icon: <Activity className="w-4 h-4" />, value: `${mockUser.weeklyProgress}/${mockUser.weeklyGoal}`, label: 'This week', color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/10' },
          { icon: <Zap className="w-4 h-4" />, value: `${mockUser.weeklyStreak}w`, label: 'Streak', color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/10' },
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

      {/* Start Workout CTA */}
      <button
        onClick={() => onNavigate('workout')}
        className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative flex items-center justify-center gap-2">
          <Dumbbell className="w-5 h-5" />
          <span>Start Workout</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </button>

      {/* Daily Goal */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Daily Goal</h3>
          <span className="text-xs text-white/30">{mockUser.dailyProgress} / {mockUser.dailyGoal} pts</span>
        </div>
        <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/10">
              <Target className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{Math.round((mockUser.dailyProgress / mockUser.dailyGoal) * 100)}% complete</span>
                <span className="text-xs text-emerald-400 font-medium">{mockUser.dailyGoal - mockUser.dailyProgress} pts to go</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                  style={{ width: `${Math.min((mockUser.dailyProgress / mockUser.dailyGoal) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Competitions — large image cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Active Competitions</h3>
          <button onClick={() => onNavigate('competitions')} className="text-xs text-emerald-400 flex items-center gap-0.5 font-medium">
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="-mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockCompetitions.map((comp) => {
            const visual = competitionImages[comp.id] || competitionImages['1'];
            const pct = Math.round((comp.progress / comp.target) * 100);
            return (
              <div
                key={comp.id}
                className="flex-shrink-0 w-[75vw] max-w-[320px] snap-center rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/20"
              >
                {/* Image header */}
                <div className="relative h-44">
                  <img src={visual.image} alt={comp.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={640} height={640} />
                  <div className={`absolute inset-0 bg-gradient-to-t ${visual.gradient} via-transparent to-black/60`} />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-medium flex items-center gap-1 border border-white/10">
                    <Timer className="w-3 h-3" /> {comp.timeRemaining}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-lg font-bold drop-shadow-lg">{comp.title}</h4>
                    <p className="text-xs text-white/80 mt-0.5 drop-shadow-md">{comp.description}</p>
                  </div>
                </div>
                {/* Stats footer */}
                <div className="bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-white/60 font-medium">{pct}% complete</span>
                    <span className="text-white/40">{comp.participants} players</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {!comp.joined && (
                    <button className="mt-3 w-full text-xs font-semibold py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      Join Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {mockCompetitions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === activeCompIdx ? 'w-6 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'w-1.5 bg-white/15'
              }`}
            />
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
