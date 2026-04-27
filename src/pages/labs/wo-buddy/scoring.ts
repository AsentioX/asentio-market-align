// Workout scoring utility (extracted from former mockData.ts so the engine
// is decoupled from any sample/seed content).

export type WorkoutMode = 'strength' | 'cardio' | 'bodyweight';

export function calculateScore(type: WorkoutMode, details: Record<string, number>): number {
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

// Rough kcal estimate from one logged exercise (used for period overviews).
// Conservative defaults — better than mock data, replaceable when wearables
// supply true energy expenditure.
export function estimateCalories(args: {
  type: string;
  durationSeconds?: number | null;
  distanceKm?: number | null;
  reps?: number | null;
  sets?: number | null;
  weightLbs?: number | null;
}): number {
  const minutes = (args.durationSeconds || 0) / 60;
  switch (args.type) {
    case 'cardio':
      // ~10 kcal/min running baseline, plus a small bonus per km
      return Math.round(minutes * 10 + (args.distanceKm || 0) * 25);
    case 'strength':
      // ~6 kcal/min for resistance training
      return Math.round(Math.max(minutes, ((args.reps || 0) * (args.sets || 1)) * 0.05) * 6);
    case 'bodyweight':
      return Math.round(Math.max(minutes, (args.reps || 0) * 0.05) * 7);
    default:
      return Math.round(minutes * 5);
  }
}
