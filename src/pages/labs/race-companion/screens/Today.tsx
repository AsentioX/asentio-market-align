import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SCHEDULE, CATEGORY_META } from '../data/schedule';
import { useNow } from '../lib/useNow';
import { usePrefs, useCompleted } from '../lib/usePrefs';
import {
  activeRaceDate,
  computeCountdown,
  eventStart,
  eventStatus,
  findCurrentEvent,
  findNextEvent,
} from '../lib/time';
import { CountdownDisplay } from '../components/CountdownDisplay';
import { EventCard } from '../components/EventCard';

const Today = () => {
  const now = useNow(1000);
  const { prefs } = usePrefs();
  const { completed } = useCompleted();

  const dates = SCHEDULE.map(d => d.date);
  const activeDate = activeRaceDate(dates, now);
  const day = SCHEDULE.find(d => d.date === activeDate)!;

  const filtered = useMemo(() => {
    const roles = prefs.roles;
    return day.events.filter(e => roles.includes('all') || e.roles.includes('all') || e.roles.some(r => roles.includes(r)));
  }, [day, prefs.roles]);

  const currentEvent = findCurrentEvent(filtered, now);
  const nextEvent = findNextEvent(filtered, now);
  const heroEvent = currentEvent ?? nextEvent;
  const cd = heroEvent ? computeCountdown(eventStart(heroEvent), now) : null;

  const openMaps = (address?: string) => {
    if (!address) return;
    const q = encodeURIComponent(address);
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const url = isIOS ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
    window.open(url, '_blank');
  };

  const dayLabel = day.title ? day.title : day.full;

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      {/* Status pill */}
      <div className="px-5 pt-8 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xl">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-70 animate-ping" />
            <span className="relative rounded-full bg-emerald-400 w-1.5 h-1.5" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Now · {dayLabel}</span>
        </div>
      </div>

      {/* Hero countdown */}
      <div className="px-5 pt-2 pb-6">
        <AnimatePresence mode="wait">
          {heroEvent && cd ? (
            <motion.div
              key={heroEvent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-white/50 text-xs font-bold uppercase tracking-widest">
                {currentEvent ? 'Happening now' : 'Next event'}
              </div>
              <h1 className="mt-1 text-[34px] font-black leading-[1.05] tracking-tight text-white">
                {heroEvent.title}
              </h1>
              <div className={`mt-1 text-sm font-semibold ${CATEGORY_META[heroEvent.category].text}`}>
                {CATEGORY_META[heroEvent.category].icon} {CATEGORY_META[heroEvent.category].label}
                {heroEvent.location ? ` · ${heroEvent.location}` : ''}
              </div>

              <div className="mt-6">
                <CountdownDisplay cd={cd} />
              </div>

              {/* Big navigate button */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => openMaps(heroEvent.address ?? heroEvent.location)}
                  disabled={!heroEvent.address && !heroEvent.location}
                  className="flex-1 group relative overflow-hidden rounded-2xl px-5 py-4 bg-gradient-to-br from-orange-500 to-amber-500 text-black font-bold shadow-[0_12px_40px_-8px_rgba(251,146,60,0.6)] active:scale-[0.98] transition disabled:opacity-40"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5" strokeWidth={2.5} />
                    Navigate
                  </span>
                </button>
                <Link
                  to={`/labs/race-companion/event/${heroEvent.id}`}
                  className="rounded-2xl px-4 py-4 bg-white/5 border border-white/10 backdrop-blur-xl text-white/90 font-semibold active:scale-[0.98] transition flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Details
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="text-white/50 text-sm">No upcoming events today. Enjoy the rest.</div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline */}
      <div className="px-5 pt-2">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-white/90 text-lg font-bold tracking-tight">Timeline</h2>
          <span className="text-white/40 text-xs font-semibold">{day.full}</span>
        </div>
        <div className="space-y-3">
          {filtered.map(e => {
            const status = eventStatus(e, now);
            if (status === 'past' && !completed.has(e.id)) {
              // Auto-fade past events but keep them visible
            }
            return (
              <EventCard key={e.id} event={e} now={now} completed={completed.has(e.id)} />
            );
          })}
          {filtered.length === 0 && (
            <div className="text-white/40 text-sm py-8 text-center">
              No events match your role filters. Adjust in Settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Today;
