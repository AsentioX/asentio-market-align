import { Activity, Flame, Target, Zap, ChevronRight, Heart } from 'lucide-react';
import { mockUser, mockCompetitions, mockWorkouts } from './mockData';

interface DashboardProps {
  onNavigate: (tab: 'workout' | 'competitions') => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const readiness = 82;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-white/50 text-sm">Good morning</p>
        <h2 className="text-2xl font-bold">{mockUser.name}</h2>
      </div>

      {/* Readiness ring */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="url(#readinessGrad)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(readiness / 100) * 213.6} 213.6`}
              />
              <defs>
                <linearGradient id="readinessGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-emerald-400">{readiness}</span>
              <span className="text-[9px] text-white/40 uppercase tracking-wider">Ready</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <p className="text-sm font-medium text-emerald-300">High readiness</p>
            <p className="text-xs text-white/40">Your recovery looks great. Perfect day for a heavy session.</p>
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Heart className="w-3 h-3 text-red-400" />
              <span>Resting HR: 58 bpm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Flame className="w-4 h-4 text-orange-400" />, value: mockUser.dailyProgress, label: 'Points', color: 'orange' },
          { icon: <Activity className="w-4 h-4 text-blue-400" />, value: mockUser.weeklyProgress, label: `/ ${mockUser.weeklyGoal} days`, color: 'blue' },
          { icon: <Zap className="w-4 h-4 text-purple-400" />, value: mockUser.weeklyStreak, label: 'Streak', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">{stat.icon}</div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Start Workout CTA */}
      <button
        onClick={() => onNavigate('workout')}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
      >
        Start Workout
      </button>

      {/* Daily goal progress */}
      <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Daily Goal</span>
          </div>
          <span className="text-xs text-white/40">{mockUser.dailyProgress} / {mockUser.dailyGoal} pts</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${Math.min((mockUser.dailyProgress / mockUser.dailyGoal) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Active competitions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Active Competitions</h3>
          <button onClick={() => onNavigate('competitions')} className="text-xs text-emerald-400 flex items-center gap-0.5">
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2.5">
          {mockCompetitions.filter(c => c.joined).map((comp) => (
            <div key={comp.id} className="bg-white/[0.03] rounded-xl p-3.5 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{comp.title}</span>
                <span className="text-[10px] text-white/30">{comp.timeRemaining}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(comp.progress / comp.target) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-white/40">{comp.progress} / {comp.target} — {comp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {mockWorkouts.slice(0, 3).map((w) => (
            <div key={w.id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${
                w.type === 'strength' ? 'bg-blue-500/10 text-blue-400' :
                w.type === 'cardio' ? 'bg-orange-500/10 text-orange-400' :
                'bg-purple-500/10 text-purple-400'
              }`}>
                {w.type === 'strength' ? '🏋️' : w.type === 'cardio' ? '🏃' : '💪'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{w.exercise}</p>
                <p className="text-[10px] text-white/40">{w.date}</p>
              </div>
              <span className="text-sm font-semibold text-emerald-400">+{w.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
