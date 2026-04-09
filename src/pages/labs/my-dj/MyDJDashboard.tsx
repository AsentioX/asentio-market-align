import { useState, useEffect, useRef } from 'react';
import { MapPin, Volume2, ChevronUp, ThumbsUp, ThumbsDown, SkipForward, Pause, Play, Plus, X, Loader2, Compass } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useMyDJ } from './useMyDJ';
import { MODE_META, PHYSIO_LABELS, UserMode, PhysioState } from './stateEngine';
import { useAuth } from '@/hooks/useAuth';
import { useLocations, useCreateLocation, DJLocation } from '@/hooks/useMyDJScenes';
import { IntentDef, getBlendLabel } from './intentData';

// ─── State-driven copy & color ───────────────────────
const STATE_NARRATIVES: Record<PhysioState, { verb: string; description: string }> = {
  calm: { verb: 'Sustaining calm', description: 'Your body is at ease. Maintaining this state.' },
  stressed: { verb: 'Lowering your stress', description: 'Elevated tension detected. Applying counterbalance.' },
  focused: { verb: 'Stabilizing your focus', description: 'Deep concentration active. Reinforcing clarity.' },
  fatigued: { verb: 'Gently restoring', description: 'Low energy detected. Building restorative soundscape.' },
  energized: { verb: 'Channeling your energy', description: 'High vitality detected. Amplifying your drive.' },
  exercising: { verb: 'Matching your rhythm', description: 'Active movement detected. Syncing to your cadence.' },
  resting: { verb: 'Deepening your rest', description: 'Recovery state detected. Creating space to recover.' },
};

const STATE_GRADIENTS: Record<PhysioState, { from: string; to: string; glow: string }> = {
  calm: { from: '#0ea5e9', to: '#06b6d4', glow: 'rgba(14,165,233,0.15)' },
  stressed: { from: '#f97316', to: '#ef4444', glow: 'rgba(249,115,22,0.15)' },
  focused: { from: '#8b5cf6', to: '#6366f1', glow: 'rgba(139,92,246,0.15)' },
  fatigued: { from: '#64748b', to: '#475569', glow: 'rgba(100,116,139,0.15)' },
  energized: { from: '#f59e0b', to: '#ef4444', glow: 'rgba(245,158,11,0.15)' },
  exercising: { from: '#10b981', to: '#14b8a6', glow: 'rgba(16,185,129,0.15)' },
  resting: { from: '#818cf8', to: '#6366f1', glow: 'rgba(129,140,248,0.15)' },
};

const ADAPTATION_MESSAGES: Record<UserMode, (state: PhysioState) => string[]> = {
  calm: (s) => {
    if (s === 'stressed') return ['Stress elevated', 'Slowing tempo · softening tones', 'Guiding toward calm'];
    if (s === 'energized') return ['Energy high', 'Reducing rhythmic density', 'Easing into stillness'];
    return ['State aligned', 'Maintaining ambient balance', 'Calm sustained'];
  },
  focus: (s) => {
    if (s === 'stressed') return ['Tension detected', 'Applying structured rhythm', 'Redirecting to focus'];
    if (s === 'fatigued') return ['Fatigue detected', 'Increasing clarity tones', 'Rebuilding concentration'];
    return ['Focus active', 'Reinforcing neural patterns', 'Sustained deep work'];
  },
  energize: (s) => {
    if (s === 'calm') return ['Low activation', 'Building energy gradually', 'Warming up rhythm'];
    if (s === 'fatigued') return ['Fatigue detected', 'Injecting rhythmic drive', 'Elevating state'];
    return ['Energy flowing', 'Amplifying drive', 'Peak activation'];
  },
  endurance: (s) => {
    if (s === 'exercising') return ['Movement detected', 'Syncing BPM to cadence', 'Sustaining rhythm'];
    return ['Preparing pace', 'Matching target tempo', 'Building endurance soundscape'];
  },
  recovery: (s) => {
    if (s === 'stressed') return ['Post-activity stress', 'Applying deep tones', 'Initiating cooldown'];
    return ['Recovery active', 'Deepening relaxation', 'Restoring baseline'];
  },
};

const ROOM_PRESETS = [
  { name: 'Kitchen', type: 'room', icon: '🍳' },
  { name: 'Living Room', type: 'room', icon: '🛋️' },
  { name: 'Bedroom', type: 'room', icon: '🛏️' },
  { name: 'Office', type: 'workplace', icon: '🏢' },
  { name: 'Gym', type: 'gym_zone', icon: '🏋️' },
  { name: 'Outdoors', type: 'outdoor_route', icon: '🌳' },
  { name: 'Studio', type: 'venue', icon: '🎵' },
  { name: 'Car', type: 'room', icon: '🚗' },
];

const LOCATION_ICON_MAP: Record<string, string> = {
  room: '🏠', home_zone: '🏡', gym_zone: '🏋️', outdoor_route: '🌳', workplace: '🏢', venue: '🎭',
};

const LOCATION_NAME_ICON_MAP: Record<string, string> = {
  'Kitchen': '🍳', 'Living Room': '🛋️', 'Bedroom': '🛏️', 'Office': '🏢',
  'Gym': '🏋️', 'Home gym': '🏋️', 'Outdoors': '🌳', 'Studio': '🎵',
  'Car': '🚗', 'Garage': '🚗', 'Garden': '🌿', 'Bathroom': '🛁',
  'Patio': '☀️', 'Balcony': '🌅', 'Basement': '🎮', 'Library': '📚',
};

// ─── Breathing Orb ───────────────────────────────────
const BreathingOrb = ({ color, heartRate, alignment }: { color: { from: string; to: string; glow: string }; heartRate: number; alignment: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const breathRate = Math.max(0.3, Math.min(2.5, heartRate / 60));
    let lastTime = 0;

    const draw = (time: number) => {
      const dt = lastTime ? (time - lastTime) / 1000 : 0.016;
      lastTime = time;
      phaseRef.current += dt * breathRate * Math.PI;

      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      const breathScale = 0.85 + Math.sin(phaseRef.current) * 0.15;
      const baseRadius = 70 * breathScale;

      // Outer glow rings
      for (let i = 4; i >= 0; i--) {
        const r = baseRadius + i * 18 + Math.sin(phaseRef.current + i * 0.5) * 4;
        const alpha = (0.03 + alignment * 0.03) * (1 - i * 0.18);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
        grad.addColorStop(0, `${color.from}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, `${color.to}00`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Core orb
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
      coreGrad.addColorStop(0, color.from + '90');
      coreGrad.addColorStop(0.6, color.to + '50');
      coreGrad.addColorStop(1, color.to + '00');
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Inner bright core
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.4);
      innerGrad.addColorStop(0, '#ffffff30');
      innerGrad.addColorStop(1, '#ffffff00');
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [color, heartRate, alignment]);

  return <canvas ref={canvasRef} className="w-[280px] h-[280px]" style={{ width: 280, height: 280 }} />;
};

// ─── Adaptation Loop Visualization ───────────────────
const AdaptationLoop = ({ messages, color }: { messages: string[]; color: { from: string; to: string } }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % messages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="space-y-2">
      {messages.map((msg, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;
        return (
          <div
            key={i}
            className="flex items-center gap-3 transition-all duration-700"
            style={{ opacity: isActive ? 1 : isPast ? 0.35 : 0.2 }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-700"
              style={{
                backgroundColor: isActive ? color.from : 'rgba(255,255,255,0.2)',
                boxShadow: isActive ? `0 0 8px ${color.from}60` : 'none',
                transform: isActive ? 'scale(1.5)' : 'scale(1)',
              }}
            />
            <span className={`text-xs transition-all duration-700 ${isActive ? 'text-white/90' : 'text-white/30'}`}>
              {msg}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── State Transition Arc ────────────────────────────
const StateTransitionArc = ({ from, to, alignment, color }: { from: string; to: string; alignment: number; color: { from: string; to: string } }) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-white/50">{from}</span>
        <div className="flex-1 mx-4 relative h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${alignment * 100}%`,
              background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
              boxShadow: `0 0 12px ${color.from}40`,
            }}
          />
          {/* Pulse dot at the leading edge */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-1000"
            style={{
              left: `calc(${alignment * 100}% - 4px)`,
              backgroundColor: color.to,
              boxShadow: `0 0 8px ${color.to}80`,
            }}
          />
        </div>
        <span className="text-[11px] text-white/50">{to}</span>
      </div>
    </div>
  );
};

// ─── Bio Pulse Indicators ────────────────────────────
const BioPulse = ({ label, value, unit, isElevated }: { label: string; value: number; unit: string; isElevated?: boolean }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
    <span className={`text-sm font-medium tabular-nums transition-colors duration-500 ${isElevated ? 'text-amber-400' : 'text-white/70'}`}>
      {value}<span className="text-[9px] text-white/30 ml-0.5">{unit}</span>
    </span>
  </div>
);

// ─── Main Dashboard ──────────────────────────────────
export type DJStateProps = ReturnType<typeof useMyDJ>;

interface DashboardProps {
  djState: DJStateProps;
  activeIntent?: { primary: IntentDef; secondary?: IntentDef } | null;
  onChangeIntent?: () => void;
}

const MyDJDashboard = ({ djState, activeIntent, onChangeIntent }: DashboardProps) => {
  const {
    mode, setMode, intensity, setIntensity,
    volume, setVolume,
    isPlaying, startSession, stopSession,
    bio, setBio, state, musicParams, nowPlaying,
    stats, skip, like, dislike, timeOfDay,
  } = djState;

  const [showInfluence, setShowInfluence] = useState(false);
  const [showBioSliders, setShowBioSliders] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);

  // Room state: which rooms are "active" (toggled on)
  const { user } = useAuth();
  const userId = user?.id;
  const { data: rooms = [], isLoading: roomsLoading } = useLocations(userId);
  const createLocation = useCreateLocation();
  const [activeRoomIds, setActiveRoomIds] = useState<Set<string>>(new Set());

  // Auto-activate all rooms when they load
  useEffect(() => {
    if (rooms.length > 0 && activeRoomIds.size === 0) {
      setActiveRoomIds(new Set(rooms.map(r => r.id)));
    }
  }, [rooms]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRoom = (id: string) => {
    setActiveRoomIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allRoomsActive = rooms.length > 0 && activeRoomIds.size === rooms.length;
  const toggleAllRooms = () => {
    if (allRoomsActive) setActiveRoomIds(new Set());
    else setActiveRoomIds(new Set(rooms.map(r => r.id)));
  };

  const handleAddPresetRoom = (preset: typeof ROOM_PRESETS[0]) => {
    if (!userId) return;
    createLocation.mutate(
      { user_id: userId, name: preset.name, location_type: preset.type, detection_method: 'manual' },
      { onSuccess: () => setShowAddRoom(false) }
    );
  };

  const getLocIcon = (loc: DJLocation) => LOCATION_ICON_MAP[loc.location_type] || '📍';

  const stateColor = STATE_GRADIENTS[state.current];
  const narrative = STATE_NARRATIVES[state.current];
  const adaptMessages = ADAPTATION_MESSAGES[mode](state.current);

  // Auto-start session on mount (ambient behavior)
  useEffect(() => {
    if (!isPlaying) {
      const t = setTimeout(() => startSession(), 800);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const influenceLabel = intensity < 33 ? 'Assistive' : intensity < 66 ? 'Balanced' : 'Transformative';

  return (
    <div className="space-y-0 -mx-4 -mt-5 pb-24">
      {/* ═══ IMMERSIVE STATE HERO ═══ */}
      <div
        className="relative px-6 pt-8 pb-6 overflow-hidden transition-colors duration-[2000ms]"
        style={{ background: `linear-gradient(180deg, ${stateColor.glow} 0%, transparent 100%)` }}
      >
        {/* Ambient background layer */}
        <div
          className="absolute inset-0 opacity-20 transition-all duration-[3000ms]"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${stateColor.from}30 0%, transparent 70%)`,
          }}
        />

        {/* Room pills — inline at top */}
        <div className="relative z-10 flex items-center gap-1.5 mb-8 overflow-x-auto scrollbar-none">
          {roomsLoading ? (
            <Loader2 className="w-3 h-3 text-white/20 animate-spin" />
          ) : rooms.length === 0 ? (
            <button
              onClick={() => setShowAddRoom(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border border-dashed border-white/[0.1] text-white/30 hover:bg-white/[0.05] transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Room</span>
            </button>
          ) : (
            <>
              <button
                onClick={toggleAllRooms}
                className={`px-2.5 py-1 rounded-full text-[10px] transition-all border shrink-0 ${
                  allRoomsActive
                    ? 'bg-white/[0.1] border-white/[0.15] text-white/70'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/30 hover:bg-white/[0.05]'
                }`}
              >
                All
              </button>
              {rooms.map(room => {
                const isActive = activeRoomIds.has(room.id);
                return (
                  <button
                    key={room.id}
                    onClick={() => toggleRoom(room.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] transition-all border shrink-0 ${
                      isActive
                        ? 'bg-white/[0.1] border-white/[0.15] text-white/70'
                        : 'bg-white/[0.02] border-white/[0.06] text-white/25 hover:bg-white/[0.05]'
                    }`}
                  >
                    {getLocIcon(room)} {room.name}
                  </button>
                );
              })}
              <button
                onClick={() => setShowAddRoom(true)}
                className="w-6 h-6 rounded-full flex items-center justify-center border border-dashed border-white/[0.1] text-white/25 hover:text-white/50 hover:bg-white/[0.05] transition-colors shrink-0"
              >
                <Plus className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Central Breathing Orb */}
        <div className="relative z-10 flex justify-center mb-4">
          <BreathingOrb color={stateColor} heartRate={bio.heartRate} alignment={state.alignment} />
          {/* State text overlay on orb */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p
              className="text-lg font-semibold text-white/90 transition-all duration-1000"
              style={{ textShadow: `0 0 20px ${stateColor.from}40` }}
            >
              {narrative.verb}
            </p>
            <p className="text-[11px] text-white/40 mt-1 max-w-[200px] text-center leading-snug">
              {narrative.description}
            </p>
          </div>
        </div>

        {/* Pause / Play button below orb */}
        <div className="relative z-10 flex justify-center mb-5">
          <button
            onClick={isPlaying ? stopSession : startSession}
            className="w-11 h-11 rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
        </div>

        {/* Bio Pulse Strip — ambient, not clinical */}
        <div className="relative z-10 flex justify-center gap-6">
          <BioPulse label="Heart" value={bio.heartRate} unit="bpm" isElevated={bio.heartRate > 100} />
          <BioPulse label="HRV" value={bio.hrv} unit="ms" />
          <BioPulse label="Stress" value={bio.stress} unit="%" isElevated={bio.stress > 60} />
          {mode === 'endurance' && <BioPulse label="Cadence" value={bio.cadence} unit="spm" />}
        </div>
      </div>

      {/* ═══ LIVE ADAPTATION LOOP ═══ */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-1 h-1 rounded-full animate-pulse"
            style={{ backgroundColor: stateColor.from }}
          />
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Live Adaptation</span>
        </div>
        <AdaptationLoop messages={adaptMessages} color={stateColor} />
      </div>

      {/* ═══ STATE TRANSITION ARC ═══ */}
      <div className="px-6 pb-4">
        <StateTransitionArc
          from={PHYSIO_LABELS[state.current]}
          to={PHYSIO_LABELS[state.target]}
          alignment={state.alignment}
          color={stateColor}
        />
      </div>

      {/* ═══ SESSION STATUS ═══ */}
      {isPlaying && (
        <div className="px-6 pb-4">
          <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: stateColor.from }}
                />
                <span className="text-[11px] text-white/40">Adaptive session active</span>
              </div>
              <span className="text-[11px] text-white/25 tabular-nums">{formatTime(stats.durationSec)}</span>
            </div>

            {/* Now playing — minimal */}
            {nowPlaying && (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{nowPlaying.title}</p>
                  <p className="text-[11px] text-white/30 truncate">{nowPlaying.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={dislike}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-red-400/80 transition-colors"
                    title="Dislike — skip & remember"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={like}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-emerald-400/80 transition-colors"
                    title="Like — remember preference"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={skip}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
                    title="Skip"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Adaptive params — ambient bars */}
            <div className="mt-4 flex items-end gap-1 h-8">
              {[
                { label: 'BPM', value: musicParams.bpm / 200 },
                { label: 'Energy', value: musicParams.energy / 100 },
                { label: 'Rhythm', value: musicParams.rhythmDensity / 100 },
                { label: 'Vocal', value: musicParams.vocalPresence / 100 },
                { label: 'Tension', value: musicParams.harmonicTension / 100 },
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 flex flex-col items-center">
                  <div className="w-full h-8 rounded-sm bg-white/[0.03] overflow-hidden flex items-end">
                    <div
                      className="w-full rounded-sm transition-all duration-1000"
                      style={{
                        height: `${Math.max(8, value * 100)}%`,
                        background: `linear-gradient(to top, ${stateColor.from}60, ${stateColor.to}30)`,
                      }}
                    />
                  </div>
                  <span className="text-[8px] text-white/20 mt-1">{label}</span>
                </div>
              ))}
            </div>

            {/* Volume — ultra minimal */}
            <div className="mt-3 flex items-center gap-3">
              <Volume2 className="w-3 h-3 text-white/20 shrink-0" />
              <Slider
                value={[Math.round(volume * 100)]}
                onValueChange={([v]) => setVolume(v / 100)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD ROOM OVERLAY ═══ */}
      {showAddRoom && (
        <div className="px-6 pb-4">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/60 font-medium">Choose a room</span>
              <button onClick={() => setShowAddRoom(false)} className="text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ROOM_PRESETS
                .filter(p => !rooms.some(r => r.name === p.name))
                .map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handleAddPresetRoom(preset)}
                    disabled={createLocation.isPending}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.1] transition-all disabled:opacity-50"
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-[9px] text-white/40">{preset.name}</span>
                  </button>
                ))}
            </div>
            {createLocation.isPending && (
              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-white/30">
                <Loader2 className="w-3 h-3 animate-spin" /> Adding...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ SYSTEM INFLUENCE ═══ */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setShowInfluence(!showInfluence)}
          className="w-full flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/25 uppercase tracking-widest">System Influence</span>
            <span className="text-[11px] text-white/40">{influenceLabel}</span>
          </div>
          <ChevronUp className={`w-3 h-3 text-white/20 transition-transform ${showInfluence ? '' : 'rotate-180'}`} />
        </button>
        {showInfluence && (
          <div className="pt-2 pb-1">
            <Slider
              value={[intensity]}
              onValueChange={([v]) => setIntensity(v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-white/20">Assistive</span>
              <span className="text-[9px] text-white/20">Transformative</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ACTIVE INTENT — FIXED BOTTOM BAR ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a10]/95 backdrop-blur-2xl border-t border-white/[0.03]">
        <div className="max-w-lg mx-auto px-4 py-3">
          {activeIntent ? (
            <button
              onClick={onChangeIntent}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] transition-all group active:scale-[0.98]"
            >
              <div
                className="w-9 h-9 rounded-xl shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${activeIntent.primary.gradient.from}, ${activeIntent.secondary?.gradient.to || activeIntent.primary.gradient.to})`,
                }}
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm text-white/80 font-medium truncate">
                  {activeIntent.secondary
                    ? getBlendLabel(activeIntent.primary.id, activeIntent.secondary.id)
                    : activeIntent.primary.label}
                </p>
                <p className="text-[10px] text-white/30 truncate">
                  {activeIntent.secondary
                    ? `${activeIntent.primary.label} + ${activeIntent.secondary.label}`
                    : activeIntent.primary.descriptor}
                </p>
              </div>
              <div className="flex items-center gap-1 text-white/20 group-hover:text-white/40 transition-colors shrink-0">
                <span className="text-[10px] uppercase tracking-wider">Change</span>
                <Compass className="w-3.5 h-3.5" />
              </div>
            </button>
          ) : (
            <button
              onClick={onChangeIntent}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-dashed border-white/[0.08] text-white/30 hover:text-white/50 hover:bg-white/[0.03] transition-all active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              <span className="text-[11px]">Set your intent</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ BIO SIMULATOR (dev/demo) ═══ */}
      <div className="px-6 pb-8">
        <button
          onClick={() => setShowBioSliders(!showBioSliders)}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-[10px] text-white/15 uppercase tracking-widest">Simulate Biometrics</span>
          <ChevronUp className={`w-3 h-3 text-white/15 transition-transform ${showBioSliders ? '' : 'rotate-180'}`} />
        </button>
        {showBioSliders && (
          <div className="space-y-3 pt-2">
            {([
              { label: 'Heart Rate', key: 'heartRate' as const, value: bio.heartRate, min: 40, max: 200, unit: 'bpm' },
              { label: 'HRV', key: 'hrv' as const, value: bio.hrv, min: 10, max: 120, unit: 'ms' },
              { label: 'Stress', key: 'stress' as const, value: bio.stress, min: 0, max: 100, unit: '%' },
              { label: 'Cadence', key: 'cadence' as const, value: bio.cadence, min: 0, max: 200, unit: 'spm' },
            ] as const).map(({ label, key, value, min, max, unit }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-white/25">{label}</span>
                  <span className="text-[10px] text-white/30 tabular-nums">{value} {unit}</span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={([v]) => setBio(prev => ({ ...prev, [key]: v }))}
                  min={min}
                  max={max}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ ALIGNMENT HISTORY (when active) ═══ */}
      {isPlaying && stats.alignmentHistory.length > 10 && (
        <div className="px-6 pb-8">
          <p className="text-[10px] text-white/15 uppercase tracking-widest mb-2">Alignment Over Time</p>
          <div className="h-10 flex items-end gap-px">
            {stats.alignmentHistory.slice(-60).map((pt, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[1px] transition-all duration-300"
                style={{
                  height: `${pt.v * 100}%`,
                  background: `linear-gradient(to top, ${stateColor.from}40, ${stateColor.to}15)`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDJDashboard;
