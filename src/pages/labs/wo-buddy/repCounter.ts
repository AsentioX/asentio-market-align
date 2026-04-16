/**
 * Rep counting logic based on joint angles and body orientation
 * from MediaPipe Pose Landmarker's 33 landmark indices.
 *
 * Each exercise has a tailored detector that:
 *  - Picks the most relevant joints / orientation cues for that movement
 *  - Defines what "contracted" and "extended" mean for THAT exercise
 *  - Counts a rep on the correct phase transition (varies by exercise)
 *  - Optionally validates body orientation (e.g. push-ups must be horizontal)
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// MediaPipe Pose landmark indices
const LM = {
  NOSE: 0,
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

// ---------- Geometry helpers ----------

/** Angle (deg) at point B given three points A-B-C, in 2D image space */
function calcAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  if (magAB === 0 || magCB === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (magAB * magCB)))) * 180) / Math.PI;
}

function avg(a: number, b: number) {
  return (a + b) / 2;
}

function midpoint(a: Landmark, b: Landmark): Landmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

/** Angle of the torso relative to vertical (0° = standing upright, 90° = horizontal/plank). */
function torsoVerticalAngle(lm: Landmark[]): number {
  const shoulderMid = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
  const hipMid = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
  const dx = shoulderMid.x - hipMid.x;
  const dy = shoulderMid.y - hipMid.y; // image y is downward
  // angle from vertical axis
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

/** Average elbow flexion across both arms (small = bent, large = extended) */
function avgElbowAngle(lm: Landmark[]): number {
  return avg(
    calcAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_ELBOW], lm[LM.LEFT_WRIST]),
    calcAngle(lm[LM.RIGHT_SHOULDER], lm[LM.RIGHT_ELBOW], lm[LM.RIGHT_WRIST]),
  );
}

/** Average knee flexion across both legs (small = bent, large = extended) */
function avgKneeAngle(lm: Landmark[]): number {
  return avg(
    calcAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]),
    calcAngle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]),
  );
}

/** Average hip flexion (shoulder-hip-knee). Small = folded (sit-up crunch), large = extended */
function avgHipAngle(lm: Landmark[]): number {
  return avg(
    calcAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE]),
    calcAngle(lm[LM.RIGHT_SHOULDER], lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE]),
  );
}

/** Returns true if enough key landmarks have decent visibility */
function hasVisibility(lm: Landmark[], indices: number[], min = 0.5): boolean {
  return indices.every((i) => (lm[i]?.visibility ?? 0) >= min);
}

// ---------- Exercise profile ----------

export type RepPhase = 'contracted' | 'extended' | 'unknown';

export interface ExerciseDetector {
  label: string;
  /** Required landmark indices that must be visible for this exercise */
  requiredLandmarks: number[];
  /** Optional precondition (e.g. body must be horizontal for push-ups) */
  precondition?: (lm: Landmark[]) => { ok: boolean; reason?: string };
  /** Returns the primary tracked angle for display */
  getPrimaryMetric: (lm: Landmark[]) => number;
  /** Determines current phase from landmarks */
  getPhase: (lm: Landmark[]) => RepPhase;
  /** Which transition counts a rep: 'contract->extend' (e.g. push-up press) or 'extend->contract' (e.g. sit-up crunch) */
  countOn: 'contract->extend' | 'extend->contract';
  /** For form scoring: ideal contracted/extended values */
  idealContracted: number;
  idealExtended: number;
}

// ---------- Detectors per exercise ----------

/** Push-ups: body horizontal, count on elbow extension (top of push) */
const pushUpDetector: ExerciseDetector = {
  label: 'PUSH-UP',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_ELBOW, LM.RIGHT_ELBOW, LM.LEFT_WRIST, LM.RIGHT_WRIST, LM.LEFT_HIP, LM.RIGHT_HIP],
  precondition: (lm) => {
    const angle = torsoVerticalAngle(lm);
    // Body should be roughly horizontal (>50° from vertical = plank-ish)
    if (angle < 45) return { ok: false, reason: 'Get into plank position' };
    return { ok: true };
  },
  getPrimaryMetric: avgElbowAngle,
  getPhase: (lm) => {
    const a = avgElbowAngle(lm);
    if (a < 100) return 'contracted'; // chest near floor
    if (a > 150) return 'extended'; // arms locked
    return 'unknown';
  },
  countOn: 'contract->extend',
  idealContracted: 85,
  idealExtended: 165,
};

/** Squats: body vertical, count on knee extension (standing back up) */
const squatDetector: ExerciseDetector = {
  label: 'SQUAT',
  requiredLandmarks: [LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_KNEE, LM.RIGHT_KNEE, LM.LEFT_ANKLE, LM.RIGHT_ANKLE],
  precondition: (lm) => {
    const angle = torsoVerticalAngle(lm);
    // Torso should remain mostly upright (<60° from vertical)
    if (angle > 65) return { ok: false, reason: 'Stand facing camera' };
    return { ok: true };
  },
  getPrimaryMetric: avgKneeAngle,
  getPhase: (lm) => {
    const a = avgKneeAngle(lm);
    if (a < 110) return 'contracted'; // bottom of squat
    if (a > 160) return 'extended'; // standing
    return 'unknown';
  },
  countOn: 'contract->extend',
  idealContracted: 90,
  idealExtended: 170,
};

/** Sit-ups: lying down, count on the crunch (hip flexion - going UP into crunch) */
const sitUpDetector: ExerciseDetector = {
  label: 'SIT-UP',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_KNEE, LM.RIGHT_KNEE],
  getPrimaryMetric: avgHipAngle,
  getPhase: (lm) => {
    const a = avgHipAngle(lm);
    if (a < 80) return 'contracted'; // crunched up
    if (a > 130) return 'extended'; // lying flat
    return 'unknown';
  },
  // Count when reaching the crunch (the "up" of a sit-up)
  countOn: 'extend->contract',
  idealContracted: 60,
  idealExtended: 150,
};

/** Pull-ups: count when wrists rise above shoulders (chin over bar). */
const pullUpDetector: ExerciseDetector = {
  label: 'PULL-UP',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_WRIST, LM.RIGHT_WRIST, LM.NOSE],
  getPrimaryMetric: (lm) => {
    // Vertical distance between nose and wrist midpoint (positive when nose above wrists)
    const wristMid = midpoint(lm[LM.LEFT_WRIST], lm[LM.RIGHT_WRIST]);
    return (wristMid.y - lm[LM.NOSE].y) * 100; // percentage of frame height
  },
  getPhase: (lm) => {
    const wristMid = midpoint(lm[LM.LEFT_WRIST], lm[LM.RIGHT_WRIST]);
    const elbowAngle = avgElbowAngle(lm);
    // Contracted = chin near/above wrists AND elbows bent
    if (lm[LM.NOSE].y < wristMid.y + 0.05 && elbowAngle < 90) return 'contracted';
    // Extended = arms straight (dead hang)
    if (elbowAngle > 155) return 'extended';
    return 'unknown';
  },
  countOn: 'extend->contract',
  idealContracted: 0,
  idealExtended: 15,
};

/** Bicep curls: vertical body, count on full curl (small elbow angle reached) */
const curlDetector: ExerciseDetector = {
  label: 'BICEP CURL',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_ELBOW, LM.RIGHT_ELBOW, LM.LEFT_WRIST, LM.RIGHT_WRIST],
  precondition: (lm) => {
    const angle = torsoVerticalAngle(lm);
    if (angle > 45) return { ok: false, reason: 'Stand upright' };
    return { ok: true };
  },
  getPrimaryMetric: avgElbowAngle,
  getPhase: (lm) => {
    const a = avgElbowAngle(lm);
    if (a < 60) return 'contracted'; // top of curl
    if (a > 150) return 'extended'; // arm hanging
    return 'unknown';
  },
  countOn: 'extend->contract',
  idealContracted: 45,
  idealExtended: 165,
};

/** Bench press: lying horizontal, count on press (elbow extension) */
const benchDetector: ExerciseDetector = {
  label: 'BENCH PRESS',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_ELBOW, LM.RIGHT_ELBOW, LM.LEFT_WRIST, LM.RIGHT_WRIST],
  getPrimaryMetric: avgElbowAngle,
  getPhase: (lm) => {
    const a = avgElbowAngle(lm);
    if (a < 95) return 'contracted';
    if (a > 155) return 'extended';
    return 'unknown';
  },
  countOn: 'contract->extend',
  idealContracted: 80,
  idealExtended: 170,
};

/** Overhead press: vertical body, count on press up (elbow extension overhead) */
const ohpDetector: ExerciseDetector = {
  label: 'OH PRESS',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_ELBOW, LM.RIGHT_ELBOW, LM.LEFT_WRIST, LM.RIGHT_WRIST],
  precondition: (lm) => {
    const angle = torsoVerticalAngle(lm);
    if (angle > 35) return { ok: false, reason: 'Stand upright' };
    return { ok: true };
  },
  getPrimaryMetric: avgElbowAngle,
  getPhase: (lm) => {
    const a = avgElbowAngle(lm);
    const wristMid = midpoint(lm[LM.LEFT_WRIST], lm[LM.RIGHT_WRIST]);
    const shoulderMid = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    // Extended only if arms are straight AND wrists above shoulders
    if (a > 155 && wristMid.y < shoulderMid.y) return 'extended';
    if (a < 95) return 'contracted';
    return 'unknown';
  },
  countOn: 'contract->extend',
  idealContracted: 85,
  idealExtended: 170,
};

/** Deadlift: track torso hinge (hip angle from vertical via shoulder-hip line) */
const deadliftDetector: ExerciseDetector = {
  label: 'DEADLIFT',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_KNEE, LM.RIGHT_KNEE],
  getPrimaryMetric: avgHipAngle,
  getPhase: (lm) => {
    const hip = avgHipAngle(lm);
    const torso = torsoVerticalAngle(lm);
    // Bottom: hinged forward (torso tilted, hip flexed)
    if (hip < 130 && torso > 35) return 'contracted';
    // Top: standing tall (torso vertical, hip extended)
    if (hip > 160 && torso < 20) return 'extended';
    return 'unknown';
  },
  countOn: 'contract->extend',
  idealContracted: 110,
  idealExtended: 175,
};

/** Barbell row: bent-over position, count on pull (elbow flexion) */
const rowDetector: ExerciseDetector = {
  label: 'BARBELL ROW',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_ELBOW, LM.RIGHT_ELBOW, LM.LEFT_WRIST, LM.RIGHT_WRIST, LM.LEFT_HIP, LM.RIGHT_HIP],
  precondition: (lm) => {
    const angle = torsoVerticalAngle(lm);
    if (angle < 25) return { ok: false, reason: 'Hinge forward at hips' };
    return { ok: true };
  },
  getPrimaryMetric: avgElbowAngle,
  getPhase: (lm) => {
    const a = avgElbowAngle(lm);
    if (a < 80) return 'contracted'; // bar to chest
    if (a > 150) return 'extended'; // arms hanging
    return 'unknown';
  },
  countOn: 'extend->contract',
  idealContracted: 70,
  idealExtended: 165,
};

/** Burpees: multi-phase. Detect plank (low) -> stand (high) cycle via shoulder height */
const burpeeDetector: ExerciseDetector = {
  label: 'BURPEE',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_ANKLE, LM.RIGHT_ANKLE],
  getPrimaryMetric: (lm) => {
    // Shoulder height as % of frame (0 = top, 100 = bottom). Low value = standing/jumping.
    const shoulderMid = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    return shoulderMid.y * 100;
  },
  getPhase: (lm) => {
    const shoulderMid = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hipMid = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const torso = torsoVerticalAngle(lm);
    // "contracted" = down on the ground (plank) — torso horizontal, shoulders low
    if (torso > 55 && shoulderMid.y > 0.55) return 'contracted';
    // "extended" = standing/jumping — torso vertical, shoulders high
    if (torso < 25 && shoulderMid.y < 0.4 && hipMid.y < 0.7) return 'extended';
    return 'unknown';
  },
  countOn: 'contract->extend', // count when returning to stand
  idealContracted: 70,
  idealExtended: 25,
};

const detectors: Record<string, ExerciseDetector> = {
  'Push-ups': pushUpDetector,
  'Squats': squatDetector,
  'Sit-ups': sitUpDetector,
  'Pull-ups': pullUpDetector,
  'Curls': curlDetector,
  'Bench Press': benchDetector,
  'Overhead Press': ohpDetector,
  'Deadlift': deadliftDetector,
  'Barbell Row': rowDetector,
  'Burpees': burpeeDetector,
};

/** Generic fallback: tracks elbow angle */
const fallbackDetector: ExerciseDetector = {
  label: 'EXERCISE',
  requiredLandmarks: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_ELBOW, LM.RIGHT_ELBOW, LM.LEFT_WRIST, LM.RIGHT_WRIST],
  getPrimaryMetric: avgElbowAngle,
  getPhase: (lm) => {
    const a = avgElbowAngle(lm);
    if (a < 90) return 'contracted';
    if (a > 150) return 'extended';
    return 'unknown';
  },
  countOn: 'contract->extend',
  idealContracted: 80,
  idealExtended: 160,
};

export function getDetector(exercise: string): ExerciseDetector {
  return detectors[exercise] ?? fallbackDetector;
}

// ---------- Public counter ----------

// Backward-compatible aliases for existing imports
export type { ExerciseDetector as ExerciseProfile };
export const getExerciseProfile = getDetector;

export interface RepState {
  phase: 'up' | 'down' | 'unknown';
  repCount: number;
  currentAngle: number;
  formScore: string;
}

/**
 * Stateful rep counter for a given exercise.
 * Call `update(landmarks)` each frame. Returns current state.
 */
export function createRepCounter(exercise: string) {
  const det = getDetector(exercise);
  let phase: RepPhase = 'unknown';
  let repCount = 0;
  let currentMetric = 0;
  let formScore = 'Detecting...';
  let pendingPhase: RepPhase = 'unknown';
  let pendingFrames = 0;
  const DEBOUNCE_FRAMES = 3;
  // Track the deepest contraction during a rep for form scoring
  let lastContractedExtreme = det.idealExtended;
  let lastExtendedExtreme = det.idealContracted;

  /** Map internal phase to legacy 'up'/'down' enum used by the UI */
  function legacyPhase(p: RepPhase): 'up' | 'down' | 'unknown' {
    if (p === 'unknown') return 'unknown';
    // 'down' = contracted (bottom of rep visually), 'up' = extended
    return p === 'contracted' ? 'down' : 'up';
  }

  function update(landmarks: Landmark[]): RepState {
    if (landmarks.length < 29) {
      return { phase: legacyPhase(phase), repCount, currentAngle: currentMetric, formScore: 'Low visibility' };
    }

    // Visibility check on required landmarks
    if (!hasVisibility(landmarks, det.requiredLandmarks)) {
      return { phase: legacyPhase(phase), repCount, currentAngle: currentMetric, formScore: 'Move into frame' };
    }

    // Precondition (orientation) check
    if (det.precondition) {
      const pre = det.precondition(landmarks);
      if (!pre.ok) {
        return { phase: legacyPhase(phase), repCount, currentAngle: currentMetric, formScore: pre.reason ?? 'Adjust position' };
      }
    }

    currentMetric = det.getPrimaryMetric(landmarks);
    const rawPhase = det.getPhase(landmarks);

    // Track extremes for form scoring
    if (rawPhase === 'contracted') {
      lastContractedExtreme = Math.min(lastContractedExtreme, currentMetric);
    } else if (rawPhase === 'extended') {
      lastExtendedExtreme = Math.max(lastExtendedExtreme, currentMetric);
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
        const prev = phase;
        phase = rawPhase;
        // Count rep based on configured trigger transition
        const counted =
          (det.countOn === 'contract->extend' && prev === 'contracted' && phase === 'extended') ||
          (det.countOn === 'extend->contract' && prev === 'extended' && phase === 'contracted');
        if (counted) {
          repCount++;
          // Reset extremes after counting
          lastContractedExtreme = det.idealExtended;
          lastExtendedExtreme = det.idealContracted;
        }
      }
    }

    // Form scoring based on range of motion vs. ideal
    if (phase === 'unknown') {
      formScore = 'Get ready...';
    } else {
      const idealRange = Math.abs(det.idealExtended - det.idealContracted);
      const actualRange = Math.abs(lastExtendedExtreme - lastContractedExtreme);
      const ratio = idealRange > 0 ? actualRange / idealRange : 0;
      if (ratio > 0.85) formScore = 'Excellent';
      else if (ratio > 0.7) formScore = 'Great';
      else if (ratio > 0.5) formScore = 'Good';
      else formScore = 'Go deeper';
    }

    return { phase: legacyPhase(phase), repCount, currentAngle: currentMetric, formScore };
  }

  function reset() {
    phase = 'unknown';
    repCount = 0;
    pendingPhase = 'unknown';
    pendingFrames = 0;
    lastContractedExtreme = det.idealExtended;
    lastExtendedExtreme = det.idealContracted;
  }

  return { update, reset, getLabel: () => det.label };
}
