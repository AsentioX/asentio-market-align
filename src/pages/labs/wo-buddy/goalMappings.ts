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

// ─────────────────────────────────────────────────────────────────
// Periodization engine: convert goals + deadlines → training phases
// ─────────────────────────────────────────────────────────────────

export interface TrainingPhase {
  name: string;
  weekStart: number;   // 1-based week number
  weekEnd: number;
  focus: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  intensity: 'low' | 'moderate' | 'high' | 'peak' | 'taper';
  driverFocus: string[];
  goalNames: string[];
}

interface GoalInput {
  name: string;
  category: string;
  status: string;
  current_value: number;
  target_value: number;
  deadline: string | null;
  drivers: string[];
}

// Phase templates per driver type
const PHASE_TEMPLATES: Record<string, Array<{ name: string; icon: string; color: string; bg: string; border: string; focus: string; intensity: TrainingPhase['intensity'] }>> = {
  Strength: [
    { name: 'Hypertrophy Base', icon: '🏗️', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15', focus: 'Build muscle tissue with moderate weights and higher volume', intensity: 'moderate' },
    { name: 'Strength Build', icon: '💪', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15', focus: 'Progressive overload with heavier weights and lower reps', intensity: 'high' },
    { name: 'Strength Peak', icon: '🔥', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15', focus: 'Test maximal strength near goal targets', intensity: 'peak' },
  ],
  Power: [
    { name: 'Strength Base', icon: '💪', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15', focus: 'Build raw strength as foundation for power', intensity: 'moderate' },
    { name: 'Power Development', icon: '⚡', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15', focus: 'Explosive movements and speed-strength work', intensity: 'high' },
    { name: 'Power Realization', icon: '🚀', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15', focus: 'Sport-specific power application', intensity: 'peak' },
  ],
  Endurance: [
    { name: 'Aerobic Base', icon: '🫁', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15', focus: 'Low-intensity volume to build aerobic capacity', intensity: 'low' },
    { name: 'Threshold Training', icon: '📈', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15', focus: 'Tempo runs and threshold intervals', intensity: 'moderate' },
    { name: 'Race Readiness', icon: '🏁', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15', focus: 'Race-pace work and tapering for peak performance', intensity: 'peak' },
  ],
  Efficiency: [
    { name: 'Movement Economy', icon: '📊', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/15', focus: 'Drill technique and pacing strategy', intensity: 'low' },
    { name: 'Interval Mastery', icon: '⏱️', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/15', focus: 'High-intensity intervals to improve energy systems', intensity: 'high' },
  ],
  Stability: [
    { name: 'Core Foundation', icon: '🏔️', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15', focus: 'Anti-rotation and isometric core work', intensity: 'low' },
    { name: 'Dynamic Stability', icon: '🎯', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15', focus: 'Loaded stability and balance under movement', intensity: 'moderate' },
  ],
  Mobility: [
    { name: 'Mobility Integration', icon: '🧘', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/15', focus: 'Daily mobility routines and flexibility work', intensity: 'low' },
  ],
  Technique: [
    { name: 'Skill Acquisition', icon: '🎯', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/15', focus: 'Deliberate practice and motor pattern development', intensity: 'low' },
    { name: 'Skill Refinement', icon: '✨', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/15', focus: 'High-fidelity skill practice under fatigue', intensity: 'moderate' },
  ],
};

/**
 * Generate periodized training phases from goals.
 * Uses the earliest deadline to determine total training horizon,
 * then distributes phases across that window.
 */
export function generateTrainingPhases(goals: GoalInput[]): { phases: TrainingPhase[]; totalWeeks: number; weeksRemaining: number; deadlineDate: Date | null } {
  // Real DB statuses are 'active' | 'paused' | 'completed' | 'archived'.
  // Only goals you're currently pursuing should shape the periodized plan.
  const activeGoals = goals.filter(g => g.status === 'active');

  if (activeGoals.length === 0) {
    return {
      phases: [
        { name: 'General Fitness', weekStart: 1, weekEnd: 4, focus: 'Build a balanced fitness foundation', icon: '🏋️', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', intensity: 'moderate', driverFocus: [], goalNames: [] },
        { name: 'Progressive Overload', weekStart: 5, weekEnd: 8, focus: 'Increase intensity and volume gradually', icon: '📈', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15', intensity: 'high', driverFocus: [], goalNames: [] },
      ],
      totalWeeks: 8,
      weeksRemaining: 8,
      deadlineDate: null,
    };
  }

  // Find the driving deadline (earliest with a deadline, or default 12 weeks)
  const now = new Date();
  const goalsWithDeadlines = activeGoals
    .filter(g => g.deadline)
    .map(g => ({ ...g, deadlineDate: new Date(g.deadline!) }))
    .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());

  const primaryDeadline = goalsWithDeadlines.length > 0
    ? goalsWithDeadlines[0].deadlineDate
    : null;

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksRemaining = primaryDeadline
    ? Math.max(1, Math.ceil((primaryDeadline.getTime() - now.getTime()) / msPerWeek))
    : 12; // default 12-week horizon

  const totalWeeks = weeksRemaining;

  // Collect primary drivers across all active goals
  const driverGoals: Record<string, GoalInput[]> = {};
  activeGoals.forEach(g => {
    g.drivers.forEach(d => {
      if (!driverGoals[d]) driverGoals[d] = [];
      driverGoals[d].push(g);
    });
  });

  // Sort drivers by frequency (most referenced first)
  const sortedDrivers = Object.entries(driverGoals)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([driver]) => driver);

  const phases: TrainingPhase[] = [];

  // Always add a taper/deload phase at the end if we have >= 4 weeks
  const hasTaper = totalWeeks >= 4;
  const availableWeeks = hasTaper ? totalWeeks - 1 : totalWeeks;

  // Distribute weeks across driver phase templates
  // Primary drivers get more weeks proportionally
  const driverWeightTotal = sortedDrivers.reduce((sum, _, i) => sum + (sortedDrivers.length - i), 0);
  let currentWeek = 1;

  sortedDrivers.forEach((driver, index) => {
    const templates = PHASE_TEMPLATES[driver] || PHASE_TEMPLATES.Stability;
    const weight = sortedDrivers.length - index;
    const driverWeeks = Math.max(2, Math.round((weight / driverWeightTotal) * availableWeeks));
    const goalNames = (driverGoals[driver] || []).map(g => g.name);

    if (driverWeeks <= 3 || templates.length === 1) {
      // Single phase for this driver
      const tmpl = templates[templates.length > 1 ? 1 : 0]; // pick middle or only
      phases.push({
        ...tmpl,
        weekStart: currentWeek,
        weekEnd: Math.min(currentWeek + driverWeeks - 1, availableWeeks),
        driverFocus: [driver],
        goalNames,
      });
      currentWeek += driverWeeks;
    } else {
      // Split across multiple phases
      const phaseCount = Math.min(templates.length, driverWeeks >= 6 ? 3 : 2);
      const weeksPerPhase = Math.floor(driverWeeks / phaseCount);
      let remainder = driverWeeks - weeksPerPhase * phaseCount;

      for (let p = 0; p < phaseCount; p++) {
        const extra = remainder > 0 ? 1 : 0;
        if (remainder > 0) remainder--;
        const pWeeks = weeksPerPhase + extra;
        const tmpl = templates[p];
        phases.push({
          ...tmpl,
          weekStart: currentWeek,
          weekEnd: Math.min(currentWeek + pWeeks - 1, availableWeeks),
          driverFocus: [driver],
          goalNames,
        });
        currentWeek += pWeeks;
      }
    }
  });

  // Add taper phase
  if (hasTaper) {
    phases.push({
      name: 'Taper & Test',
      weekStart: totalWeeks,
      weekEnd: totalWeeks,
      focus: 'Reduce volume, maintain intensity, and test your goals',
      icon: '🎯',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/15',
      intensity: 'taper',
      driverFocus: sortedDrivers.slice(0, 2),
      goalNames: activeGoals.map(g => g.name),
    });
  }

  // Fix any overlaps — ensure sequential
  phases.sort((a, b) => a.weekStart - b.weekStart);
  for (let i = 1; i < phases.length; i++) {
    if (phases[i].weekStart <= phases[i - 1].weekEnd) {
      phases[i].weekStart = phases[i - 1].weekEnd + 1;
    }
    if (phases[i].weekEnd < phases[i].weekStart) {
      phases[i].weekEnd = phases[i].weekStart;
    }
  }

  return { phases, totalWeeks, weeksRemaining, deadlineDate: primaryDeadline };
}

/**
 * Determine which phase the user is currently in.
 */
export function getCurrentPhaseIndex(phases: TrainingPhase[], totalWeeks: number, deadlineDate: Date | null): number {
  if (!deadlineDate) return 0;
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksElapsed = Math.floor((now.getTime() - (deadlineDate.getTime() - totalWeeks * msPerWeek)) / msPerWeek);
  const currentWeek = Math.max(1, Math.min(weeksElapsed + 1, totalWeeks));
  
  for (let i = 0; i < phases.length; i++) {
    if (currentWeek >= phases[i].weekStart && currentWeek <= phases[i].weekEnd) return i;
  }
  return 0;
}
