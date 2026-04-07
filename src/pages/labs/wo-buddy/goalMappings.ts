// Goal-driven training system: static mappings and helpers
// These provide the rules engine that connects activities → drivers → goals

export const GOAL_CATEGORIES = [
  { id: 'performance', label: 'Performance', icon: '🏆', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/15' },
  { id: 'capacity', label: 'Capacity', icon: '📈', color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/15' },
  { id: 'skill', label: 'Skill', icon: '🎯', color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/15' },
  { id: 'consistency', label: 'Consistency', icon: '🔥', color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/15' },
  { id: 'health', label: 'Health', icon: '💚', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/15' },
] as const;

export const METRICS = [
  { id: 'time', label: 'Time', unit: 'min' },
  { id: 'percentage', label: 'Percentage', unit: '%' },
  { id: 'reps', label: 'Reps', unit: 'reps' },
  { id: 'weight', label: 'Weight', unit: 'lbs' },
  { id: 'distance', label: 'Distance', unit: 'km' },
  { id: 'sessions', label: 'Sessions', unit: 'sessions' },
  { id: 'days', label: 'Days', unit: 'days' },
] as const;

export const PERFORMANCE_DRIVERS = [
  { name: 'Strength', icon: '💪', description: 'Raw force production and muscle power' },
  { name: 'Endurance', icon: '🫁', description: 'Sustained effort over time' },
  { name: 'Power', icon: '⚡', description: 'Explosive force and speed' },
  { name: 'Technique', icon: '🎯', description: 'Movement quality and skill precision' },
  { name: 'Efficiency', icon: '📊', description: 'Energy economy and performance per effort' },
  { name: 'Mobility', icon: '🧘', description: 'Range of motion and flexibility' },
  { name: 'Stability', icon: '🏔️', description: 'Core control and balance' },
] as const;

// Map activities to their primary performance drivers
export const ACTIVITY_DRIVER_MAP: Record<string, string[]> = {
  'Bench Press': ['Strength', 'Power'],
  'Squats': ['Strength', 'Power', 'Stability'],
  'Deadlift': ['Strength', 'Power'],
  'Deadlifts': ['Strength', 'Power'],
  'Overhead Press': ['Strength', 'Stability'],
  'Barbell Row': ['Strength'],
  'Curls': ['Strength'],
  'Run': ['Endurance', 'Efficiency'],
  'Running': ['Endurance', 'Efficiency'],
  'Sprint Intervals': ['Power', 'Endurance'],
  'Row': ['Endurance', 'Power'],
  'Rowing': ['Endurance', 'Power'],
  'Bike': ['Endurance', 'Efficiency'],
  'Cycling': ['Endurance', 'Efficiency'],
  'Swimming': ['Endurance', 'Technique'],
  'Jump Rope': ['Endurance', 'Efficiency'],
  'Stair Climbing': ['Endurance', 'Strength'],
  'Push-ups': ['Endurance', 'Stability'],
  'Push-Ups': ['Endurance', 'Stability'],
  'Burpees': ['Endurance', 'Power'],
  'Pull-ups': ['Strength'],
  'Pull-Ups': ['Strength'],
  'Sit-ups': ['Stability'],
  'Sit-Ups / Crunches': ['Stability'],
  'Plank': ['Stability'],
  'Box Jumps': ['Power', 'Strength'],
  'Shuttle Runs': ['Power', 'Endurance'],
  'Lunges': ['Strength', 'Stability'],
  'Leg Press': ['Strength'],
};

// Goal templates for quick creation
export const GOAL_TEMPLATES = [
  { name: 'Run 5K in under 25 min', category: 'performance', metric: 'time', target: 25, drivers: ['Endurance', 'Efficiency'] },
  { name: 'Squat 225 lbs', category: 'capacity', metric: 'weight', target: 225, drivers: ['Strength', 'Power'] },
  { name: 'Bench Press 185 lbs', category: 'capacity', metric: 'weight', target: 185, drivers: ['Strength'] },
  { name: 'Train 4x per week', category: 'consistency', metric: 'sessions', target: 4, drivers: ['Endurance'] },
  { name: '30-day workout streak', category: 'consistency', metric: 'days', target: 30, drivers: ['Endurance'] },
  { name: '100 push-ups in one set', category: 'capacity', metric: 'reps', target: 100, drivers: ['Endurance', 'Stability'] },
  { name: 'Improve mobility routine', category: 'health', metric: 'sessions', target: 12, drivers: ['Mobility'] },
];

// Generate a "Why This Matters" insight for a given activity
export function getActivityInsight(activityName: string, goalNames: string[], drivers: string[]) {
  const matchedDrivers = ACTIVITY_DRIVER_MAP[activityName] || [];
  const relevantDrivers = matchedDrivers.filter(d => drivers.includes(d));
  const connectedGoals = goalNames.length > 0 ? goalNames : [];

  return {
    drivers: matchedDrivers,
    relevantDrivers,
    connectedGoals,
    hasConnection: relevantDrivers.length > 0 || connectedGoals.length > 0,
  };
}

// Generate smart coaching insights from goals and recent activity
export function generateInsights(goals: Array<{ name: string; category: string; status: string; current_value: number; target_value: number }>) {
  const insights: string[] = [];

  const onTrack = goals.filter(g => g.status === 'on_track').length;
  const atRisk = goals.filter(g => g.status === 'at_risk').length;
  const achieved = goals.filter(g => g.status === 'achieved').length;

  if (achieved > 0) insights.push(`🎉 You've achieved ${achieved} goal${achieved > 1 ? 's' : ''}! Keep the momentum going.`);
  if (atRisk > 0) insights.push(`⚠️ ${atRisk} goal${atRisk > 1 ? 's are' : ' is'} at risk. Consider increasing training frequency.`);
  if (onTrack > 0) insights.push(`✅ ${onTrack} goal${onTrack > 1 ? 's are' : ' is'} on track. Your consistency is paying off.`);

  goals.forEach(g => {
    const pct = g.target_value > 0 ? Math.round((g.current_value / g.target_value) * 100) : 0;
    if (pct >= 75 && pct < 100) insights.push(`📊 You're ${pct}% toward "${g.name}" — almost there!`);
  });

  if (insights.length === 0) insights.push('💡 Set your first goal to start getting personalized coaching insights.');

  return insights;
}

export function getGoalStatusColor(status: string) {
  switch (status) {
    case 'on_track': return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'On Track' };
    case 'at_risk': return { text: 'text-amber-400', bg: 'bg-amber-500/15', label: 'At Risk' };
    case 'achieved': return { text: 'text-blue-400', bg: 'bg-blue-500/15', label: 'Achieved' };
    default: return { text: 'text-white/40', bg: 'bg-white/5', label: status };
  }
}

export function getCategoryConfig(categoryId: string) {
  return GOAL_CATEGORIES.find(c => c.id === categoryId) || GOAL_CATEGORIES[0];
}
