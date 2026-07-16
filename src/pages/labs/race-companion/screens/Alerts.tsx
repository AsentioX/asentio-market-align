import { useMemo } from 'react';
import { Bell, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ALL_EVENTS, CATEGORY_META } from '../data/schedule';
import { useNow } from '../lib/useNow';
import { usePrefs } from '../lib/usePrefs';
import { computeCountdown, eventStart, formatCountdown, formatTime } from '../lib/time';
import { Link } from 'react-router-dom';

const Alerts = () => {
  const now = useNow(1000);
  const { prefs } = usePrefs();

  const upcoming = useMemo(() => {
    const roles = prefs.roles;
    return ALL_EVENTS
      .filter(e => {
        const roleOk = roles.includes('all') || e.roles.includes('all') || e.roles.some(r => roles.includes(r));
        if (!roleOk) return false;
        return eventStart(e).getTime() > now.getTime();
      })
      .sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime())
      .slice(0, 20);
  }, [prefs.roles, now]);

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      <div className="px-5 pt-8 pb-3">
        <div className="text-white/50 text-xs font-bold uppercase tracking-widest">Reminders</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Alerts</h1>
        <p className="mt-1 text-sm text-white/50">Reminders {prefs.reminderMinutes} min before each event.</p>
      </div>

      <div className="px-4 space-y-3">
        {upcoming.map((e, idx) => {
          const cd = computeCountdown(eventStart(e), now);
          const meta = CATEGORY_META[e.category];
          const leadCd = computeCountdown(new Date(eventStart(e).getTime() - prefs.reminderMinutes * 60_000), now);
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Link
                to={`/labs/race-companion/event/${e.id}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                    <Bell className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/50 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(e.start)} · {new Date(e.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="font-semibold text-white mt-0.5 truncate">{e.title}</div>
                    <div className={`mt-1 text-xs font-semibold ${meta.text}`}>
                      Alert in {formatCountdown(leadCd.past ? cd : leadCd, true)}
                      {leadCd.past && ' (starts soon)'}
                    </div>
                  </div>
                  {e.required && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-300 ring-1 ring-red-500/40">
                      Req
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
        {upcoming.length === 0 && (
          <div className="text-white/40 text-sm py-12 text-center">No upcoming alerts.</div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
