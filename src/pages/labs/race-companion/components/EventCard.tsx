import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { RaceEvent } from '../data/schedule';
import { CATEGORY_META } from '../data/schedule';
import { eventStatus, formatTime, computeCountdown, formatCountdown, eventStart } from '../lib/time';

interface Props {
  event: RaceEvent;
  now: Date;
  completed?: boolean;
  compact?: boolean;
}

export const EventCard = ({ event, now, completed = false, compact = false }: Props) => {
  const status = eventStatus(event, now);
  const meta = CATEGORY_META[event.category];
  const cd = computeCountdown(eventStart(event), now);
  const isPast = status === 'past' || completed;
  const isCurrent = status === 'current';

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isPast ? 0.35 : 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to={`/labs/race-companion/event/${event.id}`}
          className={`group relative block rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-all
            ${isCurrent ? `ring-2 ${meta.ring} ${meta.glow}` : ''}
          `}
        >
          {/* accent gradient bar */}
          <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${meta.gradient}`} />
          {isCurrent && (
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-[0.08]`}
              animate={{ opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <div className={`relative flex items-start gap-3 ${compact ? 'p-4' : 'p-5'}`}>
            <div className={`shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-xl shadow-lg`}>
              <span>{meta.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className={`font-bold tracking-wide ${meta.text}`}>{formatTime(event.start)}</span>
                {event.end && <span className="text-white/30">– {formatTime(event.end)}</span>}
                {event.required && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-300 ring-1 ring-red-500/40">
                    Required
                  </span>
                )}
              </div>
              <h3 className={`mt-1 font-semibold text-white leading-tight ${compact ? 'text-[15px]' : 'text-[17px]'}`}>
                {event.title}
              </h3>
              {event.location || event.address ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/50">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{event.location ?? event.address}</span>
                </div>
              ) : null}

              {isCurrent && (
                <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold ${meta.text}`}>
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-current opacity-70 animate-ping" />
                    <span className="relative rounded-full bg-current w-1.5 h-1.5" />
                  </span>
                  Happening now
                </div>
              )}
              {!isPast && !isCurrent && cd.totalMs > 0 && cd.totalMs < 6 * 3600 * 1000 && (
                <div className="mt-2 text-xs text-white/60">
                  Starts in <span className="font-semibold text-white">{formatCountdown(cd, true)}</span>
                </div>
              )}
            </div>

            {isPast ? (
              <CheckCircle2 className="w-5 h-5 text-white/30 shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white/30 shrink-0 group-hover:text-white/60 transition" />
            )}
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};
