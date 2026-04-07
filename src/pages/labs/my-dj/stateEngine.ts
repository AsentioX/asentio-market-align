// State Engine: infers current physiological state and determines music adaptation strategy

export type UserMode = 'calm' | 'focus' | 'energize' | 'endurance' | 'recovery';

export interface BioInputs {
  heartRate: number;
  hrv: number; // ms – higher = more relaxed
  cadence: number; // steps/min
  sleepScore: number; // 0-100
  stress: number; // 0-100
}

export interface ContextInputs {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  activityType: 'work' | 'run' | 'gym' | 'relax' | 'commute' | 'idle';
}

export type PhysioState = 'calm' | 'stressed' | 'focused' | 'fatigued' | 'energized' | 'exercising' | 'resting';

export interface StateSnapshot {
  current: PhysioState;
  target: PhysioState;
  alignment: number; // 0-1, how close current is to target
  strategy: 'mirror' | 'counterbalance';
}

function inferCurrentState(bio: BioInputs): PhysioState {
  if (bio.cadence > 60) return 'exercising';
  if (bio.heartRate > 140) return 'exercising';
  if (bio.stress > 65 || (bio.heartRate > 100 && bio.hrv < 30)) return 'stressed';
  if (bio.heartRate < 65 && bio.hrv > 60) return 'calm';
  if (bio.stress < 30 && bio.heartRate < 80 && bio.cadence < 10) return 'focused';
  if (bio.sleepScore < 40 || bio.hrv < 20) return 'fatigued';
  if (bio.heartRate > 85) return 'energized';
  return 'resting';
}

function modeToTarget(mode: UserMode): PhysioState {
  switch (mode) {
    case 'calm': return 'calm';
    case 'focus': return 'focused';
    case 'energize': return 'energized';
    case 'endurance': return 'exercising';
    case 'recovery': return 'resting';
  }
}

function computeAlignment(current: PhysioState, target: PhysioState): number {
  if (current === target) return 1;
  const affinities: Record<PhysioState, PhysioState[]> = {
    calm: ['resting', 'focused'],
    stressed: ['energized', 'exercising'],
    focused: ['calm', 'resting'],
    fatigued: ['resting', 'calm'],
    energized: ['exercising', 'stressed'],
    exercising: ['energized'],
    resting: ['calm', 'fatigued'],
  };
  if (affinities[target]?.includes(current)) return 0.6;
  return 0.2;
}

export function computeState(bio: BioInputs, mode: UserMode): StateSnapshot {
  const current = inferCurrentState(bio);
  const target = modeToTarget(mode);
  const alignment = computeAlignment(current, target);

  // Mirror when performing (endurance/energize) – support the current state
  // Counterbalance for wellness (calm/focus/recovery) – guide toward target
  const performanceModes: UserMode[] = ['endurance', 'energize'];
  const strategy = performanceModes.includes(mode) ? 'mirror' : 'counterbalance';

  return { current, target, alignment, strategy };
}

export function getTimeOfDay(): ContextInputs['timeOfDay'] {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

export const MODE_META: Record<UserMode, { label: string; emoji: string; description: string; color: string }> = {
  calm: { label: 'Calm', emoji: '🧘', description: 'Reduce stress & anxiety', color: 'from-sky-500 to-blue-600' },
  focus: { label: 'Focus', emoji: '🎯', description: 'Deep work & productivity', color: 'from-violet-500 to-purple-600' },
  energize: { label: 'Energize', emoji: '⚡', description: 'General activation', color: 'from-amber-500 to-orange-600' },
  endurance: { label: 'Endurance', emoji: '🏃', description: 'Steady-state workouts', color: 'from-emerald-500 to-green-600' },
  recovery: { label: 'Recovery', emoji: '🌙', description: 'Cooldown & relaxation', color: 'from-indigo-400 to-blue-500' },
};

export const PHYSIO_LABELS: Record<PhysioState, string> = {
  calm: 'Calm',
  stressed: 'Stressed',
  focused: 'Focused',
  fatigued: 'Fatigued',
  energized: 'Energized',
  exercising: 'Exercising',
  resting: 'Resting',
};
