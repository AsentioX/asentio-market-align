// Optional ring-buffer recorder for offline algorithm tuning.
//
// Turned on/off by the debug panel; when active it captures every DebugFrame
// so the developer can download a JSON of an actual on-water session and
// replay it against tweaked detector parameters.

import type { DebugFrame } from './types';

export interface Recorder {
  active: boolean;
  frames: DebugFrame[];
  cap: number;
  startedAt: number | null;
}

export function createRecorder(cap = 60 * 60 * 30): Recorder {
  // Default cap: 30 minutes at ~60 Hz. Adjust upward for longer sessions.
  return { active: false, frames: [], cap, startedAt: null };
}

export function startRecording(r: Recorder): void {
  r.active = true;
  r.frames = [];
  r.startedAt = Date.now();
}

export function stopRecording(r: Recorder): void {
  r.active = false;
}

export function pushFrame(r: Recorder, frame: DebugFrame): void {
  if (!r.active) return;
  r.frames.push(frame);
  if (r.frames.length > r.cap) r.frames.shift();
}

export function exportJson(r: Recorder, meta: Record<string, unknown> = {}): string {
  return JSON.stringify(
    {
      version: 1,
      startedAt: r.startedAt,
      endedAt: Date.now(),
      frameCount: r.frames.length,
      meta,
      frames: r.frames,
    },
    null,
    0,
  );
}
