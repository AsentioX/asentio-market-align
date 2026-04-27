// Plan generation: weighted driver scoring, multi-week periodization, persistence,
// adaptive adjustments, and rich human-readable reasons.
//
// The engine still uses goal DRIVERS as the primary planning mechanism.
// Goal CATEGORIES are for organization/UX only.

import { ACTIVITY_DRIVER_MAP } from './goalMappings';
import { EXERCISE_LIBRARY, type ExerciseDefinition } from './exerciseLibrary';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface PlanExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  note?: string;
  type: 'strength' | 'cardio' | 'bodyweight' | 'flexibility';
  libraryId?: string;
  icon?: string;
  reason?: string; // explanation for why this exercise is in this session
}

export interface PlanSession {
  label: string;
  workoutType: 'strength' | 'cardio' | 'bodyweight' | 'rest' | 'active_recovery';
  exercises: PlanExercise[];
  focusDrivers: string[];
  reason: string;
  intensity?: 'low' | 'medium' | 'high' | 'peak' | 'taper';
}

export interface PlanDay {
  dayOfWeek: number;
  sessions: PlanSession[];
  isRest: boolean;
  restReason?: string;
}

export interface PlanWeek {
  weekNumber: number;
  phase: string;
  weeklyFocus: string;
  intensityLevel: 'low' | 'medium' | 'high' | 'deload';
  volumeLevel: 'low' | 'medium' | 'high';
  reason: string;
  days: PlanDay[];
}

export interface MultiWeekPlan {
  totalWeeks: number;
  startDate: string; // ISO date
  endDate: string;
  weeks: PlanWeek[];
  generationReason: string;
}

export interface ScoredGoal {
  id: string;
  title: string;
  priority: 'primary' | 'secondary' | 'supporting';
  status: string;
  drivers: Array<{ driver: string; weight: number }>;
  targetDate?: string | null;
}

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─────────────────────────────────────────────
// Exercise library helpers
// ─────────────────────────────────────────────
function toPlanExercise(def: ExerciseDefinition, reason?: string): PlanExercise {
  const planType: PlanExercise['type'] =
    def.category === 'endurance' ? 'cardio' :
    def.category === 'strength' ? 'strength' :
    def.category === 'bodyweight' || def.category === 'power' || def.category === 'agility' ? 'bodyweight' :
    'flexibility';

  const pe: PlanExercise = {
    name: def.name,
    type: planType,
    libraryId: def.id,
    icon: def.icon,
    reason,
  };

  if (def.entryType === 'sets') {
    const setsDef = def.defaultMetrics.find(m => m.key === 'sets');
    const repsDef = def.defaultMetrics.find(m => m.key === 'reps' || m.key === 'reps_per_leg');
    pe.sets = (setsDef?.defaultValue as number) || 3;
    pe.reps = (repsDef?.defaultValue as number) || 10;
  } else if (def.entryType === 'duration') {
    const durDef = def.defaultMetrics.find(m => m.key === 'duration');
    const secs = (durDef?.defaultValue as number) || 60;
    pe.duration = secs >= 60 ? `${Math.round(secs / 60)} min` : `${secs} sec`;
    pe.sets = (def.defaultMetrics.find(m => m.key === 'sets')?.defaultValue as number) || 1;
  } else {
    pe.duration = '20 min';
  }

  return pe;
}

function buildDriverExercises(): Record<string, PlanExercise[]> {
  const map: Record<string, PlanExercise[]> = {};
  for (const def of EXERCISE_LIBRARY) {
    for (const driver of def.linkedDrivers) {
      if (!map[driver]) map[driver] = [];
      map[driver].push(toPlanExercise(def));
    }
  }
  if (!map['Mobility']) {
    map['Mobility'] = [
      { name: 'Dynamic Stretching', duration: '15 min', type: 'flexibility' },
      { name: 'Yoga Flow', duration: '20 min', type: 'flexibility' },
    ];
  }
  if (!map['Technique']) {
    map['Technique'] = [
      { name: 'Skill Drills', duration: '20 min', type: 'flexibility' },
      { name: 'Form Practice', duration: '15 min', type: 'flexibility' },
    ];
  }
  return map;
}

const driverExercises = buildDriverExercises();

const SESSION_LABELS: Record<string, string> = {
  Strength: 'Upper Body Strength',
  Endurance: 'Cardio Endurance',
  Power: 'Power Training',
  Stability: 'Core & Stability',
  Mobility: 'Mobility & Recovery',
  Efficiency: 'Cardio Intervals',
  Technique: 'Skill Work',
};

// ─────────────────────────────────────────────
// Weighted driver scoring
// ─────────────────────────────────────────────
const PRIORITY_MULTIPLIER: Record<string, number> = {
  primary: 1.5,
  secondary: 1.2,
  supporting: 1.0,
};

function urgencyMultiplier(targetDate?: string | null): number {
  if (!targetDate) return 1.0;
  const ms = new Date(targetDate).getTime() - Date.now();
  const weeks = ms / (7 * 24 * 60 * 60 * 1000);
  if (weeks <= 2) return 1.5;
  if (weeks <= 6) return 1.3;
  if (weeks <= 12) return 1.15;
  return 1.0;
}

export interface DriverScore {
  driver: string;
  score: number;
  goalNames: string[];
}

// Real goal statuses from the DB are: 'active' | 'paused' | 'completed' | 'archived'.
// Only 'active' goals should drive training plan generation.
function isActiveGoal(status: string): boolean {
  return status === 'active';
}

export function computeDriverScores(goals: ScoredGoal[]): DriverScore[] {
  const active = goals.filter(g => isActiveGoal(g.status));
  const map: Record<string, { score: number; goalNames: Set<string> }> = {};

  for (const g of active) {
    const priorityMult = PRIORITY_MULTIPLIER[g.priority] ?? 1.0;
    const urgencyMult = urgencyMultiplier(g.targetDate);
    for (const d of g.drivers) {
      const score = d.weight * priorityMult * urgencyMult;
      if (!map[d.driver]) map[d.driver] = { score: 0, goalNames: new Set() };
      map[d.driver].score += score;
      map[d.driver].goalNames.add(g.title);
    }
  }

  return Object.entries(map)
    .map(([driver, v]) => ({ driver, score: Math.round(v.score * 10) / 10, goalNames: Array.from(v.goalNames) }))
    .sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────
// Reason builders (fix the "Supports: , " bug)
// ─────────────────────────────────────────────
function supportsLine(goalNames: string[]): string {
  const filtered = goalNames.filter(n => n && n.trim());
  if (filtered.length === 0) return 'Supports your selected training priorities.';
  return `Supports: ${filtered.slice(0, 3).join(', ')}`;
}

function sessionReason(driver: string, goalNames: string[]): string {
  const supports = supportsLine(goalNames);
  const driverPhrases: Record<string, string> = {
    Strength: 'This strength session improves force production and muscle development.',
    Endurance: 'This endurance session builds aerobic capacity and stamina.',
    Power: 'This power session develops explosive strength and speed.',
    Stability: 'This core session improves stability and movement control.',
    Mobility: 'This mobility work helps recovery and improves movement quality.',
    Efficiency: 'This interval session improves energy economy and pacing.',
    Technique: 'This skill session refines movement patterns and motor control.',
  };
  return `${driverPhrases[driver] || `Focus on ${driver.toLowerCase()}.`} ${supports}`;
}

function exerciseReason(exerciseName: string, driver: string, goalNames: string[]): string {
  const supports = supportsLine(goalNames);
  return `${exerciseName} builds ${driver.toLowerCase()}. ${supports}`;
}

// ─────────────────────────────────────────────
// Backwards-compatible API: weekly plan from raw goals
// (kept so existing UI keeps working)
// ─────────────────────────────────────────────
type LegacyGoal = {
  id?: string;
  status: string;
  drivers: string[];
  driverDetails?: Array<{ driver: string; weight: number; explanation?: string | null }>;
  name?: string;
  title?: string;
  priority?: string;
  deadline?: string | null;
  target_date?: string | null;
};

function legacyToScored(goals: LegacyGoal[]): ScoredGoal[] {
  return goals.map(g => {
    const p = g.priority;
    const priority: 'primary' | 'secondary' | 'supporting' =
      p === 'secondary' || p === 'supporting' ? p : 'primary';
    // Prefer per-driver weights from driverDetails when present (real DB data),
    // fall back to a neutral weight of 5 only when only legacy strings are provided.
    const drivers = g.driverDetails && g.driverDetails.length > 0
      ? g.driverDetails.map(d => ({ driver: d.driver, weight: d.weight ?? 5 }))
      : g.drivers.map(d => ({ driver: d, weight: 5 }));
    return {
      id: g.id ?? '',
      title: g.title ?? g.name ?? '',
      priority,
      status: g.status,
      drivers,
      targetDate: g.target_date ?? g.deadline ?? null,
    };
  });
}

export function generatePlanFromGoals(goals: LegacyGoal[]): PlanDay[] {
  // No active goals → no auto-generated plan. The UI shows an empty state
  // and the user can still log a freeform workout.
  const activeGoals = goals.filter(g => isActiveGoal(g.status));
  if (activeGoals.length === 0) return [];
  return generateWeekFromScores(computeDriverScores(legacyToScored(activeGoals)), 'medium', 'medium');
}

// Convenience wrapper so UI can build a multi-week plan from the same legacy goal shape.
export function generateMultiWeekFromGoals(
  goals: LegacyGoal[],
  opts?: { startDate?: Date; defaultWeeks?: number },
): MultiWeekPlan {
  return generateMultiWeekPlan(legacyToScored(goals), opts);
}

// ─────────────────────────────────────────────
// Generate a single week given driver scores + intensity/volume
// ─────────────────────────────────────────────
function generateWeekFromScores(
  scores: DriverScore[],
  intensity: PlanWeek['intensityLevel'],
  volume: PlanWeek['volumeLevel'],
): PlanDay[] {
  if (scores.length === 0) {
    return defaultWeeklyPlan();
  }

  const topDrivers = scores.map(s => s.driver);
  const trainingDays = volume === 'low' ? 3 : volume === 'high' ? 5 : 4;
  const isDeload = intensity === 'deload';
  const sessionIntensity: PlanSession['intensity'] =
    isDeload ? 'low' : intensity === 'low' ? 'low' : intensity === 'high' ? 'high' : 'medium';

  const plan: PlanDay[] = [];

  for (let day = 0; day < 7; day++) {
    if (day === 2 || (day === 6 && trainingDays <= 4)) {
      plan.push({
        dayOfWeek: day,
        isRest: day !== 6,
        restReason: day === 6 ? undefined : isDeload ? 'Deload recovery' : 'Recovery day',
        sessions: day === 6
          ? [{
              label: 'Mobility & Stretch',
              workoutType: 'active_recovery',
              focusDrivers: ['Mobility'],
              exercises: (driverExercises.Mobility || []).slice(0, 2),
              reason: 'This active recovery day reduces fatigue so you can train harder later in the week.',
              intensity: 'low',
            }]
          : [],
      });
      continue;
    }
    if (day === 5 && trainingDays <= 3) {
      plan.push({ dayOfWeek: day, isRest: true, sessions: [], restReason: 'Recovery day' });
      continue;
    }

    const activeDayIndex = plan.filter(p => !p.isRest && p.sessions.length > 0).length;
    const driverIdx = activeDayIndex % topDrivers.length;
    const primary = topDrivers[driverIdx];
    const secondary = topDrivers[(driverIdx + 1) % topDrivers.length];
    const primaryGoals = scores[driverIdx]?.goalNames ?? [];

    const workoutType: PlanSession['workoutType'] =
      ['Endurance', 'Efficiency'].includes(primary) ? 'cardio' :
      ['Stability'].includes(primary) ? 'bodyweight' : 'strength';

    const exerciseCount = isDeload ? 2 : volume === 'high' ? 4 : 3;
    const primaryExercises = (driverExercises[primary] || [])
      .slice(0, exerciseCount)
      .map(e => ({ ...e, reason: exerciseReason(e.name, primary, primaryGoals) }));

    const sessions: PlanSession[] = [{
      label: SESSION_LABELS[primary] || `${primary} Training`,
      workoutType,
      focusDrivers: [primary],
      exercises: primaryExercises,
      reason: sessionReason(primary, primaryGoals),
      intensity: sessionIntensity,
    }];

    if (!isDeload && secondary !== primary && (day === 1 || day === 4) && topDrivers.length >= 2) {
      const secGoals = scores.find(s => s.driver === secondary)?.goalNames ?? [];
      const secType: PlanSession['workoutType'] =
        ['Endurance', 'Efficiency'].includes(secondary) ? 'cardio' :
        ['Stability'].includes(secondary) ? 'bodyweight' : 'strength';
      const secEx = (driverExercises[secondary] || [])
        .slice(0, 2)
        .map(e => ({ ...e, reason: exerciseReason(e.name, secondary, secGoals) }));
      sessions.push({
        label: SESSION_LABELS[secondary] || `${secondary} Session`,
        workoutType: secType,
        focusDrivers: [secondary],
        exercises: secEx,
        reason: sessionReason(secondary, secGoals),
        intensity: sessionIntensity,
      });
    }

    plan.push({ dayOfWeek: day, isRest: false, sessions });
  }
  return plan;
}

function defaultWeeklyPlan(): PlanDay[] {
  return [
    { dayOfWeek: 0, isRest: false, sessions: [
      { label: 'Upper Body Strength', workoutType: 'strength', focusDrivers: ['Strength'], exercises: driverExercises.Strength.slice(0, 3), reason: 'Build foundational strength.', intensity: 'medium' },
    ]},
    { dayOfWeek: 1, isRest: false, sessions: [
      { label: 'Cardio Endurance', workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: driverExercises.Endurance.slice(0, 2), reason: 'Build aerobic base.', intensity: 'medium' },
    ]},
    { dayOfWeek: 2, isRest: true, sessions: [], restReason: 'Recovery day' },
    { dayOfWeek: 3, isRest: false, sessions: [
      { label: 'Core & Stability', workoutType: 'bodyweight', focusDrivers: ['Stability'], exercises: driverExercises.Stability, reason: 'Core and bodyweight strength.', intensity: 'medium' },
    ]},
    { dayOfWeek: 4, isRest: false, sessions: [
      { label: 'Lower Body Strength', workoutType: 'strength', focusDrivers: ['Strength'], exercises: driverExercises.Strength.slice(2, 5), reason: 'Lower body focus.', intensity: 'medium' },
    ]},
    { dayOfWeek: 5, isRest: false, sessions: [
      { label: 'Long Run', workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: driverExercises.Endurance.slice(0, 1), reason: 'Endurance session.', intensity: 'medium' },
    ]},
    { dayOfWeek: 6, isRest: false, sessions: [
      { label: 'Mobility & Stretch', workoutType: 'active_recovery', focusDrivers: ['Mobility'], exercises: driverExercises.Mobility || [], reason: 'Active recovery and mobility.', intensity: 'low' },
    ]},
  ];
}

// ─────────────────────────────────────────────
// Multi-week periodization
// ─────────────────────────────────────────────
type PhaseTemplate = { phase: string; intensity: PlanWeek['intensityLevel']; volume: PlanWeek['volumeLevel']; focus: string };

function pickPeriodization(weeks: number): PhaseTemplate[] {
  // Heuristic phase distribution. Always end with a deload or test week if >= 4 weeks.
  if (weeks <= 3) {
    return Array.from({ length: weeks }, (): PhaseTemplate => ({ phase: 'Foundation', intensity: 'medium', volume: 'medium', focus: 'Build a balanced base.' }));
  }
  if (weeks === 4) return [
    { phase: 'Foundation', intensity: 'medium', volume: 'medium', focus: 'Build movement quality and base volume.' },
    { phase: 'Build', intensity: 'medium', volume: 'high', focus: 'Add training volume.' },
    { phase: 'Intensify', intensity: 'high', volume: 'medium', focus: 'Raise intensity, lower volume slightly.' },
    { phase: 'Deload', intensity: 'deload', volume: 'low', focus: 'Recover and consolidate gains.' },
  ];
  if (weeks <= 6) return ([
    { phase: 'Foundation', intensity: 'medium', volume: 'medium', focus: 'Build movement quality and base volume.' },
    { phase: 'Build', intensity: 'medium', volume: 'high', focus: 'Progressive overload.' },
    { phase: 'Build', intensity: 'medium', volume: 'high', focus: 'Continue progressive overload.' },
    { phase: 'Intensify', intensity: 'high', volume: 'medium', focus: 'Higher intensity, sport-specific work.' },
    { phase: 'Peak', intensity: 'high', volume: 'low', focus: 'Specificity and sharpening.' },
    { phase: 'Test', intensity: 'high', volume: 'low', focus: 'Goal-specific test or attempt.' },
  ] as PhaseTemplate[]).slice(0, weeks);
  // 7-12+
  const result: PhaseTemplate[] = [];
  result.push({ phase: 'Foundation', intensity: 'medium', volume: 'medium', focus: 'Establish movement quality and base.' });
  result.push({ phase: 'Foundation', intensity: 'medium', volume: 'medium', focus: 'Continue base building.' });
  const buildCount = Math.max(1, Math.floor((weeks - 5) / 2));
  for (let i = 0; i < buildCount; i++) result.push({ phase: 'Build', intensity: 'medium', volume: 'high', focus: 'Progressive overload week.' });
  result.push({ phase: 'Deload', intensity: 'deload', volume: 'low', focus: 'Recovery week.' });
  const intensifyCount = weeks - result.length - 2;
  for (let i = 0; i < Math.max(1, intensifyCount); i++) result.push({ phase: 'Intensify', intensity: 'high', volume: 'medium', focus: 'Higher intensity, lower volume.' });
  result.push({ phase: 'Peak', intensity: 'high', volume: 'low', focus: 'Sharpening and specificity.' });
  result.push({ phase: 'Test', intensity: 'high', volume: 'low', focus: 'Goal-specific test.' });
  return result.slice(0, weeks);
}

export function generateMultiWeekPlan(goals: ScoredGoal[], opts?: { startDate?: Date; defaultWeeks?: number }): MultiWeekPlan {
  const start = opts?.startDate ?? new Date();
  const scores = computeDriverScores(goals);

  // Determine total weeks from earliest target date among ACTIVE goals
  const dated = goals
    .filter(g => g.targetDate && isActiveGoal(g.status))
    .map(g => new Date(g.targetDate as string))
    .sort((a, b) => a.getTime() - b.getTime());
  const earliestTarget = dated[0];
  const defaultWeeks = opts?.defaultWeeks ?? 8;
  const totalWeeks = earliestTarget
    ? Math.max(2, Math.min(16, Math.ceil((earliestTarget.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))))
    : defaultWeeks;

  const phaseTemplates = pickPeriodization(totalWeeks);
  const topGoalNames = goals
    .filter(g => isActiveGoal(g.status) && g.priority === 'primary')
    .map(g => g.title)
    .filter(Boolean);

  const weeks: PlanWeek[] = phaseTemplates.map((tmpl, i) => {
    const days = generateWeekFromScores(scores, tmpl.intensity, tmpl.volume);
    return {
      weekNumber: i + 1,
      phase: tmpl.phase,
      weeklyFocus: tmpl.focus,
      intensityLevel: tmpl.intensity,
      volumeLevel: tmpl.volume,
      reason: `Week ${i + 1} (${tmpl.phase}): ${tmpl.focus} ${supportsLine(topGoalNames)}`,
      days,
    };
  });

  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + totalWeeks * 7 - 1);

  const generationReason = goals.length === 0
    ? `${totalWeeks}-week general fitness plan to build a balanced foundation.`
    : `${totalWeeks}-week plan optimized for: ${supportsLine(topGoalNames).replace(/^Supports: /, '')}. Top training drivers: ${scores.slice(0, 3).map(s => s.driver).join(', ')}.`;

  return {
    totalWeeks,
    startDate: start.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    weeks,
    generationReason,
  };
}

// ─────────────────────────────────────────────
// Adaptive adjustments based on completion logs
// ─────────────────────────────────────────────
export type AdaptiveSuggestion =
  | { type: 'keep'; reason: string }
  | { type: 'reduce_volume'; reason: string }
  | { type: 'increase_intensity'; reason: string }
  | { type: 'add_recovery'; reason: string }
  | { type: 'regenerate_plan'; reason: string }
  | { type: 'shift_drivers'; reason: string; drivers: string[] };

export interface ProgressSnapshot {
  completedCount: number;
  skippedCount: number;
  partialCount: number;
  avgPerceivedEffort: number | null;
  weeksRemaining: number | null;
}

export function adjustPlanBasedOnProgress(snapshot: ProgressSnapshot): AdaptiveSuggestion {
  const { completedCount, skippedCount, partialCount, avgPerceivedEffort, weeksRemaining } = snapshot;
  const total = completedCount + skippedCount + partialCount;

  if (total >= 4 && skippedCount / total >= 0.4) {
    return { type: 'reduce_volume', reason: 'You skipped a lot of workouts recently. Reducing volume to make consistency easier.' };
  }
  if (avgPerceivedEffort !== null && avgPerceivedEffort >= 8.5 && total >= 3) {
    return { type: 'add_recovery', reason: 'Your perceived effort has been very high. Adding a recovery day to prevent burnout.' };
  }
  if (avgPerceivedEffort !== null && avgPerceivedEffort <= 4 && total >= 3) {
    return { type: 'increase_intensity', reason: 'Workouts are feeling easy. Stepping intensity up.' };
  }
  if (weeksRemaining !== null && weeksRemaining <= 2) {
    return { type: 'shift_drivers', reason: 'Your goal date is close. Shifting toward goal-specific work.', drivers: ['Technique', 'Efficiency'] };
  }
  if (total === 0) {
    return { type: 'keep', reason: 'No workouts logged yet. Stick with the current plan.' };
  }
  return { type: 'keep', reason: 'You are on track. Keep the current plan.' };
}

// ─────────────────────────────────────────────
// Helpers used by UI
// ─────────────────────────────────────────────
export function getTodayIndex(): number {
  const today = new Date().getDay();
  return today === 0 ? 6 : today - 1;
}

export const EXERCISE_TYPE_ICONS: Record<string, { emoji: string; color: string }> = {
  strength: { emoji: '🏋️', color: 'text-blue-400' },
  cardio: { emoji: '🏃', color: 'text-orange-400' },
  bodyweight: { emoji: '💪', color: 'text-purple-400' },
  flexibility: { emoji: '🧘', color: 'text-teal-400' },
};

export function getAllExercisesForDay(day: PlanDay): PlanExercise[] {
  return day.sessions.flatMap(s => s.exercises);
}

export function getAllDriversForDay(day: PlanDay): string[] {
  const drivers = new Set<string>();
  day.sessions.forEach(s => s.focusDrivers.forEach(d => drivers.add(d)));
  return Array.from(drivers);
}

function estimateExerciseMinutes(ex: PlanExercise): number {
  if (ex.duration) {
    const match = ex.duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 5;
  }
  return (ex.sets || 3) * 2;
}

const REST_BETWEEN_EXERCISES_MIN = 1.5;
const REST_BETWEEN_SESSIONS_MIN = 3;

export function adjustPlanForDuration(day: PlanDay, targetMinutes: number): PlanDay {
  if (day.isRest || day.sessions.length === 0) return day;
  const items: { si: number; ei: number; ex: PlanExercise; mins: number }[] = [];
  day.sessions.forEach((session, si) => session.exercises.forEach((ex, ei) => items.push({ si, ei, ex, mins: estimateExerciseMinutes(ex) })));
  const picked: typeof items = [];
  let usedMinutes = 0;
  for (const item of items) {
    const restNeeded = picked.length > 0 ? REST_BETWEEN_EXERCISES_MIN : 0;
    const sessionChanged = picked.length > 0 && picked[picked.length - 1].si !== item.si;
    const extraRest = sessionChanged ? REST_BETWEEN_SESSIONS_MIN - REST_BETWEEN_EXERCISES_MIN : 0;
    const totalRest = restNeeded + extraRest;
    if (usedMinutes + totalRest + item.mins <= targetMinutes) {
      usedMinutes += totalRest + item.mins;
      picked.push(item);
    }
  }
  if (picked.length === 0 && items.length > 0) picked.push(items[0]);
  const newSessionMap = new Map<number, PlanExercise[]>();
  picked.forEach(p => {
    if (!newSessionMap.has(p.si)) newSessionMap.set(p.si, []);
    newSessionMap.get(p.si)!.push(p.ex);
  });
  const newSessions: PlanSession[] = [];
  day.sessions.forEach((session, si) => {
    const exercises = newSessionMap.get(si);
    if (exercises && exercises.length > 0) newSessions.push({ ...session, exercises });
  });
  return { ...day, sessions: newSessions };
}

export function estimatePlanDuration(day: PlanDay): number {
  if (day.isRest || day.sessions.length === 0) return 0;
  let total = 0;
  let count = 0;
  day.sessions.forEach((session, si) => {
    if (si > 0 && count > 0) total += REST_BETWEEN_SESSIONS_MIN;
    session.exercises.forEach((ex, ei) => {
      if (ei > 0) total += REST_BETWEEN_EXERCISES_MIN;
      total += estimateExerciseMinutes(ex);
      count++;
    });
  });
  return Math.round(total);
}
