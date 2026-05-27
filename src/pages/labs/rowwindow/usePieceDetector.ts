import { useEffect, useRef, useState } from 'react';

// =============================================================================
// usePieceDetector — auto-detects rowing "pieces" (work intervals) from live
// boat data.
//
// Heuristic:
//   1. Watch the heading history. A "turnaround" is registered when the boat's
//      current heading differs from its heading ~15–30 s ago by more than
//      ~120°. This catches the moment the rower spins the boat around to
//      start another length.
//   2. After a turnaround, watch the GPS speed. When ground speed climbs
//      above PIECE_SPEED_START m/s and stays there for SPEED_SUSTAIN_MS,
//      we open a new piece and start accumulating distance / stroke rate /
//      pace samples.
//   3. The piece closes when speed drops below PIECE_SPEED_END m/s for
//      END_SUSTAIN_MS, or when the user stops the session.
//
// All thresholds are conservative enough that paddling, drifting, and
// turning don't trigger a false piece, but a genuine pickup ("3, 2, 1, send")
// is reliably captured.
// =============================================================================

export interface Piece {
  id: string;
  startedAt: number;
  endedAt: number | null;
  /** GPS distance (m) accumulated within this piece. */
  distanceMeters: number;
  /** Time-weighted mean stroke rate (spm), null if no spm data. */
  avgSpm: number | null;
  /** Time-weighted mean pace, seconds per 500 m. */
  avgPaceSecPer500: number | null;
  /** Peak instantaneous speed during the piece (m/s). */
  maxSpeedMs: number;
}

interface InternalAccum {
  spmSum: number;
  spmCount: number;
  speedSum: number;
  speedCount: number;
  startDistance: number;
  maxSpeed: number;
}

interface Options {
  /** Sensors are streaming and the session is "active" (not paused). */
  active: boolean;
  headingDeg: number | null;
  speedMs: number | null;
  spm: number | null;
  /** Cumulative GPS distance from useRowSensors (meters). */
  distanceMeters: number;
}

const TURN_LOOKBACK_MIN_MS = 15_000;
const TURN_LOOKBACK_MAX_MS = 45_000;
const TURN_ANGLE_DEG = 120;
const TURN_GRACE_MS = 25_000;       // turnaround flag valid this long
const PIECE_SPEED_START = 2.0;      // ~4 min/500m pace — clearly rowing
const PIECE_SPEED_END = 1.0;        // dropped to recovery / paddling
const SPEED_SUSTAIN_MS = 3_000;
const END_SUSTAIN_MS = 6_000;
const MIN_PIECE_DURATION_MS = 15_000;

function angleDelta(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

export function usePieceDetector({ active, headingDeg, speedMs, spm, distanceMeters }: Options) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);

  // Rolling heading history for turn detection.
  const headingHistRef = useRef<{ t: number; deg: number }[]>([]);
  const turnFlagUntilRef = useRef(0);
  const speedAboveSinceRef = useRef<number | null>(null);
  const speedBelowSinceRef = useRef<number | null>(null);
  const accumRef = useRef<InternalAccum | null>(null);
  const lastTickRef = useRef<number>(0);

  // Reset everything when the session goes idle.
  useEffect(() => {
    if (!active) {
      // If a piece is open when paused/ended, close it.
      setCurrentPiece((p) => {
        if (!p || !accumRef.current) return null;
        const closed = finalizePiece(p, accumRef.current, distanceMeters);
        if (closed.endedAt! - closed.startedAt >= MIN_PIECE_DURATION_MS) {
          setPieces((prev) => [...prev, closed]);
        }
        accumRef.current = null;
        return null;
      });
      headingHistRef.current = [];
      turnFlagUntilRef.current = 0;
      speedAboveSinceRef.current = null;
      speedBelowSinceRef.current = null;
    }
  }, [active, distanceMeters]);

  useEffect(() => {
    if (!active) return;
    const now = Date.now();

    // Maintain heading history.
    if (headingDeg !== null) {
      headingHistRef.current.push({ t: now, deg: headingDeg });
      const cutoff = now - 60_000;
      headingHistRef.current = headingHistRef.current.filter((p) => p.t >= cutoff);

      const past = headingHistRef.current.find(
        (p) => now - p.t >= TURN_LOOKBACK_MIN_MS && now - p.t <= TURN_LOOKBACK_MAX_MS,
      );
      if (past && angleDelta(headingDeg, past.deg) >= TURN_ANGLE_DEG) {
        turnFlagUntilRef.current = now + TURN_GRACE_MS;
      }
    }

    // Speed pickup tracking.
    if (speedMs !== null && speedMs >= PIECE_SPEED_START) {
      if (speedAboveSinceRef.current === null) speedAboveSinceRef.current = now;
    } else {
      speedAboveSinceRef.current = null;
    }
    if (speedMs !== null && speedMs <= PIECE_SPEED_END) {
      if (speedBelowSinceRef.current === null) speedBelowSinceRef.current = now;
    } else {
      speedBelowSinceRef.current = null;
    }

    // Open a piece: turnaround flag is fresh AND speed has been up for a while.
    if (
      !currentPiece &&
      turnFlagUntilRef.current > now &&
      speedAboveSinceRef.current !== null &&
      now - speedAboveSinceRef.current >= SPEED_SUSTAIN_MS
    ) {
      accumRef.current = {
        spmSum: 0, spmCount: 0,
        speedSum: 0, speedCount: 0,
        startDistance: distanceMeters,
        maxSpeed: speedMs ?? 0,
      };
      const piece: Piece = {
        id: `piece-${now}`,
        startedAt: now - SPEED_SUSTAIN_MS, // back-date to the pickup moment
        endedAt: null,
        distanceMeters: 0,
        avgSpm: null,
        avgPaceSecPer500: null,
        maxSpeedMs: speedMs ?? 0,
      };
      setCurrentPiece(piece);
      // consume the turnaround flag so we don't immediately re-arm
      turnFlagUntilRef.current = 0;
      lastTickRef.current = now;
      return;
    }

    // Accumulate while a piece is open.
    if (currentPiece && accumRef.current) {
      if (spm !== null && spm > 0) {
        accumRef.current.spmSum += spm;
        accumRef.current.spmCount += 1;
      }
      if (speedMs !== null && speedMs > 0.2) {
        accumRef.current.speedSum += speedMs;
        accumRef.current.speedCount += 1;
        if (speedMs > accumRef.current.maxSpeed) accumRef.current.maxSpeed = speedMs;
      }

      // Live update of the displayed piece (~1 Hz).
      if (now - lastTickRef.current > 800) {
        lastTickRef.current = now;
        setCurrentPiece((p) => p ? finalizePiece(p, accumRef.current!, distanceMeters, /*open*/ true) : p);
      }

      // Close the piece if speed has been low for END_SUSTAIN_MS.
      if (
        speedBelowSinceRef.current !== null &&
        now - speedBelowSinceRef.current >= END_SUSTAIN_MS
      ) {
        const closed = finalizePiece(currentPiece, accumRef.current, distanceMeters);
        accumRef.current = null;
        setCurrentPiece(null);
        if (closed.endedAt! - closed.startedAt >= MIN_PIECE_DURATION_MS) {
          setPieces((prev) => [...prev, closed]);
        }
        speedBelowSinceRef.current = null;
      }
    }
  }, [active, headingDeg, speedMs, spm, distanceMeters, currentPiece]);

  const clearPieces = () => {
    setPieces([]);
    setCurrentPiece(null);
    accumRef.current = null;
  };

  return { pieces, currentPiece, clearPieces };
}

function finalizePiece(
  p: Piece,
  acc: InternalAccum,
  currentDistance: number,
  open = false,
): Piece {
  const dist = Math.max(0, currentDistance - acc.startDistance);
  const avgSpm = acc.spmCount > 0 ? acc.spmSum / acc.spmCount : null;
  const avgSpeed = acc.speedCount > 0 ? acc.speedSum / acc.speedCount : null;
  const pace = avgSpeed && avgSpeed > 0.2 ? 500 / avgSpeed : null;
  return {
    ...p,
    endedAt: open ? null : Date.now(),
    distanceMeters: dist,
    avgSpm: avgSpm !== null ? Math.round(avgSpm) : null,
    avgPaceSecPer500: pace !== null ? Math.round(pace) : null,
    maxSpeedMs: acc.maxSpeed,
  };
}
