import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, Sparkles, Blend } from 'lucide-react';
import {
  IntentDef, INTENTS, DIMENSION_META, getSuggestions, getContextLine, getBlendLabel,
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

// ─── Spectrum Slider ──────────────────────────────────
const SpectrumSlider = ({ left, right, value, onChange }: {
  left: string; right: string; value: number; onChange: (v: number) => void;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(pct);
  }, [onChange]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => { if (dragging.current) handleMove(e.clientX); };
  const onPointerUp = () => { dragging.current = false; };

  return (
    <div className="space-y-1.5">
      <div
        ref={trackRef}
        className="relative h-8 rounded-full bg-white/[0.04] cursor-pointer touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
          style={{
            width: `${value * 100}%`,
            background: `linear-gradient(90deg, rgba(99,102,241,0.3), rgba(249,115,22,0.3))`,
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/90 shadow-lg shadow-black/30 transition-[left] duration-75"
          style={{ left: `calc(${value * 100}% - 10px)` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[10px] text-white/25">{left}</span>
        <span className="text-[10px] text-white/25">{right}</span>
      </div>
    </div>
  );
};

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
  const [expandedDim, setExpandedDim] = useState<IntentDef['dimension'] | null>(null);
  const [showSpectrum, setShowSpectrum] = useState(false);
  const [spectrumValues, setSpectrumValues] = useState({ energy: 0.5, social: 0.5, mood: 0.5 });
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
        <div className="grid grid-cols-1 gap-3">
          {suggestions.map((intent) => {
            const isActive = primary?.id === intent.id;
            const isSecondaryActive = secondary?.id === intent.id;
            return (
              <button
                key={intent.id}
                onClick={() => handleSelect(intent)}
                className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-500 border ${
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
                <IntentCardCanvas gradient={intent.gradient} isSelected={isActive || isSecondaryActive} size="lg" />
                <div className="relative z-10">
                  <p className={`text-lg font-medium transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/80'}`}>
                    {intent.label}
                  </p>
                  <p className="text-[12px] text-white/40 mt-0.5">{intent.descriptor}</p>
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

      {/* ═══ EXPLORE BY DIMENSION ═══ */}
      <div className="px-6">
        <p className="text-[11px] text-white/25 uppercase tracking-wider mb-3">Explore</p>
        <div className="space-y-1.5">
          {(Object.keys(DIMENSION_META) as IntentDef['dimension'][]).map((dim) => {
            const meta = DIMENSION_META[dim];
            const dimIntents = INTENTS.filter(i => i.dimension === dim);
            const isExpanded = expandedDim === dim;

            return (
              <div key={dim}>
                <button
                  onClick={() => setExpandedDim(isExpanded ? null : dim)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                    isExpanded
                      ? 'bg-white/[0.06] border border-white/[0.08]'
                      : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{meta.emoji}</span>
                    <span className={`text-sm ${isExpanded ? 'text-white/80' : 'text-white/50'}`}>{meta.label}</span>
                    <span className="text-[10px] text-white/20">{dimIntents.length}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-white/20 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pl-2 animate-fade-in">
                    {dimIntents.map((intent) => {
                      const isActive = primary?.id === intent.id;
                      const isSecondaryActive = secondary?.id === intent.id;
                      return (
                        <button
                          key={intent.id}
                          onClick={() => handleSelect(intent)}
                          className={`relative overflow-hidden rounded-xl p-3.5 text-left transition-all duration-400 border ${
                            isActive
                              ? 'border-white/[0.15]'
                              : isSecondaryActive
                                ? 'border-white/[0.1]'
                                : 'border-white/[0.04] hover:border-white/[0.08]'
                          }`}
                          style={{
                            background: isActive
                              ? `linear-gradient(135deg, ${intent.gradient.from}25, ${intent.gradient.to}10)`
                              : 'rgba(255,255,255,0.02)',
                          }}
                        >
                          <IntentCardCanvas gradient={intent.gradient} isSelected={isActive || isSecondaryActive} />
                          <div className="relative z-10">
                            <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                              {intent.label}
                            </p>
                            <p className="text-[10px] text-white/30 mt-0.5 leading-snug line-clamp-2">
                              {intent.descriptor}
                            </p>
                          </div>
                          {isSecondaryActive && (
                            <div className="absolute top-2 right-2 z-10">
                              <Blend className="w-3 h-3 text-white/30" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ INTENT SPECTRUM ═══ */}
      <div className="px-6">
        <button
          onClick={() => setShowSpectrum(!showSpectrum)}
          className="flex items-center gap-2 text-[11px] text-white/25 uppercase tracking-wider mb-3 hover:text-white/40 transition-colors"
        >
          <span>Fine-tune</span>
          <ChevronRight className={`w-3 h-3 transition-transform ${showSpectrum ? 'rotate-90' : ''}`} />
        </button>
        {showSpectrum && (
          <div className="space-y-5 animate-fade-in">
            <SpectrumSlider
              left="Calm"
              right="Energized"
              value={spectrumValues.energy}
              onChange={(v) => setSpectrumValues(s => ({ ...s, energy: v }))}
            />
            <SpectrumSlider
              left="Internal"
              right="Social"
              value={spectrumValues.social}
              onChange={(v) => setSpectrumValues(s => ({ ...s, social: v }))}
            />
            <SpectrumSlider
              left="Serious"
              right="Playful"
              value={spectrumValues.mood}
              onChange={(v) => setSpectrumValues(s => ({ ...s, mood: v }))}
            />
          </div>
        )}
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
