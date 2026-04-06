// Shared plan generation logic used by Goals and Workout pages
import { ACTIVITY_DRIVER_MAP, PERFORMANCE_DRIVERS } from './goalMappings';

export interface PlanExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  note?: string;
  type: 'strength' | 'cardio' | 'bodyweight' | 'flexibility';
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

const driverExercises: Record<string, PlanExercise[]> = {
  Strength: [
    { name: 'Squats', sets: 4, reps: 8, type: 'strength' },
    { name: 'Bench Press', sets: 4, reps: 8, type: 'strength' },
    { name: 'Deadlift', sets: 3, reps: 5, type: 'strength' },
    { name: 'Overhead Press', sets: 3, reps: 8, type: 'strength' },
    { name: 'Barbell Row', sets: 3, reps: 10, type: 'strength' },
  ],
  Endurance: [
    { name: 'Run', duration: '30 min', type: 'cardio' },
    { name: 'Bike', duration: '25 min', type: 'cardio' },
    { name: 'Row', duration: '20 min', type: 'cardio' },
  ],
  Power: [
    { name: 'Squats', sets: 5, reps: 3, type: 'strength' },
    { name: 'Bench Press', sets: 5, reps: 3, type: 'strength' },
    { name: 'Burpees', sets: 3, reps: 10, type: 'bodyweight' },
  ],
  Stability: [
    { name: 'Sit-ups', sets: 3, reps: 20, type: 'bodyweight' },
    { name: 'Push-ups', sets: 3, reps: 15, type: 'bodyweight' },
    { name: 'Pull-ups', sets: 3, reps: 8, type: 'bodyweight' },
  ],
  Mobility: [
    { name: 'Dynamic stretching', duration: '15 min', type: 'flexibility' },
    { name: 'Yoga flow', duration: '20 min', type: 'flexibility' },
  ],
  Efficiency: [
    { name: 'Run', duration: '20 min intervals', type: 'cardio' },
    { name: 'Bike', duration: '30 min steady', type: 'cardio' },
  ],
  Technique: [
    { name: 'Skill drills', duration: '20 min', type: 'flexibility' },
    { name: 'Form practice', duration: '15 min', type: 'flexibility' },
  ],
};

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
