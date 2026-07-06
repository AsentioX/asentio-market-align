// Synthetic 3-axis stroke-rate accuracy test for strokeDetector.

import {
  createStrokeDetectorState,
  processStrokeSample,
  DEFAULT_TUNINGS,
  type StrokeDetectorTunings,
} from '../src/pages/labs/rowwindow/strokeDetector';
import { createDetector, processSample } from '../src/pages/labs/rowwindow/stroke';
import { PROFILES } from '../src/pages/labs/rowwindow/stroke/profiles';

interface SimOptions {
  trueSpm: number;
  durationSec: number;
  sampleHz: number;
  amplitude: number;       // m/s² peak on the stroke axis
  noiseStd: number;        // m/s² per-axis white noise
  harmonicFrac: number;    // secondary harmonic amplitude as fraction of main
  /** Gravity vector — phone tilt. */
  gx: number; gy: number; gz: number;
  /** Stroke axis (will be normalized). */
  sx: number; sy: number; sz: number;
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
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function simulate(opts: SimOptions, tunings: StrokeDetectorTunings = DEFAULT_TUNINGS) {
  const dt = 1000 / opts.sampleHz;
  const nSamples = Math.floor(opts.durationSec * opts.sampleHz);
  const rand = mulberry32(opts.seed);
  const state = createStrokeDetectorState();
  // Normalize stroke axis
  const sn = Math.sqrt(opts.sx ** 2 + opts.sy ** 2 + opts.sz ** 2);
  const sx = opts.sx / sn, sy = opts.sy / sn, sz = opts.sz / sn;

  let phase = 0;
  const spmReadings: { t: number; spm: number; truth: number }[] = [];
  let peakCount = 0;

  for (let i = 0; i < nSamples; i++) {
    const t = i * dt;
    const currentSpm = opts.trueSpm + (opts.spmDriftPerMin * (t / 60000));
    const freqHz = currentSpm / 60;
    phase += 2 * Math.PI * freqHz * (dt / 1000);

    const stroke = opts.amplitude * Math.sin(phase);
    const harmonic = opts.amplitude * opts.harmonicFrac * Math.sin(2 * phase + 0.6);
    const dyn = stroke + harmonic;

    const ax = opts.gx + dyn * sx + opts.noiseStd * gauss(rand);
    const ay = opts.gy + dyn * sy + opts.noiseStd * gauss(rand);
    const az = opts.gz + dyn * sz + opts.noiseStd * gauss(rand);

    const res = processStrokeSample(state, { ax, ay, az, t }, tunings);
    if (res.peak) peakCount++;
    if (res.spm !== null && i % opts.sampleHz === 0) {
      spmReadings.push({ t, spm: res.spm, truth: currentSpm });
    }
  }

  // Use the second half of readings to skip warm-up convergence.
  const stable = spmReadings.filter((r) => r.t > opts.durationSec * 1000 * 0.5);
  const meanErr =
    stable.length === 0
      ? null
      : stable.reduce((acc, r) => acc + Math.abs(r.spm - r.truth), 0) / stable.length;
  const lastSpm = spmReadings.length ? spmReadings[spmReadings.length - 1].spm : null;
  const expectedPeaks = opts.trueSpm * (opts.durationSec / 60) +
    0.5 * opts.spmDriftPerMin * (opts.durationSec / 60) * (opts.durationSec / 60);

  return { peakCount, expectedPeaks, lastSpm, meanErr, samples: spmReadings.length };
}

function pad(s: string | number, n: number) {
  const str = String(s);
  return str + ' '.repeat(Math.max(0, n - str.length));
}

function runSuite(label: string, tunings: StrokeDetectorTunings) {
  console.log(`\n=== ${label} ===`);
  console.log(
    pad('case', 32), pad('truth', 8), pad('lastSpm', 10), pad('|err|', 8),
    pad('peaks', 8), pad('expected', 10),
  );

  const defaults: SimOptions = {
    trueSpm: 28,
    durationSec: 45,
    sampleHz: 60,
    amplitude: 2.5,
    noiseStd: 0.3,
    harmonicFrac: 0.3,
    gx: 0, gy: 9.8, gz: 0,      // phone upright, screen forward
    sx: 1, sy: 0, sz: 0.3,      // stroke axis: fore-aft + slight vertical
    spmDriftPerMin: 0,
    seed: 42,
  };

  const cases: { name: string; opts: Partial<SimOptions> }[] = [
    { name: 'idle 18 spm', opts: { trueSpm: 18, noiseStd: 0.15 } },
    { name: 'paddle 24 spm', opts: { trueSpm: 24, noiseStd: 0.2 } },
    { name: 'steady 28 spm', opts: { trueSpm: 28, noiseStd: 0.3 } },
    { name: 'race 32 spm', opts: { trueSpm: 32, noiseStd: 0.4 } },
    { name: 'race 36 spm', opts: { trueSpm: 36, noiseStd: 0.4 } },
    { name: 'sprint 40 spm', opts: { trueSpm: 40, noiseStd: 0.5 } },
    { name: 'sprint 46 spm', opts: { trueSpm: 46, noiseStd: 0.5 } },
    { name: 'noisy 30 spm', opts: { trueSpm: 30, noiseStd: 1.2 } },
    { name: 'small amp 26 spm', opts: { trueSpm: 26, amplitude: 0.8, noiseStd: 0.2 } },
    { name: 'strong harm 30', opts: { trueSpm: 30, harmonicFrac: 0.6, noiseStd: 0.3 } },
    { name: 'drift 24→32 spm', opts: { trueSpm: 24, spmDriftPerMin: 8, noiseStd: 0.3, durationSec: 60 } },
    { name: 'phone flat 28', opts: { trueSpm: 28, gx: 0, gy: 0, gz: 9.8, sx: 1, sy: 0.3, sz: 0 } },
    { name: 'phone tilted 28', opts: { trueSpm: 28, gx: 3, gy: 8, gz: 4, sx: 0.7, sy: 0.2, sz: 0.7 } },
  ];

  let totalErr = 0, count = 0, missed = 0;
  for (const c of cases) {
    const opts: SimOptions = { ...defaults, ...c.opts };
    const r = simulate(opts, tunings);
    if (r.meanErr !== null) { totalErr += r.meanErr; count++; } else { missed++; }
    console.log(
      pad(c.name, 32),
      pad(opts.trueSpm.toFixed(1), 8),
      pad(r.lastSpm ?? '-', 10),
      pad(r.meanErr?.toFixed(2) ?? '-', 8),
      pad(r.peakCount, 8),
      pad(r.expectedPeaks.toFixed(1), 10),
    );
  }
  const avg = count ? (totalErr / count).toFixed(2) : '-';
  console.log(`  → mean |err|: ${avg} spm   missed: ${missed}/${cases.length}`);
}

runSuite('DEFAULT_TUNINGS', DEFAULT_TUNINGS);

// -----------------------------------------------------------------------------
// Modern pipeline: run cadence sweeps against each activity profile so tuning
// regressions surface immediately.
// -----------------------------------------------------------------------------

interface ModernSim extends SimOptions {
  vibHz?: number;
  vibAmp?: number;
}

function simulateModern(opts: ModernSim, profileId: keyof typeof PROFILES) {
  const dt = 1000 / opts.sampleHz;
  const nSamples = Math.floor(opts.durationSec * opts.sampleHz);
  const rand = mulberry32(opts.seed);
  const detector = createDetector(PROFILES[profileId]);
  const sn = Math.sqrt(opts.sx ** 2 + opts.sy ** 2 + opts.sz ** 2);
  const sx = opts.sx / sn, sy = opts.sy / sn, sz = opts.sz / sn;
  let phase = 0;
  const readings: { t: number; spm: number; truth: number; conf: number }[] = [];

  for (let i = 0; i < nSamples; i++) {
    const t = i * dt;
    const currentSpm = opts.trueSpm + (opts.spmDriftPerMin * (t / 60000));
    const freqHz = currentSpm / 60;
    phase += 2 * Math.PI * freqHz * (dt / 1000);

    const stroke = opts.amplitude * Math.sin(phase);
    const harmonic = opts.amplitude * opts.harmonicFrac * Math.sin(2 * phase + 0.6);
    const vib = opts.vibHz && opts.vibAmp
      ? opts.vibAmp * Math.sin(2 * Math.PI * opts.vibHz * (t / 1000))
      : 0;
    const dyn = stroke + harmonic;

    const ax = opts.gx + dyn * sx + vib + opts.noiseStd * gauss(rand);
    const ay = opts.gy + dyn * sy + vib + opts.noiseStd * gauss(rand);
    const az = opts.gz + dyn * sz + vib + opts.noiseStd * gauss(rand);

    const res = processSample(detector, { ax, ay, az, t });
    if (res.spm !== null && i % opts.sampleHz === 0) {
      readings.push({ t, spm: res.spm, truth: currentSpm, conf: res.confidence });
    }
  }

  const stable = readings.filter((r) => r.t > opts.durationSec * 1000 * 0.5);
  const meanErr = stable.length
    ? stable.reduce((acc, r) => acc + Math.abs(r.spm - r.truth), 0) / stable.length
    : null;
  const meanConf = stable.length
    ? stable.reduce((acc, r) => acc + r.conf, 0) / stable.length
    : 0;
  return { meanErr, meanConf, lastSpm: readings.at(-1)?.spm ?? null };
}

function runModernSuite(label: string, profileId: keyof typeof PROFILES, cases: { name: string; opts: Partial<ModernSim> }[]) {
  console.log(`\n=== ${label} (${PROFILES[profileId].label}) ===`);
  console.log(pad('case', 28), pad('truth', 8), pad('spm', 8), pad('|err|', 8), pad('conf', 8));
  const defaults: ModernSim = {
    trueSpm: 28, durationSec: 45, sampleHz: 60,
    amplitude: 2.5, noiseStd: 0.3, harmonicFrac: 0.3,
    gx: 0, gy: 9.8, gz: 0, sx: 1, sy: 0, sz: 0.3,
    spmDriftPerMin: 0, seed: 42,
  };
  let totalErr = 0, totalConf = 0, count = 0;
  for (const c of cases) {
    const opts: ModernSim = { ...defaults, ...c.opts };
    const r = simulateModern(opts, profileId);
    if (r.meanErr !== null) { totalErr += r.meanErr; totalConf += r.meanConf; count++; }
    console.log(
      pad(c.name, 28),
      pad(opts.trueSpm.toFixed(1), 8),
      pad(r.lastSpm ?? '-', 8),
      pad(r.meanErr?.toFixed(2) ?? '-', 8),
      pad(r.meanConf.toFixed(2), 8),
    );
  }
  const avgErr = count ? (totalErr / count).toFixed(2) : '-';
  const avgConf = count ? (totalConf / count).toFixed(2) : '-';
  console.log(`  → mean |err|: ${avgErr} spm   mean conf: ${avgConf}`);
}

runModernSuite('MODERN rowing sweep', 'rowing', [
  { name: 'clean 18',    opts: { trueSpm: 18, noiseStd: 0.15 } },
  { name: 'clean 24',    opts: { trueSpm: 24, noiseStd: 0.2 } },
  { name: 'clean 30',    opts: { trueSpm: 30, noiseStd: 0.3 } },
  { name: 'clean 36',    opts: { trueSpm: 36, noiseStd: 0.4 } },
  { name: 'noisy 28',    opts: { trueSpm: 28, noiseStd: 1.2 } },
  { name: 'small amp 26',opts: { trueSpm: 26, amplitude: 0.8, noiseStd: 0.2 } },
  { name: 'tilted 30',   opts: { trueSpm: 30, gx: 3, gy: 8, gz: 4, sx: 0.7, sy: 0.2, sz: 0.7 } },
  { name: 'vibration 30',opts: { trueSpm: 30, vibHz: 8, vibAmp: 0.6 } },
  { name: 'drift 24→32', opts: { trueSpm: 24, spmDriftPerMin: 8, durationSec: 60 } },
]);

runModernSuite('MODERN kayak sweep', 'kayak', [
  { name: 'kayak 45',  opts: { trueSpm: 45, noiseStd: 0.25 } },
  { name: 'kayak 55',  opts: { trueSpm: 55, noiseStd: 0.3 } },
  { name: 'kayak 65',  opts: { trueSpm: 65, noiseStd: 0.35 } },
  { name: 'kayak 75',  opts: { trueSpm: 75, noiseStd: 0.4 } },
]);

