// Shared types for the modular stroke detection pipeline.
//
// The detector consumes 3-axis accelerometer samples with real timestamps and
// emits a signed SPM estimate together with a confidence score and an
// optional per-sample debug frame that the dev overlay can graph.

export interface StrokeSample {
  ax: number;
  ay: number;
  az: number;
  /** Sample timestamp in milliseconds (monotonically increasing). */
  t: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Compact per-sample debug data (kept small enough for 60 Hz ring buffers). */
export interface DebugFrame {
  t: number;
  raw: Vec3;
  gravity: Vec3;
  linear: Vec3;
  axis: Vec3;
  projection: number;
  bandpass: number;
  baseline: number;
  rms: number;
  posThreshold: number;
  negThreshold: number;
  spm: number | null;
  confidence: number;
  /** True on the exact sample the detector recognized a valid peak. */
  peak: boolean;
  /** True when a candidate peak was rejected by the interval validator. */
  rejected: boolean;
}

export interface DetectorResult {
  spm: number | null;
  confidence: number;
  peak: boolean;
  rejected: boolean;
  debug: DebugFrame;
}

export interface ActivityProfile {
  id: 'rowing' | 'kayak' | 'canoe' | 'dragonBoat';
  label: string;
  /** Expected cadence range in strokes per minute (informational + gating). */
  spmRange: [number, number];
  /** Band-pass passband in Hz (roughly 0.9 × minSpm/60 → 1.4 × maxSpm/60). */
  bandpassHz: [number, number];
  /** Fastest allowed cadence expressed as inter-peak interval (ms). */
  minIntervalMs: number;
  /** Slowest allowed cadence — beyond this the SPM buffer resets. */
  maxIntervalMs: number;
  /** Positive peak threshold gain applied on top of running RMS. */
  posGain: number;
  /** Negative re-arm threshold gain (must dip below -max(negFloor, rms*negGain)). */
  negGain: number;
  /** Absolute floors so cold-start noise doesn't fire spurious peaks. */
  posFloor: number;
  negFloor: number;
  /** Minimum peak prominence expressed as multiple of RMS. */
  minProminence: number;
  /** Interval-validator gate width in MAD units around the rolling median. */
  madWidth: number;
  /** Rolling window size for the SPM median (accepted intervals). */
  windowSize: number;
  /** Discard the first N samples so filters can settle. */
  warmupSamples: number;
}
