import { useState, useEffect, useRef } from 'react';
import { Sparkles, Blend } from 'lucide-react';
import {
  IntentDef, INTENTS, getSuggestions, getContextLine, getBlendLabel,
} from './intentData';
import { PhysioState } from './stateEngine';

// ─── Animated Intent Card Background (Canvas) ─────────
const IntentCardCanvas = ({ gradient, isSelected, size = 'md' }: {
  gradient: { from: string; to: string };
  isSelected: boolean;
  size?: 'lg' | 'md';
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    let lastT = 0;
    const draw = (t: number) => {
      const dt = lastT ? (t - lastT) / 1000 : 0.016;
      lastT = t;
      phaseRef.current += dt * 0.6;

      ctx.clearRect(0, 0, w, h);

      // Flowing gradient blobs
      const p = phaseRef.current;
      for (let i = 0; i < 3; i++) {
        const ox = w * (0.3 + 0.4 * Math.sin(p + i * 2.1));
        const oy = h * (0.3 + 0.4 * Math.cos(p * 0.7 + i * 1.7));
        const r = (size === 'lg' ? 80 : 50) + Math.sin(p + i) * 15;
        const alpha = isSelected ? 0.4 : 0.2;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        grad.addColorStop(0, gradient.from + Math.round(alpha * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(1, gradient.to + '00');
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [gradient, isSelected, size]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full rounded-2xl"
      style={{ pointerEvents: 'none' }}
    />
  );
};


// ─── Mood ordering: top = party/uplifted, bottom = ambient/chill ──
// Arranged in a 4-column grid (read left→right, top→bottom)
const MOOD_ORDER = [
  // Row 1 — peak energy / party
  'party', 'dance', 'energize', 'activate',
  // Row 2 — uplifted / confident
  'happy', 'confident', 'flirty', 'date-night',
  // Row 3 — warm / engaged
  'romantic', 'creative', 'endurance', 'recover',
  // Row 4 — focused / steady
  'focus', 'deep-work', 'thoughtful', 'slow-down',
  // Row 5 — calm / inward / ambient
  'calm', 'pensive', 'melancholic', 'ambient',
];

// ─── Main Component ───────────────────────────────────
interface IntentSelectionProps {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  physioState: PhysioState;
  sessionDuration?: number;
  onSelectIntent: (primary: IntentDef, secondary?: IntentDef) => void;
  currentIntentId?: string;
}

const IntentSelection = ({
  timeOfDay, physioState, sessionDuration,
  onSelectIntent, currentIntentId,
}: IntentSelectionProps) => {
  const [primary, setPrimary] = useState<IntentDef | null>(null);
  const [secondary, setSecondary] = useState<IntentDef | null>(null);
  const [showAdapting, setShowAdapting] = useState(false);

  const suggestions = getSuggestions(timeOfDay, physioState);
  const contextLine = getContextLine(timeOfDay, physioState, sessionDuration);

  // Initialize from current intent
  useEffect(() => {
    if (currentIntentId) {
      const found = INTENTS.find(i => i.id === currentIntentId);
      if (found) setPrimary(found);
    }
  }, [currentIntentId]);

  const handleSelect = (intent: IntentDef) => {
    if (primary?.id === intent.id) {
      // Deselect
      setPrimary(null);
      setSecondary(null);
      return;
    }
    if (primary && primary.id !== intent.id) {
      // Set as secondary blend
      setSecondary(intent);
    } else {
      setPrimary(intent);
      setSecondary(null);
    }
  };

  const handleConfirm = () => {
    if (!primary) return;
    setShowAdapting(true);
    setTimeout(() => {
      onSelectIntent(primary, secondary || undefined);
      setShowAdapting(false);
    }, 2200);
  };

  const blendLabel = primary && secondary ? getBlendLabel(primary.id, secondary.id) : null;
  const activeGradient = primary
    ? secondary
      ? { from: primary.gradient.from, to: secondary.gradient.to }
      : primary.gradient
    : { from: '#6366f1', to: '#818cf8' };

  // ─── Adapting overlay ──────────
  if (showAdapting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="relative w-32 h-32">
          <IntentCardCanvas gradient={activeGradient} isSelected size="lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-white/90 text-lg font-medium">
            Adapting to help you feel{' '}
            <span style={{ color: activeGradient.from }}>
              {blendLabel || primary?.label}
            </span>
          </p>
          <div className="space-y-1 text-[11px] text-white/40">
            {primary?.engineMode === 'calm' && <p>Slowing tempo · softening harmonic tension</p>}
            {primary?.engineMode === 'focus' && <p>Structuring rhythm · reducing vocal presence</p>}
            {primary?.engineMode === 'energize' && <p>Increasing BPM · raising energy level</p>}
            {primary?.engineMode === 'endurance' && <p>Syncing rhythm to movement · sustaining drive</p>}
            {primary?.engineMode === 'recovery' && <p>Deepening tones · lowering intensity</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 -mx-4 -mt-5 pb-8">
      {/* ═══ HEADER ═══ */}
      <div className="px-6 pt-8">
        <h1 className="text-2xl font-semibold text-white/95 leading-tight">
          What do you want<br />to feel?
        </h1>
        <p className="text-[13px] text-white/35 mt-2 flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: activeGradient.from }}
          />
          {contextLine}
        </p>
      </div>

      {/* ═══ AI SUGGESTED ═══ */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[11px] text-white/35 uppercase tracking-wider">Suggested for you</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {suggestions.map((intent) => {
            const isActive = primary?.id === intent.id;
            const isSecondaryActive = secondary?.id === intent.id;
            return (
              <button
                key={intent.id}
                onClick={() => handleSelect(intent)}
                className={`relative overflow-hidden rounded-2xl p-3.5 text-left transition-all duration-500 border ${
                  isActive
                    ? 'border-white/[0.15] scale-[1.01]'
                    : isSecondaryActive
                      ? 'border-white/[0.1] scale-[1.005]'
                      : 'border-white/[0.05] hover:border-white/[0.08]'
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${intent.gradient.from}20, ${intent.gradient.to}10)`
                    : 'rgba(255,255,255,0.02)',
                }}
              >
                <IntentCardCanvas gradient={intent.gradient} isSelected={isActive || isSecondaryActive} />
                <div className="relative z-10">
                  <p className={`text-sm font-medium transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/80'}`}>
                    {intent.label}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5 leading-snug line-clamp-2">{intent.descriptor}</p>
                </div>
                {isSecondaryActive && (
                  <div className="absolute top-3 right-3 z-10">
                    <Blend className="w-3.5 h-3.5 text-white/40" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ ALL INTENTS — 4-COLUMN GRID, SORTED BY MOOD ═══ */}
      {/* Top: party/dance/uplifted   →   Bottom: ambient/pensive/chill */}
      <div className="px-6">
        <p className="text-[11px] text-white/25 uppercase tracking-wider mb-3">All moods</p>
        <div className="grid grid-cols-4 gap-2">
          {MOOD_ORDER.map((id) => {
            const intent = INTENTS.find(i => i.id === id);
            if (!intent) return null;
            const isActive = primary?.id === intent.id;
            const isSecondaryActive = secondary?.id === intent.id;
            return (
              <button
                key={intent.id}
                onClick={() => handleSelect(intent)}
                className={`relative overflow-hidden rounded-xl px-2 py-3 text-center transition-all duration-300 border aspect-[1/0.85] flex items-center justify-center ${
                  isActive
                    ? 'border-white/[0.18] scale-[1.02]'
                    : isSecondaryActive
                      ? 'border-white/[0.12]'
                      : 'border-white/[0.05] hover:border-white/[0.1]'
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${intent.gradient.from}30, ${intent.gradient.to}12)`
                    : 'rgba(255,255,255,0.02)',
                }}
              >
                <IntentCardCanvas gradient={intent.gradient} isSelected={isActive || isSecondaryActive} />
                <span className={`relative z-10 text-[12px] font-medium leading-tight ${isActive ? 'text-white' : 'text-white/75'}`}>
                  {intent.label}
                </span>
                {isSecondaryActive && (
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <Blend className="w-3 h-3 text-white/40" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-white/20 mt-3 text-center">Tap one to select · tap a second to blend</p>
      </div>

      {/* ═══ BLEND STATUS + CONFIRM ═══ */}
      {primary && (
        <div className="px-6 animate-fade-in">
          <div
            className="rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${activeGradient.from}15, ${activeGradient.to}08)`,
            }}
          >
            <IntentCardCanvas gradient={activeGradient} isSelected size="lg" />
            <div className="relative z-10">
              {secondary ? (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Blend className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Blended Intent</span>
                  </div>
                  <p className="text-xl font-semibold text-white/95">{blendLabel}</p>
                  <p className="text-[12px] text-white/40 mt-0.5">
                    {primary.label} + {secondary.label}
                  </p>
                </div>
              ) : (
                <div className="mb-3">
                  <p className="text-xl font-semibold text-white/95">{primary.label}</p>
                  <p className="text-[12px] text-white/40 mt-0.5">{primary.descriptor}</p>
                  <p className="text-[10px] text-white/20 mt-2">Tap another intent to blend</p>
                </div>
              )}

              <button
                onClick={handleConfirm}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.to})`,
                  color: 'white',
                  boxShadow: `0 8px 32px ${activeGradient.from}40`,
                }}
              >
                Begin · {blendLabel || primary.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntentSelection;
