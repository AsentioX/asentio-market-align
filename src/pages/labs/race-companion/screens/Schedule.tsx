import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { SCHEDULE, CATEGORY_META, type EventCategory } from '../data/schedule';
import { useNow } from '../lib/useNow';
import { usePrefs, useCompleted } from '../lib/usePrefs';
import { activeRaceDate } from '../lib/time';
import { DayTabs } from '../components/DayTabs';
import { EventCard } from '../components/EventCard';

const CATEGORIES: EventCategory[] = ['race', 'meeting', 'inspection', 'food', 'rest_stop', 'display', 'media', 'ceremony', 'awards', 'travel'];

const Schedule = () => {
  const now = useNow(1000);
  const { prefs } = usePrefs();
  const { completed } = useCompleted();
  const dates = SCHEDULE.map(d => d.date);
  const [active, setActive] = useState(() => activeRaceDate(dates, new Date()));
  const [q, setQ] = useState('');
  const [requiredOnly, setRequiredOnly] = useState(false);
  const [cats, setCats] = useState<Set<EventCategory>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const day = SCHEDULE.find(d => d.date === active)!;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return day.events.filter(e => {
      const roleOk = prefs.roles.includes('all') || e.roles.includes('all') || e.roles.some(r => prefs.roles.includes(r));
      if (!roleOk) return false;
      if (requiredOnly && !e.required) return false;
      if (cats.size && !cats.has(e.category)) return false;
      if (term) {
        const hay = `${e.title} ${e.location ?? ''} ${e.address ?? ''} ${e.notes ?? ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [day, q, requiredOnly, cats, prefs.roles]);

  const toggleCat = (c: EventCategory) =>
    setCats(prev => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      <div className="px-5 pt-8 pb-4">
        <div className="text-white/50 text-xs font-bold uppercase tracking-widest">Mission Timeline</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Schedule</h1>
      </div>

      <DayTabs activeDate={active} onChange={setActive} />

      <div className="px-4 mt-4 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search events, places, notes…"
            className="w-full rounded-2xl bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/40 backdrop-blur-xl"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold backdrop-blur-xl transition ${
            showFilters || cats.size || requiredOnly
              ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
              : 'bg-white/5 border-white/10 text-white/70'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 overflow-hidden"
          >
            <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setRequiredOnly(v => !v)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                    requiredOnly ? 'bg-red-500/30 text-red-200 ring-1 ring-red-500/40' : 'bg-white/5 text-white/60'
                  }`}
                >
                  Required only
                </button>
                {(cats.size > 0 || requiredOnly) && (
                  <button
                    onClick={() => { setCats(new Set()); setRequiredOnly(false); }}
                    className="text-xs text-white/50 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => {
                  const m = CATEGORY_META[c];
                  const on = cats.has(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCat(c)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition ${
                        on ? `bg-gradient-to-br ${m.gradient} text-black` : 'bg-white/5 text-white/60'
                      }`}
                    >
                      {m.icon} {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="px-4 mt-4 space-y-3"
        >
          {day.title && (
            <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center`}>
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{day.full}</div>
              <div className="mt-0.5 text-white font-bold">{day.title}</div>
            </div>
          )}
          {filtered.map(e => (
            <EventCard key={e.id} event={e} now={now} completed={completed.has(e.id)} />
          ))}
          {filtered.length === 0 && (
            <div className="text-white/40 text-sm py-10 text-center">No events match your filters.</div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Schedule;
