/**
 * Rep counting logic based on joint angles from pose landmarks.
 * Uses MediaPipe Pose Landmarker's 33 landmark indices.
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// MediaPipe Pose landmark indices
const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

/** Calculate angle (degrees) at point B given three points A-B-C */
function calcAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (magAB === 0 || magCB === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/** Average angle from left and right side */
function avgAngle(landmarks: Landmark[], aL: number, bL: number, cL: number, aR: number, bR: number, cR: number): number {
  const left = calcAngle(landmarks[aL], landmarks[bL], landmarks[cL]);
  const right = calcAngle(landmarks[aR], landmarks[bR], landmarks[cR]);
  return (left + right) / 2;
}

export type RepPhase = 'up' | 'down' | 'unknown';

export interface ExerciseProfile {
  /** Function to extract the tracked angle from landmarks */
  getAngle: (landmarks: Landmark[]) => number;
  /** Angle threshold to consider "down" phase (contracted) */
  downThreshold: number;
  /** Angle threshold to consider "up" phase (extended) */
  upThreshold: number;
  /** Label for display */
  label: string;
}

const exerciseProfiles: Record<string, ExerciseProfile> = {
  'Push-ups': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST),
    downThreshold: 100,
    upThreshold: 150,
    label: 'PUSH-UP',
  },
  'Bench Press': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST),
    downThreshold: 95,
    upThreshold: 150,
    label: 'BENCH PRESS',
  },
  'Squats': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE, LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE),
    downThreshold: 100,
    upThreshold: 155,
    label: 'SQUAT',
  },
  'Deadlift': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE, LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE),
    downThreshold: 110,
    upThreshold: 160,
    label: 'DEADLIFT',
  },
  'Curls': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST),
    downThreshold: 60,
    upThreshold: 140,
    label: 'BICEP CURL',
  },
  'Pull-ups': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST),
    downThreshold: 80,
    upThreshold: 155,
    label: 'PULL-UP',
  },
  'Sit-ups': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE),
    downThreshold: 80,
    upThreshold: 140,
    label: 'SIT-UP',
  },
  'Overhead Press': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST),
    downThreshold: 95,
    upThreshold: 160,
    label: 'OH PRESS',
  },
  'Barbell Row': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST),
    downThreshold: 70,
    upThreshold: 145,
    label: 'BARBELL ROW',
  },
  'Burpees': {
    getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE, LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE),
    downThreshold: 100,
    upThreshold: 155,
    label: 'BURPEE',
  },
};

/** Fallback profile: tracks elbow angle generically */
const fallbackProfile: ExerciseProfile = {
  getAngle: (lm) => avgAngle(lm, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST),
  downThreshold: 90,
  upThreshold: 150,
  label: 'EXERCISE',
};

export function getExerciseProfile(exercise: string): ExerciseProfile {
  return exerciseProfiles[exercise] ?? fallbackProfile;
}

export interface RepState {
  phase: RepPhase;
  repCount: number;
  currentAngle: number;
  formScore: string;
}

/**
 * Create a stateful rep counter for a given exercise.
 * Call `update(landmarks)` each frame. Returns current state.
 */
export function createRepCounter(exercise: string) {
  const profile = getExerciseProfile(exercise);
  let phase: RepPhase = 'unknown';
  let repCount = 0;
  let currentAngle = 0;
  let formScore = 'Detecting...';
  // Debounce: require N consecutive frames in new phase before switching
  let pendingPhase: RepPhase = 'unknown';
  let pendingFrames = 0;
  const DEBOUNCE_FRAMES = 3;

  function update(landmarks: Landmark[]): RepState {
    if (landmarks.length < 29) {
      return { phase, repCount, currentAngle, formScore: 'Low visibility' };
    }

    currentAngle = profile.getAngle(landmarks);

    // Determine raw phase from angle
    let rawPhase: RepPhase = 'unknown';
    if (currentAngle < profile.downThreshold) {
      rawPhase = 'down';
    } else if (currentAngle > profile.upThreshold) {
      rawPhase = 'up';
    }

    // Debounce phase transitions
    if (rawPhase !== 'unknown') {
      if (rawPhase === pendingPhase) {
        pendingFrames++;
      } else {
        pendingPhase = rawPhase;
        pendingFrames = 1;
      }

      if (pendingFrames >= DEBOUNCE_FRAMES && rawPhase !== phase) {
        const prevPhase = phase;
        phase = rawPhase;
        // Count a rep when transitioning from down -> up
        if (prevPhase === 'down' && phase === 'up') {
          repCount++;
        }
      }
    }

    // Evaluate form based on range of motion
    const rom = Math.abs(profile.upThreshold - profile.downThreshold);
    const rangeUsed = Math.abs(currentAngle - (phase === 'down' ? profile.downThreshold : profile.upThreshold));
    if (phase === 'unknown') {
      formScore = 'Detecting...';
    } else if (rangeUsed < rom * 0.15) {
      formScore = 'Excellent';
    } else if (rangeUsed < rom * 0.3) {
      formScore = 'Great';
    } else if (rangeUsed < rom * 0.5) {
      formScore = 'Good';
    } else {
      formScore = 'Adjust depth';
    }

    return { phase, repCount, currentAngle, formScore };
  }

  function reset() {
    phase = 'unknown';
    repCount = 0;
    pendingPhase = 'unknown';
    pendingFrames = 0;
  }

  return { update, reset, getLabel: () => profile.label };
}
