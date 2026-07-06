// Developer-only overlay for the modular stroke detector.
//
// Mounted from RowWindowLayout when the URL contains `?debug=stroke`. Shows
// live sparklines for every internal signal and lets the developer record a
// session for offline algorithm tuning.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Circle, Square } from 'lucide-react';
import type { DebugFrame } from './stroke/types';
import type { ActivityId } from './stroke/profiles';
import { PROFILES } from './stroke/profiles';

const RING = 512;

interface StrokeDebugPanelProps {
  subscribe: (cb: (frame: DebugFrame) => void) => () => void;
  activity: ActivityId;
  onActivityChange: (a: ActivityId) => void;
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: () => boolean;
  exportRecording: (meta?: Record<string, unknown>) => string;
}

interface RingBuffer {
  frames: DebugFrame[];
  index: number;
}

export const StrokeDebugPanel = ({
  subscribe, activity, onActivityChange,
  startRecording, stopRecording, isRecording, exportRecording,
}: StrokeDebugPanelProps) => {
  const ringRef = useRef<RingBuffer>({ frames: [], index: 0 });
  const [, force] = useState(0);
  const [recording, setRecording] = useState(false);
  const [latest, setLatest] = useState<DebugFrame | null>(null);

  // Subscribe to detector debug frames. rAF-batched so we redraw ~30 fps,
  // not 60 Hz.
  useEffect(() => {
    let pending = false;
    const unsub = subscribe((frame) => {
      const ring = ringRef.current;
      if (ring.frames.length < RING) ring.frames.push(frame);
      else ring.frames[ring.index] = frame;
      ring.index = (ring.index + 1) % RING;
      setLatest(frame);
      if (!pending) {
        pending = true;
        requestAnimationFrame(() => { pending = false; force((n) => (n + 1) % 1_000_000); });
      }
    });
    return unsub;
  }, [subscribe]);

  const orderedFrames = useMemo(() => {
    const ring = ringRef.current;
    if (ring.frames.length < RING) return ring.frames.slice();
    return [...ring.frames.slice(ring.index), ...ring.frames.slice(0, ring.index)];
  }, [latest]);

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
      setRecording(false);
    } else {
      startRecording();
      setRecording(true);
    }
  };

  const download = () => {
    const json = exportRecording({ ua: typeof navigator !== 'undefined' ? navigator.userAgent : '' });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stroke-recording-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="fixed bottom-16 left-2 right-2 z-[700] max-h-[70vh] overflow-y-auto rounded-xl border border-cyan-400/40 bg-black/85 p-3 text-[10px] text-white/85 shadow-2xl backdrop-blur-md md:left-auto md:right-2 md:w-[420px]">
      <header className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-300 font-semibold uppercase tracking-wider">Stroke Debug</span>
          <select
            value={activity}
            onChange={(e) => onActivityChange(e.target.value as ActivityId)}
            className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-white"
          >
            {(Object.keys(PROFILES) as ActivityId[]).map((k) => (
              <option key={k} value={k} className="bg-black">{PROFILES[k].label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleRecording}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded border transition ${
              recording ? 'bg-rose-500/30 border-rose-400 text-rose-100' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
            }`}
          >
            {recording ? <Square className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
            {recording ? 'Stop' : 'Record'}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
          >
            <Download className="w-3 h-3" /> JSON
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
        <Stat label="SPM" value={latest?.spm ?? '—'} />
        <Stat label="Conf" value={latest ? latest.confidence.toFixed(2) : '—'} />
        <Stat label="RMS" value={latest ? latest.rms.toFixed(2) : '—'} />
      </div>

      <SparkGroup title="Raw XYZ" frames={orderedFrames} selectors={[
        { color: '#f87171', get: (f) => f.raw.x },
        { color: '#4ade80', get: (f) => f.raw.y },
        { color: '#60a5fa', get: (f) => f.raw.z },
      ]} />
      <SparkGroup title="Linear XYZ" frames={orderedFrames} selectors={[
        { color: '#f87171', get: (f) => f.linear.x },
        { color: '#4ade80', get: (f) => f.linear.y },
        { color: '#60a5fa', get: (f) => f.linear.z },
      ]} />
      <SparkGroup title="Projection" frames={orderedFrames} selectors={[
        { color: '#a78bfa', get: (f) => f.projection },
      ]} />
      <SparkGroup title="Band-pass + thresholds" frames={orderedFrames} selectors={[
        { color: '#22d3ee', get: (f) => f.bandpass - f.baseline },
        { color: '#facc15', get: (f) => f.posThreshold, dashed: true },
        { color: '#facc15', get: (f) => f.negThreshold, dashed: true },
      ]} markers={(f) => f.peak ? '#22c55e' : f.rejected ? '#ef4444' : null} />
      <SparkGroup title="RMS" frames={orderedFrames} selectors={[
        { color: '#e879f9', get: (f) => f.rms },
      ]} />
      <SparkGroup title="Confidence" frames={orderedFrames} selectors={[
        { color: '#34d399', get: (f) => f.confidence, min: 0, max: 1 },
      ]} />
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded bg-white/5 border border-white/10 py-1">
    <div className="text-[9px] uppercase tracking-wider text-white/50">{label}</div>
    <div className="font-mono text-sm text-white">{value}</div>
  </div>
);

interface SparkSelector {
  color: string;
  get: (f: DebugFrame) => number;
  dashed?: boolean;
  min?: number;
  max?: number;
}

const WIDTH = 400;
const HEIGHT = 42;

const SparkGroup = ({
  title, frames, selectors, markers,
}: {
  title: string;
  frames: DebugFrame[];
  selectors: SparkSelector[];
  markers?: (f: DebugFrame) => string | null;
}) => {
  if (frames.length < 2) {
    return <div className="mb-2"><div className="text-white/50">{title}: waiting…</div></div>;
  }
  let min = Infinity, max = -Infinity;
  for (const s of selectors) {
    if (typeof s.min === 'number') min = Math.min(min, s.min);
    if (typeof s.max === 'number') max = Math.max(max, s.max);
    for (const f of frames) {
      const v = s.get(f);
      if (Number.isFinite(v)) { if (v < min) min = v; if (v > max) max = v; }
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.05;
  min -= pad; max += pad;
  const yFor = (v: number) => HEIGHT - ((v - min) / (max - min)) * HEIGHT;
  const xFor = (i: number) => (i / (frames.length - 1)) * WIDTH;

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-white/60">
        <span>{title}</span>
        <span className="text-white/40 text-[9px] font-mono">{min.toFixed(2)} → {max.toFixed(2)}</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="w-full h-[42px] bg-white/5 rounded">
        {selectors.map((s, si) => {
          const d = frames.map((f, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(s.get(f)).toFixed(1)}`).join(' ');
          return (
            <path key={si} d={d} fill="none" stroke={s.color} strokeWidth={1} strokeDasharray={s.dashed ? '3 3' : undefined} />
          );
        })}
        {markers && frames.map((f, i) => {
          const c = markers(f);
          if (!c) return null;
          const primary = selectors[0].get(f);
          return <circle key={i} cx={xFor(i)} cy={yFor(primary)} r={2} fill={c} />;
        })}
      </svg>
    </div>
  );
};
