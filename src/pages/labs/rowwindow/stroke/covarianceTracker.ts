// Running 3x3 covariance of the linear-acceleration vector.
//
// Only the 6 unique upper-triangle entries are stored. Exponential weighting
// with a real time constant lets it track a slowly drifting principal axis
// (e.g. a phone slipping in the mount) without ignoring history.

export interface CovarianceTracker {
  xx: number; yy: number; zz: number;
  xy: number; xz: number; yz: number;
  initialized: boolean;
  tau: number;
}

export function createCovarianceTracker(tau = 2): CovarianceTracker {
  return { xx: 0, yy: 0, zz: 0, xy: 0, xz: 0, yz: 0, initialized: false, tau };
}

export function updateCovariance(
  c: CovarianceTracker,
  lx: number, ly: number, lz: number,
  dtSec: number,
): void {
  if (!c.initialized) {
    c.xx = lx * lx; c.yy = ly * ly; c.zz = lz * lz;
    c.xy = lx * ly; c.xz = lx * lz; c.yz = ly * lz;
    c.initialized = true;
    return;
  }
  const a = dtSec > 0 ? dtSec / (c.tau + dtSec) : 0;
  c.xx += a * (lx * lx - c.xx);
  c.yy += a * (ly * ly - c.yy);
  c.zz += a * (lz * lz - c.zz);
  c.xy += a * (lx * ly - c.xy);
  c.xz += a * (lx * lz - c.xz);
  c.yz += a * (ly * lz - c.yz);
}
