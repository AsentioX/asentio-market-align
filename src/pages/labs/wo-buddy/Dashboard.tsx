import { useState, useRef } from 'react';
import { Activity, Flame, Target, Zap, ChevronRight, Heart, Trophy, Dumbbell, Timer, ArrowRight } from 'lucide-react';
import { mockUser, mockCompetitions, mockWorkouts } from './mockData';

interface DashboardProps {
  onNavigate: (tab: 'workout' | 'competitions') => void;
}

const competitionImages: Record<string, { gradient: string; emoji: string; bg: string }> = {
  '1': { gradient: 'from-amber-500 to-orange-600', emoji: '⚔️', bg: 'bg-amber-900/30' },
  '2': { gradient: 'from-rose-500 to-pink-600', emoji: '🔥', bg: 'bg-rose-900/30' },
  '3': { gradient: 'from-blue-500 to-indigo-600', emoji: '💪', bg: 'bg-blue-900/30' },
  '4': { gradient: 'from-emerald-500 to-teal-600', emoji: '👟', bg: 'bg-emerald-900/30' },
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
      {/* Greeting + Readiness */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">Good morning</p>
          <h2 className="text-2xl font-bold mt-0.5">{mockUser.name}</h2>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="32" cy="32" r="27" fill="none"
              stroke="url(#readGrad)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${(readiness / 100) * 169.6} 169.6`}
            />
            <defs>
              <linearGradient id="readGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-emerald-400">{readiness}</span>
            <span className="text-[8px] text-white/40 uppercase tracking-wider">Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Flame className="w-4 h-4" />, value: mockUser.dailyProgress, label: 'Points today', color: 'text-orange-400', ring: 'bg-orange-500/10' },
          { icon: <Activity className="w-4 h-4" />, value: `${mockUser.weeklyProgress}/${mockUser.weeklyGoal}`, label: 'This week', color: 'text-blue-400', ring: 'bg-blue-500/10' },
          { icon: <Zap className="w-4 h-4" />, value: `${mockUser.weeklyStreak}w`, label: 'Streak', color: 'text-purple-400', ring: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-3.5 border border-white/[0.06]">
            <div className={`w-8 h-8 rounded-xl ${stat.ring} flex items-center justify-center ${stat.color} mb-2`}>
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
        <div className="flex items-center justify-center gap-2">
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
        <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{Math.round((mockUser.dailyProgress / mockUser.dailyGoal) * 100)}% complete</span>
                <span className="text-xs text-emerald-400">{mockUser.dailyGoal - mockUser.dailyProgress} pts to go</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min((mockUser.dailyProgress / mockUser.dailyGoal) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Competitions — swipeable cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Active Competitions</h3>
          <button onClick={() => onNavigate('competitions')} className="text-xs text-emerald-400 flex items-center gap-0.5">
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Horizontal scroll */}
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
                className="flex-shrink-0 w-[72vw] max-w-[300px] snap-center rounded-2xl overflow-hidden border border-white/[0.06]"
              >
                {/* Visual header */}
                <div className={`bg-gradient-to-br ${visual.gradient} p-5 pb-8 relative`}>
                  <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-medium flex items-center gap-1">
                    <Timer className="w-3 h-3" /> {comp.timeRemaining}
                  </div>
                  <span className="text-4xl">{visual.emoji}</span>
                  <h4 className="text-lg font-bold mt-2">{comp.title}</h4>
                  <p className="text-xs text-white/70 mt-1">{comp.description}</p>
                </div>
                {/* Stats footer */}
                <div className="bg-white/[0.04] p-4 -mt-3 rounded-t-2xl">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-white/60">{pct}% complete</span>
                    <span className="text-white/40">{comp.participants} players</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${visual.gradient} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {!comp.joined && (
                    <button className="mt-3 w-full text-xs font-semibold py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
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
                i === activeCompIdx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/15'
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
            <div key={w.id} className="flex items-center gap-3 bg-white/[0.04] rounded-2xl p-3.5 border border-white/[0.06]">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${
                w.type === 'strength' ? 'bg-blue-500/10' :
                w.type === 'cardio' ? 'bg-orange-500/10' :
                'bg-purple-500/10'
              }`}>
                {w.type === 'strength' ? '🏋️' : w.type === 'cardio' ? '🏃' : '💪'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{w.exercise}</p>
                <p className="text-[10px] text-white/40">{w.date}</p>
              </div>
              <span className="text-sm font-bold text-emerald-400">+{w.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
