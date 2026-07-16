import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, CheckCircle2, Circle, Share2, Users } from 'lucide-react';
import { ALL_EVENTS, CATEGORY_META, ROLE_LABELS } from '../data/schedule';
import { useNow } from '../lib/useNow';
import { useCompleted } from '../lib/usePrefs';
import { computeCountdown, eventStart, formatCountdown, formatTime } from '../lib/time';
import { CountdownDisplay } from '../components/CountdownDisplay';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const now = useNow(1000);
  const { completed, toggle } = useCompleted();

  const event = ALL_EVENTS.find(e => e.id === id);
  if (!event) {
    return (
      <div className="p-6 pt-24 text-center text-white/60">
        Event not found.
        <button onClick={() => navigate(-1)} className="ml-2 text-orange-300 underline">Go back</button>
      </div>
    );
  }

  const meta = CATEGORY_META[event.category];
  const cd = computeCountdown(eventStart(event), now);
  const isDone = completed.has(event.id);
  const dest = event.address ?? event.location;

  const openMaps = (mode: 'google' | 'apple') => {
    if (!dest) return;
    const q = encodeURIComponent(dest);
    const url = mode === 'apple' ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
    window.open(url, '_blank');
  };

  const share = async () => {
    const text = `${event.title} — ${formatTime(event.start)}${dest ? ` @ ${dest}` : ''}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text }); return; } catch {}
    }
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      <div className="sticky top-0 z-10 backdrop-blur-2xl bg-black/40 border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={share} className="p-2 -mr-2 text-white/80 hover:text-white">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-5 pt-4 pb-8"
      >
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest bg-gradient-to-br ${meta.gradient} text-black`}>
          {meta.icon} {meta.label}
        </div>
        {event.required && (
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest px-1.5 py-1 rounded-md bg-red-500/20 text-red-300 ring-1 ring-red-500/40">
            Required
          </span>
        )}
        <h1 className="mt-3 text-3xl font-black tracking-tight leading-tight">{event.title}</h1>
        <div className="mt-1 text-white/60 text-sm">
          {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {formatTime(event.start)}
          {event.end && ` – ${formatTime(event.end)}`}
        </div>

        {!cd.past && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
            <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Starts in</div>
            <CountdownDisplay cd={cd} />
          </div>
        )}
        {cd.past && (
          <div className="mt-5 text-emerald-300 text-sm font-semibold">
            Started {formatCountdown(cd, true)} ago
          </div>
        )}

        {dest && (
          <div className="mt-5">
            <div className="text-white/50 text-xs font-bold uppercase tracking-widest">Location</div>
            <div className="mt-1 flex items-start gap-2 text-white">
              <MapPin className="w-4 h-4 mt-1 text-orange-300 shrink-0" />
              <div>
                {event.location && <div className="font-semibold">{event.location}</div>}
                {event.address && <div className="text-white/60 text-sm">{event.address}</div>}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => openMaps('apple')}
                className="rounded-2xl bg-white/5 border border-white/10 py-3 text-sm font-semibold text-white/90 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4" /> Apple Maps
              </button>
              <button
                onClick={() => openMaps('google')}
                className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 py-3 text-sm font-bold text-black active:scale-[0.98] transition flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4" /> Google Maps
              </button>
            </div>
          </div>
        )}

        {event.notes && (
          <div className="mt-6">
            <div className="text-white/50 text-xs font-bold uppercase tracking-widest">Notes</div>
            <p className="mt-1.5 text-white/80 text-sm leading-relaxed">{event.notes}</p>
          </div>
        )}

        {event.checklist && event.checklist.length > 0 && (
          <div className="mt-6">
            <div className="text-white/50 text-xs font-bold uppercase tracking-widest">Bring / Checklist</div>
            <ul className="mt-2 space-y-1.5">
              {event.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/85">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <div className="text-white/50 text-xs font-bold uppercase tracking-widest">Who</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {event.roles.map(r => (
              <span key={r} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
                <Users className="w-3 h-3" /> {ROLE_LABELS[r]}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => toggle(event.id)}
          className={`mt-8 w-full rounded-2xl py-4 font-bold text-sm active:scale-[0.98] transition flex items-center justify-center gap-2 ${
            isDone
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
              : 'bg-white text-black'
          }`}
        >
          {isDone ? <><CheckCircle2 className="w-4 h-4" /> Completed</> : <><Circle className="w-4 h-4" /> Mark Complete</>}
        </button>
      </motion.div>
    </div>
  );
};

export default EventDetail;
