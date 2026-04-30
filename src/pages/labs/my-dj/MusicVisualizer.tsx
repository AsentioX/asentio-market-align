import { useEffect, useRef } from 'react';
import { MusicParams } from './musicEngine';

interface Props {
  params: MusicParams;
  isPlaying: boolean;
  color: { from: string; to: string };
  alignment: number;
  height?: number;
}

interface Dot {
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
  size: number;
  hue: number; // 0..1 mix between from/to color
}

// Lerp two hex colors via rgb
function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

const DOT_COUNT = 42;

export default function MusicVisualizer({ params, isPlaying, color, alignment, height = 96 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const beatRef = useRef(0); // 0..1 pulses on each beat
  const sizeRef = useRef({ w: 0, h: height });
  const paramsRef = useRef(params);
  const colorRef = useRef(color);
  const alignmentRef = useRef(alignment);
  const playingRef = useRef(isPlaying);

  // Keep refs in sync without restarting animation
  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { alignmentRef.current = alignment; }, [alignment]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);

  // Initialize dots once
  useEffect(() => {
    dotsRef.current = Array.from({ length: DOT_COUNT }, () => ({
      baseX: Math.random(),
      baseY: 0.5 + (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
      size: 1.5 + Math.random() * 2.5,
      hue: Math.random(),
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let lastTime = performance.now();
    let lastBeatTime = performance.now();

    const draw = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const p = paramsRef.current;
      const col = colorRef.current;
      const align = alignmentRef.current;
      const playing = playingRef.current;

      // Idle state: gentle, low energy
      const energy = playing ? p.energy / 100 : 0.15;
      const rhythm = playing ? p.rhythmDensity / 100 : 0.2;
      const tension = playing ? p.harmonicTension / 100 : 0.1;
      const vocal = playing ? p.vocalPresence / 100 : 0;
      const bpm = playing ? p.bpm : 50;

      // Beat pulse: trigger every (60/bpm) seconds
      const beatInterval = 60 / Math.max(30, bpm);
      if ((time - lastBeatTime) / 1000 > beatInterval) {
        beatRef.current = 1;
        lastBeatTime = time;
      }
      beatRef.current = Math.max(0, beatRef.current - dt * 3.5); // decay

      // Global motion phase advances with rhythm + bpm
      phaseRef.current += dt * (0.5 + (bpm / 120) * (0.4 + rhythm * 1.2));

      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      // Background subtle gradient wash
      const wash = ctx.createLinearGradient(0, 0, w, 0);
      wash.addColorStop(0, col.from + '08');
      wash.addColorStop(1, col.to + '08');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      // Center waveform line
      ctx.beginPath();
      const lineSegments = 64;
      for (let i = 0; i <= lineSegments; i++) {
        const x = (i / lineSegments) * w;
        const wavePhase = phaseRef.current * 2 + (i / lineSegments) * Math.PI * 4;
        const amp = h * 0.18 * (0.3 + energy * 0.9 + beatRef.current * 0.4);
        const y = h / 2 + Math.sin(wavePhase) * amp + Math.sin(wavePhase * 0.5 + tension * 4) * amp * 0.4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
      lineGrad.addColorStop(0, col.from + '40');
      lineGrad.addColorStop(1, col.to + '40');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dancing dots
      const dots = dotsRef.current;
      for (const d of dots) {
        // Horizontal drift coupled to rhythm
        const drift = Math.sin(phaseRef.current * d.speed * 0.3 + d.phase) * 0.08 * (0.5 + rhythm);
        const x = ((d.baseX + drift + 1) % 1) * w;

        // Vertical bounce: scaled by energy + beat pulse
        const bounce = Math.sin(phaseRef.current * d.speed + d.phase) * (0.15 + energy * 0.3);
        const beatLift = beatRef.current * (0.08 + rhythm * 0.15) * Math.sin(d.phase * 3);
        const tensionWobble = Math.sin(phaseRef.current * 2.7 + d.phase * 1.3) * tension * 0.06;
        const y = h * (d.baseY + bounce + beatLift + tensionWobble);

        // Size pulsates with beat + vocal
        const scale = 1 + beatRef.current * 0.7 + vocal * 0.3 * Math.sin(phaseRef.current * 1.2 + d.phase);
        const radius = d.size * scale * (0.6 + alignmentRef.current * 0.6);

        const fill = mixHex(col.from, col.to, d.hue);
        const alpha = 0.35 + energy * 0.45 + beatRef.current * 0.2;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, radius * 3.5, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.5);
        glow.addColorStop(0, fill.replace('rgb', 'rgba').replace(')', `,${alpha * 0.35})`));
        glow.addColorStop(1, fill.replace('rgb', 'rgba').replace(')', ',0)'));
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fill.replace('rgb', 'rgba').replace(')', `,${Math.min(1, alpha + 0.2)})`);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full block rounded-lg"
      style={{ height, background: 'transparent' }}
    />
  );
}
