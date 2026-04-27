import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, X, Circle, Play, Clock, MapPin, Wifi } from 'lucide-react';

interface Clip {
  id: string;
  time: string;       // e.g. "3 min ago"
  duration: string;   // e.g. "0:47"
  caption: string;    // e.g. "Recognized at front door"
  thumbHue: number;   // 0-360
}

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  personName: string;
  personInitials: string;
  location: string;          // last known location / camera label
  isLive: boolean;           // true => show live feed; false => recorded only
  headshot?: string;
  clips?: Clip[];
}

const DEFAULT_CLIPS: Clip[] = [
  { id: 'c1', time: '3 min ago',  duration: '0:47', caption: 'Approached entry · face matched',  thumbHue: 220 },
  { id: 'c2', time: '1 hr ago',   duration: '1:12', caption: 'Walked through hallway',           thumbHue: 280 },
  { id: 'c3', time: '6 hr ago',   duration: '0:22', caption: 'Left through garage',              thumbHue: 160 },
  { id: 'c4', time: 'Yesterday',  duration: '0:34', caption: 'Returned home · door auto-unlocked', thumbHue: 30 },
];

const CameraModal = ({ open, onClose, personName, personInitials, location, isLive, headshot, clips = DEFAULT_CLIPS }: CameraModalProps) => {
  const [tab, setTab] = useState<'live' | 'recorded'>(isLive ? 'live' : 'recorded');
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!open) return;
    setTab(isLive ? 'live' : 'recorded');
    setActiveClip(null);
  }, [open, isLive]);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl rounded-3xl bg-stone-950 text-white shadow-2xl overflow-hidden border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-stone-900/80">
                <div className="flex items-center gap-3 min-w-0">
                  {headshot ? (
                    <img src={headshot} alt={personName} className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
                      {personInitials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-semibold flex items-center gap-1.5">
                      <Video className="w-3 h-3" /> Camera feed
                    </div>
                    <div className="text-sm font-semibold truncate">{personName}</div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-stone-300"
                  aria-label="Close camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-4 pt-3">
                <TabBtn active={tab === 'live'} disabled={!isLive} onClick={() => setTab('live')}>
                  <Circle className={`w-2 h-2 fill-current ${isLive ? 'text-rose-500 animate-pulse' : 'text-stone-600'}`} />
                  Live
                </TabBtn>
                <TabBtn active={tab === 'recorded'} onClick={() => setTab('recorded')}>
                  <Clock className="w-3 h-3" />
                  Recorded
                </TabBtn>
                <div className="ml-auto text-[11px] text-stone-400 inline-flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {location}
                </div>
              </div>

              {/* Viewport */}
              <div className="px-4 py-4">
                {tab === 'live' && isLive && <LivePane name={personName} location={location} now={now} />}
                {tab === 'live' && !isLive && (
                  <OfflinePane name={personName} />
                )}
                {tab === 'recorded' && (
                  activeClip ? (
                    <ClipPlayer clip={activeClip} onBack={() => setActiveClip(null)} />
                  ) : (
                    <ClipGrid clips={clips} onPick={setActiveClip} />
                  )
                )}
              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Demo prototype — feeds and clips are simulated. In production, X1 streams from on-device cameras and stores 30-day rolling history.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const TabBtn = ({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
      active
        ? 'bg-white/10 text-white'
        : disabled
        ? 'text-stone-600 cursor-not-allowed'
        : 'text-stone-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {children}
  </button>
);

const LivePane = ({ name, location, now }: { name: string; location: string; now: Date }) => (
  <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-900 ring-1 ring-white/10">
    {/* simulated noisy gradient feed */}
    <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-black" />
    <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
      backgroundImage:
        'radial-gradient(circle at 30% 40%, hsl(220 60% 30% / 0.6), transparent 50%), radial-gradient(circle at 70% 70%, hsl(280 50% 30% / 0.5), transparent 55%)',
    }} />
    {/* moving scanline */}
    <motion.div
      initial={{ y: '-10%' }}
      animate={{ y: '110%' }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      className="absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent"
    />
    {/* identity bounding box */}
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2.5, repeat: Infinity }}
      className="absolute left-[34%] top-[22%] w-[28%] h-[46%] border-2 border-emerald-400 rounded-md shadow-[0_0_30px_rgba(16,185,129,0.4)]"
    >
      <div className="absolute -top-6 left-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">
        {name} · 99%
      </div>
    </motion.div>

    {/* HUD overlays */}
    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md bg-rose-500/90">
      <Circle className="w-1.5 h-1.5 fill-current animate-pulse" /> LIVE
    </div>
    <div className="absolute top-3 right-3 text-[10px] font-mono text-white/80 bg-black/40 px-2 py-1 rounded-md">
      {now.toLocaleTimeString()}
    </div>
    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-[10px] text-white/70 font-mono">
      <div>
        <div className="font-bold text-white/90">{location.toUpperCase()}</div>
        <div className="opacity-70">CAM-04 · 1080p · 30fps</div>
      </div>
      <div className="inline-flex items-center gap-1 bg-black/40 px-2 py-1 rounded">
        <Wifi className="w-3 h-3" /> 24 ms
      </div>
    </div>
  </div>
);

const OfflinePane = ({ name }: { name: string }) => (
  <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-900 ring-1 ring-white/10 flex flex-col items-center justify-center text-center px-6">
    <Video className="w-8 h-8 text-stone-500 mb-2" />
    <div className="text-sm font-semibold text-white">{name} is off-camera</div>
    <p className="text-[12px] text-stone-400 mt-1 max-w-sm">
      No live feed available right now. Browse recorded clips from the last sightings below.
    </p>
  </div>
);

const ClipGrid = ({ clips, onPick }: { clips: Clip[]; onPick: (c: Clip) => void }) => (
  <div className="grid grid-cols-2 gap-3">
    {clips.map((c) => (
      <button
        key={c.id}
        onClick={() => onPick(c)}
        className="group relative text-left rounded-xl overflow-hidden ring-1 ring-white/10 hover:ring-white/30 transition-all"
      >
        <div className="aspect-video relative" style={{ background: `linear-gradient(135deg, hsl(${c.thumbHue} 50% 22%), hsl(${(c.thumbHue + 40) % 360} 40% 12%))` }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <Play className="w-4 h-4 text-white fill-current" />
            </div>
          </div>
          <div className="absolute bottom-1.5 right-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white/90">
            {c.duration}
          </div>
        </div>
        <div className="p-2.5 bg-stone-900">
          <div className="text-[11px] text-stone-400 font-medium">{c.time}</div>
          <div className="text-[12px] text-white font-semibold mt-0.5 leading-snug truncate">{c.caption}</div>
        </div>
      </button>
    ))}
  </div>
);

const ClipPlayer = ({ clip, onBack }: { clip: Clip; onBack: () => void }) => (
  <div>
    <div
      className="relative aspect-video rounded-2xl overflow-hidden ring-1 ring-white/10"
      style={{ background: `linear-gradient(135deg, hsl(${clip.thumbHue} 50% 22%), hsl(${(clip.thumbHue + 40) % 360} 40% 12%))` }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.1),transparent_60%)]" />
      <motion.div
        initial={{ y: '-10%' }}
        animate={{ y: '110%' }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent"
      />
      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/90">
        <Clock className="w-3 h-3" /> RECORDED · {clip.time}
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <div className="h-1 bg-white/15 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="h-full bg-white"
          />
        </div>
        <div className="text-[11px] text-white/80 font-medium mt-2">{clip.caption}</div>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between">
      <button
        onClick={onBack}
        className="text-[12px] font-semibold text-stone-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
      >
        ← Back to clips
      </button>
      <div className="text-[11px] text-stone-500">Duration {clip.duration}</div>
    </div>
  </div>
);

export default CameraModal;
