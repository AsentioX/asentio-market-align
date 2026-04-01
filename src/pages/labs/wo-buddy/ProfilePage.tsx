import { Calendar, Flame, Dumbbell, Star, Share2 } from 'lucide-react';
import { mockUser, mockAchievements } from './mockData';
import { shareContent, buildStatsShareText, buildAchievementShareText } from './shareUtils';

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl font-bold">
          {mockUser.avatar}
        </div>
        <div>
          <h2 className="text-xl font-bold">{mockUser.name}</h2>
          <p className="text-xs text-white/40">Member since {mockUser.memberSince} · Level {mockUser.level}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Dumbbell className="w-4 h-4 text-blue-400" />, value: mockUser.totalWorkouts, label: 'Workouts' },
          { icon: <Star className="w-4 h-4 text-amber-400" />, value: mockUser.totalPoints.toLocaleString(), label: 'Total Points' },
          { icon: <Flame className="w-4 h-4 text-orange-400" />, value: `${mockUser.weeklyStreak}w`, label: 'Streak' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Consistency */}
      <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">This Week</span>
        </div>
        <div className="flex gap-1.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const active = i < mockUser.weeklyProgress;
            const isToday = i === mockUser.weeklyProgress;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs ${
                  active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                  isToday ? 'bg-white/5 border border-white/10 text-white/60' :
                  'bg-white/[0.02] border border-white/5 text-white/20'
                }`}>
                  {active ? '✓' : ''}
                </div>
                <span className="text-[9px] text-white/30">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Achievements</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {mockAchievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-xl p-3 border text-center transition-all ${
                ach.unlocked
                  ? 'bg-white/[0.03] border-white/5'
                  : 'bg-white/[0.01] border-white/[0.03] opacity-40'
              }`}
            >
              <span className="text-2xl block mb-1">{ach.icon}</span>
              <p className="text-[10px] font-medium leading-tight">{ach.title}</p>
              {ach.unlocked && ach.date && (
                <p className="text-[9px] text-white/30 mt-0.5">{ach.date}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
