// Synthetic stroke-rate accuracy test for strokeDetector.
//
// Generates accelerometer magnitude time-series for a given true cadence,
// optionally with: gravity DC offset, white noise, recovery harmonic
// (smaller secondary bump per cycle), and a startup ramp.
//
// Runs the detector and reports how close its SPM estimate gets to ground
// truth across a range of cadences and noise levels.

import {
  createStrokeDetectorState,
  processStrokeSample,
  DEFAULT_TUNINGS,
  type StrokeDetectorTunings,
} from '../src/pages/labs/rowwindow/strokeDetector';

interface SimOptions {
  trueSpm: number;
  durationSec: number;
  sampleHz: number;
  /** Peak amplitude of the stroke oscillation (m/s²). */
  amplitude: number;
  /** Std-dev of white noise (m/s²). */
  noiseStd: number;
  /** Amplitude of secondary harmonic (recovery bump) as fraction of main. */
  harmonicFrac: number;
  /** DC offset, simulating phone orientation under gravity. */
  gravity: number;
  /** Cadence drift per minute (spm). */
  spmDriftPerMin: number;
  seed: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  // Box-Muller
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function simulate(opts: SimOptions, tunings: StrokeDetectorTunings = DEFAULT_TUNINGS) {
  const { trueSpm, durationSec, sampleHz, amplitude, noiseStd, harmonicFrac, gravity, spmDriftPerMin, seed } = opts;
  const dt = 1000 / sampleHz;
  const nSamples = Math.floor(durationSec * sampleHz);
  const rand = mulberry32(seed);
  const state = createStrokeDetectorState();

  let phase = 0;
  const spmReadings: { t: number; spm: number; truth: number }[] = [];
  let peakCount = 0;

  for (let i = 0; i < nSamples; i++) {
    const t = i * dt;
    const currentSpm = trueSpm + (spmDriftPerMin * (t / 60000));
    const freqHz = currentSpm / 60;
    phase += 2 * Math.PI * freqHz * (dt / 1000);

    // Main stroke + smaller recovery harmonic at 2x
    const stroke = amplitude * Math.sin(phase);
    const harmonic = amplitude * harmonicFrac * Math.sin(2 * phase + 0.6);
    const noise = noiseStd * gauss(rand);
    // Build a 3-axis acceleration vector with gravity on one axis, stroke on another.
    // Magnitude = sqrt((g)^2 + (stroke + harm + noise)^2)
    const dyn = stroke + harmonic + noise;
    const mag = Math.sqrt(gravity * gravity + dyn * dyn);

    const res = processStrokeSample(state, { mag, t }, tunings);
    if (res.peak) peakCount++;
    if (res.spm !== null && i % sampleHz === 0) {
      spmReadings.push({ t, spm: res.spm, truth: currentSpm });
    }
  }

  // Use only the second half of readings to skip warm-up.
  const stable = spmReadings.filter((r) => r.t > durationSec * 1000 * 0.4);
  const meanErr =
    stable.length === 0
      ? null
      : stable.reduce((acc, r) => acc + Math.abs(r.spm - r.truth), 0) / stable.length;
  const lastSpm = spmReadings.length ? spmReadings[spmReadings.length - 1].spm : null;
  const expectedPeaks = (trueSpm + 0.5 * spmDriftPerMin * (durationSec / 60)) * (durationSec / 60);

  return { peakCount, expectedPeaks, lastSpm, meanErr, samples: spmReadings.length };
}

function pad(s: string | number, n: number) {
  const str = String(s);
  return str + ' '.repeat(Math.max(0, n - str.length));
}

function runSuite(label: string, tunings: StrokeDetectorTunings) {
  console.log(`\n=== ${label} ===`);
  console.log(
    pad('case', 28), pad('truth', 8), pad('lastSpm', 10), pad('|err|', 8),
    pad('peaks', 10), pad('expected', 10),
  );

  const cases: { name: string; opts: Partial<SimOptions> & { trueSpm: number } }[] = [
    { name: 'idle 20 spm', opts: { trueSpm: 20, noiseStd: 0.15 } },
    { name: 'paddle 24 spm', opts: { trueSpm: 24, noiseStd: 0.2 } },
    { name: 'steady 28 spm', opts: { trueSpm: 28, noiseStd: 0.3 } },
    { name: 'race 32 spm', opts: { trueSpm: 32, noiseStd: 0.4 } },
    { name: 'sprint 38 spm', opts: { trueSpm: 38, noiseStd: 0.5 } },
    { name: 'sprint 44 spm', opts: { trueSpm: 44, noiseStd: 0.5 } },
    { name: 'noisy 30 spm', opts: { trueSpm: 30, noiseStd: 1.2 } },
    { name: 'small amp 26 spm', opts: { trueSpm: 26, amplitude: 0.8, noiseStd: 0.25 } },
    { name: 'strong harm 30', opts: { trueSpm: 30, harmonicFrac: 0.6, noiseStd: 0.3 } },
    { name: 'drift 24→32 spm', opts: { trueSpm: 24, spmDriftPerMin: 8, noiseStd: 0.3, durationSec: 60 } },
  ];

  const defaults: SimOptions = {
    trueSpm: 28,
    durationSec: 30,
    sampleHz: 60,
    amplitude: 2.5,
    noiseStd: 0.3,
    harmonicFrac: 0.3,
    gravity: 9.8,
    spmDriftPerMin: 0,
    seed: 42,
  };

  let totalErr = 0, count = 0;
  for (const c of cases) {
    const opts: SimOptions = { ...defaults, ...c.opts };
    const r = simulate(opts, tunings);
    if (r.meanErr !== null) { totalErr += r.meanErr; count++; }
    console.log(
      pad(c.name, 28),
      pad(opts.trueSpm.toFixed(1), 8),
      pad(r.lastSpm ?? '-', 10),
      pad(r.meanErr?.toFixed(2) ?? '-', 8),
      pad(r.peakCount, 10),
      pad(r.expectedPeaks.toFixed(1), 10),
    );
  }
  const avg = count ? (totalErr / count).toFixed(2) : '-';
  console.log(`  → mean |err| across cases: ${avg} spm`);
}

runSuite('DEFAULT_TUNINGS', DEFAULT_TUNINGS);
