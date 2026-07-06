// Dominant-eigenvector tracker via power iteration on the covariance matrix.
//
// The dominant eigenvector of the 3x3 covariance is the direction of maximum
// motion variance — for a paddled boat this is the stroke axis. We update the
// estimate every N samples with a few power-iteration steps and lock the sign
// against the previous axis so the signed projection is stable across updates.

import type { CovarianceTracker } from './covarianceTracker';
import type { Vec3 } from './types';

export interface PCAAxis {
  axis: Vec3;
  sampleSinceUpdate: number;
  updateEvery: number;
  iterations: number;
}

export function createPCAAxis(updateEvery = 10, iterations = 5): PCAAxis {
  return {
    axis: { x: 0, y: 0, z: 1 },
    sampleSinceUpdate: updateEvery,   // force an update on the first call
    updateEvery,
    iterations,
  };
}

function matMulVec(c: CovarianceTracker, v: Vec3): Vec3 {
  return {
    x: c.xx * v.x + c.xy * v.y + c.xz * v.z,
    y: c.xy * v.x + c.yy * v.y + c.yz * v.z,
    z: c.xz * v.x + c.yz * v.y + c.zz * v.z,
  };
}

export function maybeUpdateAxis(state: PCAAxis, cov: CovarianceTracker): Vec3 {
  state.sampleSinceUpdate++;
  if (state.sampleSinceUpdate < state.updateEvery || !cov.initialized) return state.axis;
  state.sampleSinceUpdate = 0;

  // Seed vector: last axis, biased toward diagonal so the very first iteration
  // has a signal even when the previous axis was orthogonal to the true one.
  let v: Vec3 = { x: state.axis.x + 1e-3, y: state.axis.y + 1e-3, z: state.axis.z + 1e-3 };

  for (let i = 0; i < state.iterations; i++) {
    v = matMulVec(cov, v);
    const n = Math.hypot(v.x, v.y, v.z) || 1;
    v = { x: v.x / n, y: v.y / n, z: v.z / n };
  }

  // Sign-lock against the previous axis so the projected signal doesn't flip
  // polarity every update (which would double-count strokes downstream).
  const dot = v.x * state.axis.x + v.y * state.axis.y + v.z * state.axis.z;
  if (dot < 0) v = { x: -v.x, y: -v.y, z: -v.z };

  state.axis = v;
  return state.axis;
}

export function projectOnAxis(axis: Vec3, lx: number, ly: number, lz: number): number {
  return lx * axis.x + ly * axis.y + lz * axis.z;
}
