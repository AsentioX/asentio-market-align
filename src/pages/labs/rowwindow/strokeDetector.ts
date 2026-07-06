// Backwards-compatible shim for the modular stroke detector.
//
// The real pipeline now lives under ./stroke/. This file preserves the old
// exports (`createStrokeDetectorState`, `processStrokeSample`, `DEFAULT_TUNINGS`,
// `StrokeDetectorTunings`) so existing callers (useRowSensors, the offline
// test script) keep working without changes.

import {
  createDetector,
  processSample,
  ROWING_PROFILE,
  type StrokeDetector,
  type DetectorResult,
  type StrokeSample as StrokeSampleModern,
} from './stroke';

export type StrokeSample = StrokeSampleModern;

export interface StrokeDetectorTunings {
  // Legacy alpha-based tuning surface kept for the offline test suite.
  // The new pipeline is time-constant driven; these values are accepted but
  // ignored — pass a custom `ActivityProfile` via `createDetector` instead for
  // fine-grained control.
  gravityAlpha?: number;
  varianceAlpha?: number;
  signalAlpha?: number;
  baselineAlpha?: number;
  rmsAlpha?: number;
  thresholdMul?: number;
  thresholdFloor?: number;
  rearmAbs?: number;
  minIntervalMs?: number;
  maxIntervalMs?: number;
  windowSize?: number;
  warmupSamples?: number;
}

export const DEFAULT_TUNINGS: StrokeDetectorTunings = {
  minIntervalMs: ROWING_PROFILE.minIntervalMs,
  maxIntervalMs: ROWING_PROFILE.maxIntervalMs,
  windowSize: ROWING_PROFILE.windowSize,
  warmupSamples: ROWING_PROFILE.warmupSamples,
};

export interface StrokeDetectorState {
  detector: StrokeDetector;
  latest: DetectorResult | null;
}

export interface StrokeDetectorResult {
  spm: number | null;
  peak: boolean;
  threshold: number;
  dynamic: number;
  confidence: number;
}

export function createStrokeDetectorState(): StrokeDetectorState {
  return { detector: createDetector(ROWING_PROFILE), latest: null };
}

export function processStrokeSample(
  state: StrokeDetectorState,
  sample: StrokeSample,
  _tunings: StrokeDetectorTunings = DEFAULT_TUNINGS,
): StrokeDetectorResult {
  const res = processSample(state.detector, sample);
  state.latest = res;
  return {
    spm: res.spm,
    peak: res.peak,
    threshold: res.debug.posThreshold,
    dynamic: res.debug.bandpass - res.debug.baseline,
    confidence: res.confidence,
  };
}

export function getLatestDebugFrame(state: StrokeDetectorState) {
  return state.latest?.debug ?? null;
}
