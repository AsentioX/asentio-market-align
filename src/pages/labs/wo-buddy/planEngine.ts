// Shared plan generation logic used by Goals and Workout pages
import { ACTIVITY_DRIVER_MAP, PERFORMANCE_DRIVERS } from './goalMappings';
import { EXERCISE_LIBRARY, findExercise, type ExerciseDefinition } from './exerciseLibrary';

export interface PlanExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  note?: string;
  type: 'strength' | 'cardio' | 'bodyweight' | 'flexibility';
  libraryId?: string;
  icon?: string;
}

export interface PlanSession {
  label: string;
  workoutType: 'strength' | 'cardio' | 'bodyweight' | 'rest' | 'active_recovery';
  exercises: PlanExercise[];
  focusDrivers: string[];
  reason: string;
}

export interface PlanDay {
  dayOfWeek: number;
  sessions: PlanSession[];
  isRest: boolean;
  restReason?: string;
}

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Convert an ExerciseDefinition into a PlanExercise
function toPlanExercise(def: ExerciseDefinition): PlanExercise {
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
    // simple / intervals — show as duration-based
    pe.duration = '20 min';
  }

  return pe;
}

// Build driver → exercise mapping from EXERCISE_LIBRARY
function buildDriverExercises(): Record<string, PlanExercise[]> {
  const map: Record<string, PlanExercise[]> = {};
  for (const def of EXERCISE_LIBRARY) {
    for (const driver of def.linkedDrivers) {
      if (!map[driver]) map[driver] = [];
      map[driver].push(toPlanExercise(def));
    }
  }
  // Add fallback flexibility entries for drivers with no library matches
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

// Session label mapping
const SESSION_LABELS: Record<string, string> = {
  Strength: 'Upper Body Strength',
  Endurance: 'Cardio Endurance',
  Power: 'Power Training',
  Stability: 'Core & Stability',
  Mobility: 'Mobility & Recovery',
  Efficiency: 'Cardio Intervals',
  Technique: 'Skill Work',
};

export function generatePlanFromGoals(goals: Array<{ status: string; drivers: string[]; name: string }>): PlanDay[] {
  const activeGoals = goals.filter(g => g.status !== 'achieved');
  const driverFrequency: Record<string, number> = {};
  activeGoals.forEach(g => {
    g.drivers.forEach(d => {
      driverFrequency[d] = (driverFrequency[d] || 0) + 1;
    });
  });

  const topDrivers = Object.entries(driverFrequency)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);

  if (topDrivers.length === 0) {
    return [
      { dayOfWeek: 0, isRest: false, sessions: [
        { label: 'Upper Body Strength', workoutType: 'strength', focusDrivers: ['Strength'], exercises: driverExercises.Strength.slice(0, 3), reason: 'Build foundational strength' },
      ]},
      { dayOfWeek: 1, isRest: false, sessions: [
        { label: 'Cardio Endurance', workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: driverExercises.Endurance.slice(0, 2), reason: 'Build aerobic base' },
      ]},
      { dayOfWeek: 2, isRest: true, sessions: [], restReason: 'Recovery day' },
      { dayOfWeek: 3, isRest: false, sessions: [
        { label: 'Core & Stability', workoutType: 'bodyweight', focusDrivers: ['Stability'], exercises: driverExercises.Stability, reason: 'Core and bodyweight strength' },
      ]},
      { dayOfWeek: 4, isRest: false, sessions: [
        { label: 'Lower Body Strength', workoutType: 'strength', focusDrivers: ['Strength'], exercises: driverExercises.Strength.slice(2, 5), reason: 'Upper body focus' },
        { label: 'Evening Run', workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: [{ name: 'Run', duration: '20 min', type: 'cardio' }], reason: 'Light cardio finisher' },
      ]},
      { dayOfWeek: 5, isRest: false, sessions: [
        { label: 'Long Run', workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: driverExercises.Endurance.slice(0, 1), reason: 'Endurance session' },
      ]},
      { dayOfWeek: 6, isRest: false, sessions: [
        { label: 'Mobility & Stretch', workoutType: 'active_recovery', focusDrivers: ['Mobility'], exercises: driverExercises.Mobility || [], reason: 'Active recovery and mobility' },
      ]},
    ];
  }

  const plan: PlanDay[] = [];
  const trainingDays = topDrivers.length >= 3 ? 5 : topDrivers.length >= 2 ? 4 : 3;

  for (let day = 0; day < 7; day++) {
    if (day === 2 || (day === 6 && trainingDays <= 4)) {
      plan.push({
        dayOfWeek: day,
        isRest: day !== 6,
        restReason: day === 6 ? undefined : 'Recovery day',
        sessions: day === 6
          ? [{ label: 'Mobility & Stretch', workoutType: 'active_recovery', focusDrivers: ['Mobility'], exercises: driverExercises.Mobility || [], reason: 'Active recovery to support training quality' }]
          : [],
      });
      continue;
    }

    if (day === 5 && trainingDays <= 3) {
      plan.push({ dayOfWeek: day, isRest: true, sessions: [], restReason: 'Recovery day' });
      continue;
    }

    const activeDayIndex = plan.filter(p => !p.isRest && p.sessions.length > 0).length;
    const driverIndex = activeDayIndex % topDrivers.length;
    const primaryDriver = topDrivers[driverIndex];
    const secondaryDriver = topDrivers[(driverIndex + 1) % topDrivers.length];

    const workoutType: PlanSession['workoutType'] =
      ['Endurance', 'Efficiency'].includes(primaryDriver) ? 'cardio' :
      ['Stability'].includes(primaryDriver) ? 'bodyweight' : 'strength';

    const primaryExercises = (driverExercises[primaryDriver] || []).slice(0, 3);
    const goalNames = activeGoals
      .filter(g => g.drivers.some(d => d === primaryDriver))
      .map(g => g.name);

    const sessions: PlanSession[] = [{
      label: SESSION_LABELS[primaryDriver] || `${primaryDriver} Training`,
      workoutType,
      focusDrivers: [primaryDriver],
      exercises: primaryExercises,
      reason: goalNames.length > 0
        ? `Supports: ${goalNames.slice(0, 2).join(', ')}`
        : `Focus on ${primaryDriver.toLowerCase()}`,
    }];

    // Add a secondary session on some days for variety (two-a-day)
    if (secondaryDriver !== primaryDriver && (day === 1 || day === 4) && topDrivers.length >= 2) {
      const secType: PlanSession['workoutType'] =
        ['Endurance', 'Efficiency'].includes(secondaryDriver) ? 'cardio' :
        ['Stability'].includes(secondaryDriver) ? 'bodyweight' : 'strength';
      const secExercises = (driverExercises[secondaryDriver] || []).slice(0, 2);
      sessions.push({
        label: SESSION_LABELS[secondaryDriver] || `${secondaryDriver} Session`,
        workoutType: secType,
        focusDrivers: [secondaryDriver],
        exercises: secExercises,
        reason: `Supplementary ${secondaryDriver.toLowerCase()} work`,
      });
    }

    plan.push({ dayOfWeek: day, isRest: false, sessions });
  }

  return plan;
}

export function getTodayIndex(): number {
  const today = new Date().getDay();
  return today === 0 ? 6 : today - 1;
}

// Helper: get exercise type icon
export const EXERCISE_TYPE_ICONS: Record<string, { emoji: string; color: string }> = {
  strength: { emoji: '🏋️', color: 'text-blue-400' },
  cardio: { emoji: '🏃', color: 'text-orange-400' },
  bodyweight: { emoji: '💪', color: 'text-purple-400' },
  flexibility: { emoji: '🧘', color: 'text-teal-400' },
};

// Helper to flatten all exercises from all sessions for a day
export function getAllExercisesForDay(day: PlanDay): PlanExercise[] {
  return day.sessions.flatMap(s => s.exercises);
}

export function getAllDriversForDay(day: PlanDay): string[] {
  const drivers = new Set<string>();
  day.sessions.forEach(s => s.focusDrivers.forEach(d => drivers.add(d)));
  return Array.from(drivers);
}

// Estimate minutes for a single exercise
function estimateExerciseMinutes(ex: PlanExercise): number {
  if (ex.duration) {
    const match = ex.duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 5;
  }
  // sets-based: ~2 min per set
  return (ex.sets || 3) * 2;
}

const REST_BETWEEN_EXERCISES_MIN = 1.5;
const REST_BETWEEN_SESSIONS_MIN = 3;

// Adjust a day's plan to fit within a target duration (minutes), including rest periods
export function adjustPlanForDuration(day: PlanDay, targetMinutes: number): PlanDay {
  if (day.isRest || day.sessions.length === 0) return day;

  // Build a priority-ordered list of all exercises across sessions
  const items: { si: number; ei: number; ex: PlanExercise; mins: number }[] = [];
  day.sessions.forEach((session, si) => {
    session.exercises.forEach((ex, ei) => {
      items.push({ si, ei, ex, mins: estimateExerciseMinutes(ex) });
    });
  });

  // Greedily pick exercises that fit, respecting rest periods
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

  // Ensure at least one exercise
  if (picked.length === 0 && items.length > 0) {
    picked.push(items[0]);
  }

  // Rebuild sessions from picked exercises
  const newSessionMap = new Map<number, PlanExercise[]>();
  picked.forEach(p => {
    if (!newSessionMap.has(p.si)) newSessionMap.set(p.si, []);
    newSessionMap.get(p.si)!.push(p.ex);
  });

  const newSessions: PlanSession[] = [];
  day.sessions.forEach((session, si) => {
    const exercises = newSessionMap.get(si);
    if (exercises && exercises.length > 0) {
      newSessions.push({ ...session, exercises });
    }
  });

  return { ...day, sessions: newSessions };
}

// Estimate total duration of a plan day including rest periods
export function estimatePlanDuration(day: PlanDay): number {
  if (day.isRest || day.sessions.length === 0) return 0;
  let total = 0;
  let exerciseCount = 0;
  day.sessions.forEach((session, si) => {
    if (si > 0 && exerciseCount > 0) total += REST_BETWEEN_SESSIONS_MIN;
    session.exercises.forEach((ex, ei) => {
      if (ei > 0) total += REST_BETWEEN_EXERCISES_MIN;
      total += estimateExerciseMinutes(ex);
      exerciseCount++;
    });
  });
  return Math.round(total);
}
