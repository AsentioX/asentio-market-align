// Mock data for W.O.Buddy

export interface Workout {
  id: string;
  type: 'strength' | 'cardio' | 'bodyweight';
  exercise: string;
  score: number;
  date: string;
  details: Record<string, number | string>;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'daily';
  progress: number;
  target: number;
  timeRemaining: string;
  joined: boolean;
  participants: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export const mockUser = {
  name: 'Alex Chen',
  avatar: 'AC',
  totalWorkouts: 147,
  totalPoints: 24850,
  weeklyStreak: 12,
  memberSince: 'Jan 2025',
  level: 18,
  dailyGoal: 500,
  dailyProgress: 340,
  weeklyGoal: 5,
  weeklyProgress: 3,
};

export const mockWorkouts: Workout[] = [
  { id: '1', type: 'strength', exercise: 'Bench Press', score: 450, date: '2026-04-01', details: { sets: 4, reps: 8, weight: 185 } },
  { id: '2', type: 'cardio', exercise: 'Running', score: 320, date: '2026-03-31', details: { distance: 5.2, time: 28, pace: '5:23' } },
  { id: '3', type: 'bodyweight', exercise: 'Push-ups', score: 200, date: '2026-03-30', details: { reps: 100 } },
  { id: '4', type: 'strength', exercise: 'Squats', score: 520, date: '2026-03-29', details: { sets: 5, reps: 6, weight: 225 } },
  { id: '5', type: 'cardio', exercise: 'Rowing', score: 280, date: '2026-03-28', details: { distance: 3.0, time: 18, pace: '6:00' } },
];

export const mockCompetitions: Competition[] = [
  { id: '1', title: 'Weekly Warrior', description: 'Earn 3,000 points this week', type: 'weekly', progress: 1850, target: 3000, timeRemaining: '3d 14h', joined: true, participants: 234 },
  { id: '2', title: 'Daily Burn', description: 'Complete 500 points today', type: 'daily', progress: 340, target: 500, timeRemaining: '8h 22m', joined: true, participants: 1089 },
  { id: '3', title: 'Strength Month', description: 'Log 20 strength sessions this month', type: 'weekly', progress: 12, target: 20, timeRemaining: '18d', joined: false, participants: 567 },
  { id: '4', title: 'Cardio King', description: 'Run 50km total this week', type: 'weekly', progress: 22, target: 50, timeRemaining: '4d 6h', joined: false, participants: 891 },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah M.', score: 4520, avatar: 'SM' },
  { rank: 2, name: 'Jake T.', score: 4210, avatar: 'JT' },
  { rank: 3, name: 'Priya K.', score: 3980, avatar: 'PK' },
  { rank: 4, name: 'Marcus L.', score: 3750, avatar: 'ML' },
  { rank: 5, name: 'Alex Chen', score: 3420, avatar: 'AC', isCurrentUser: true },
  { rank: 6, name: 'Emma R.', score: 3200, avatar: 'ER' },
  { rank: 7, name: 'David W.', score: 2980, avatar: 'DW' },
  { rank: 8, name: 'Lisa H.', score: 2750, avatar: 'LH' },
  { rank: 9, name: 'Tom B.', score: 2540, avatar: 'TB' },
  { rank: 10, name: 'Aisha N.', score: 2310, avatar: 'AN' },
];

export const mockAchievements: Achievement[] = [
  { id: '1', title: 'First Workout', description: 'Complete your first workout', icon: '🎯', unlocked: true, date: 'Jan 5' },
  { id: '2', title: 'Week Warrior', description: '7-day workout streak', icon: '🔥', unlocked: true, date: 'Feb 12' },
  { id: '3', title: 'Century Club', description: 'Complete 100 workouts', icon: '💯', unlocked: true, date: 'Mar 20' },
  { id: '4', title: 'Iron Will', description: 'Lift 10,000 lbs total', icon: '🏋️', unlocked: true, date: 'Mar 28' },
  { id: '5', title: 'Marathon Ready', description: 'Run 42km total', icon: '🏃', unlocked: false },
  { id: '6', title: 'Social Butterfly', description: 'Join 10 competitions', icon: '🦋', unlocked: false },
];

export const mockProgressData = [
  { date: 'Mon', score: 420, strength: 250, cardio: 170 },
  { date: 'Tue', score: 380, strength: 0, cardio: 380 },
  { date: 'Wed', score: 510, strength: 510, cardio: 0 },
  { date: 'Thu', score: 290, strength: 0, cardio: 290 },
  { date: 'Fri', score: 620, strength: 400, cardio: 220 },
  { date: 'Sat', score: 450, strength: 300, cardio: 150 },
  { date: 'Sun', score: 0, strength: 0, cardio: 0 },
];

export const mockWeeklyTrend = [
  { week: 'W1', score: 2100 },
  { week: 'W2', score: 2450 },
  { week: 'W3', score: 1980 },
  { week: 'W4', score: 2800 },
  { week: 'W5', score: 3100 },
  { week: 'W6', score: 2670 },
  { week: 'W7', score: 3420 },
  { week: 'W8', score: 2900 },
];

export function calculateScore(type: 'strength' | 'cardio' | 'bodyweight', details: Record<string, number>): number {
  switch (type) {
    case 'strength':
      return Math.round((details.reps || 0) * (details.sets || 1) * ((details.weight || 0) * 0.15));
    case 'cardio':
      return Math.round((details.distance || 0) * 60 + (details.time || 0) * 2);
    case 'bodyweight':
      return Math.round((details.reps || 0) * 2);
    default:
      return 0;
  }
}
