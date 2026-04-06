// Shared plan generation logic used by Goals and Workout pages
import { ACTIVITY_DRIVER_MAP, PERFORMANCE_DRIVERS } from './goalMappings';

export interface PlanExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  note?: string;
}

export interface PlanDay {
  dayOfWeek: number;
  workoutType: 'strength' | 'cardio' | 'bodyweight' | 'rest' | 'active_recovery';
  focusDrivers: string[];
  exercises: PlanExercise[];
  reason: string;
}

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const driverExercises: Record<string, PlanExercise[]> = {
  Strength: [
    { name: 'Squats', sets: 4, reps: 8 },
    { name: 'Bench Press', sets: 4, reps: 8 },
    { name: 'Deadlift', sets: 3, reps: 5 },
    { name: 'Overhead Press', sets: 3, reps: 8 },
    { name: 'Barbell Row', sets: 3, reps: 10 },
  ],
  Endurance: [
    { name: 'Run', duration: '30 min' },
    { name: 'Bike', duration: '25 min' },
    { name: 'Row', duration: '20 min' },
  ],
  Power: [
    { name: 'Squats', sets: 5, reps: 3 },
    { name: 'Bench Press', sets: 5, reps: 3 },
    { name: 'Burpees', sets: 3, reps: 10 },
  ],
  Stability: [
    { name: 'Sit-ups', sets: 3, reps: 20 },
    { name: 'Push-ups', sets: 3, reps: 15 },
    { name: 'Pull-ups', sets: 3, reps: 8 },
  ],
  Mobility: [
    { name: 'Dynamic stretching', duration: '15 min' },
    { name: 'Yoga flow', duration: '20 min' },
  ],
  Efficiency: [
    { name: 'Run', duration: '20 min intervals' },
    { name: 'Bike', duration: '30 min steady' },
  ],
  Technique: [
    { name: 'Skill drills', duration: '20 min' },
    { name: 'Form practice', duration: '15 min' },
  ],
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
      { dayOfWeek: 0, workoutType: 'strength', focusDrivers: ['Strength'], exercises: driverExercises.Strength.slice(0, 3), reason: 'Build foundational strength' },
      { dayOfWeek: 1, workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: driverExercises.Endurance.slice(0, 2), reason: 'Build aerobic base' },
      { dayOfWeek: 2, workoutType: 'rest', focusDrivers: [], exercises: [], reason: 'Recovery day' },
      { dayOfWeek: 3, workoutType: 'bodyweight', focusDrivers: ['Stability'], exercises: driverExercises.Stability, reason: 'Core and bodyweight strength' },
      { dayOfWeek: 4, workoutType: 'strength', focusDrivers: ['Strength'], exercises: driverExercises.Strength.slice(2, 5), reason: 'Upper body focus' },
      { dayOfWeek: 5, workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: driverExercises.Endurance.slice(0, 1), reason: 'Endurance session' },
      { dayOfWeek: 6, workoutType: 'active_recovery', focusDrivers: ['Mobility'], exercises: driverExercises.Mobility || [], reason: 'Active recovery and mobility' },
    ];
  }

  const plan: PlanDay[] = [];
  const trainingDays = topDrivers.length >= 3 ? 5 : topDrivers.length >= 2 ? 4 : 3;

  for (let day = 0; day < 7; day++) {
    if (day === 2 || (day === 6 && trainingDays <= 4)) {
      plan.push({
        dayOfWeek: day,
        workoutType: day === 6 ? 'active_recovery' : 'rest',
        focusDrivers: day === 6 ? ['Mobility'] : [],
        exercises: day === 6 ? (driverExercises.Mobility || []) : [],
        reason: day === 6 ? 'Active recovery to support training quality' : 'Recovery day',
      });
      continue;
    }

    if (day === 5 && trainingDays <= 3) {
      plan.push({ dayOfWeek: day, workoutType: 'rest', focusDrivers: [], exercises: [], reason: 'Recovery day' });
      continue;
    }

    const activeDayIndex = plan.filter(p => p.workoutType !== 'rest' && p.workoutType !== 'active_recovery').length;
    const driverIndex = activeDayIndex % topDrivers.length;
    const primaryDriver = topDrivers[driverIndex];
    const secondaryDriver = topDrivers[(driverIndex + 1) % topDrivers.length];
    const dayDrivers = [primaryDriver];
    if (secondaryDriver !== primaryDriver) dayDrivers.push(secondaryDriver);

    const workoutType: PlanDay['workoutType'] =
      ['Endurance', 'Efficiency'].includes(primaryDriver) ? 'cardio' :
      ['Stability'].includes(primaryDriver) ? 'bodyweight' : 'strength';

    const primaryExercises = (driverExercises[primaryDriver] || []).slice(0, 3);
    const secondaryExercises = secondaryDriver !== primaryDriver
      ? (driverExercises[secondaryDriver] || []).slice(0, 1) : [];

    const goalNames = activeGoals
      .filter(g => g.drivers.some(d => dayDrivers.includes(d)))
      .map(g => g.name);

    plan.push({
      dayOfWeek: day,
      workoutType,
      focusDrivers: dayDrivers,
      exercises: [...primaryExercises, ...secondaryExercises],
      reason: goalNames.length > 0
        ? `Supports: ${goalNames.slice(0, 2).join(', ')}`
        : `Focus on ${primaryDriver.toLowerCase()}`,
    });
  }

  return plan;
}

export function getTodayIndex(): number {
  const today = new Date().getDay();
  return today === 0 ? 6 : today - 1;
}
