import { useState } from 'react';
import { Calendar, Flame, Dumbbell, Star, Share2, Ruler, Weight, Heart, User, Pencil, Check, X } from 'lucide-react';
import { mockUser, mockAchievements } from './mockData';
import { shareContent, buildStatsShareText, buildAchievementShareText } from './shareUtils';

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      {/* Avatar + name — visual hero */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600/30 via-emerald-500/10 to-transparent p-6 pt-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-3xl font-bold shadow-xl shadow-emerald-500/20 border-2 border-emerald-400/30">
              {mockUser.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold">{mockUser.name}</h2>
              <p className="text-xs text-white/40">Member since {mockUser.memberSince}</p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/20">Level {mockUser.level}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-medium border border-amber-500/20">🔥 {mockUser.weeklyStreak}w streak</span>
              </div>
            </div>
            <button
              onClick={() => shareContent(buildStatsShareText(mockUser.totalWorkouts, mockUser.totalPoints, mockUser.weeklyStreak))}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Stats
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Dumbbell className="w-4 h-4 text-blue-400" />, value: mockUser.totalWorkouts, label: 'Workouts', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/10' },
          { icon: <Star className="w-4 h-4 text-amber-400" />, value: mockUser.totalPoints.toLocaleString(), label: 'Total Points', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/10' },
          { icon: <Flame className="w-4 h-4 text-orange-400" />, value: `${mockUser.weeklyStreak}w`, label: 'Streak', bg: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-b ${stat.bg} rounded-2xl p-3.5 border ${stat.border} text-center`}>
            <div className="flex justify-center mb-1.5">{stat.icon}</div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly consistency */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">This Week</span>
        </div>
        <div className="flex gap-2">
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
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Achievements</h3>
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
              {ach.unlocked && ach.date && (
                <p className="text-[9px] text-white/30 mt-0.5">{ach.date}</p>
              )}
              {ach.unlocked && (
                <button
                  onClick={(e) => { e.stopPropagation(); shareContent(buildAchievementShareText(ach.title, ach.icon)); }}
                  className="mt-1.5 text-white/30 hover:text-emerald-400 transition-colors"
                  title="Share achievement"
                >
                  <Share2 className="w-3 h-3 mx-auto" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
