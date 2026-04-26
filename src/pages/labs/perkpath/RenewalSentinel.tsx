import { useEffect, useState } from 'react';
import { CalendarDays, AlertCircle, X } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import type { Membership } from '@/hooks/usePerkPath';

interface Props { memberships: Membership[] }

const STORAGE_KEY = 'pp_renewal_dismissed_v1';
// Only nudge at these milestones (days remaining)
const MILESTONES = [30, 7, 1];

interface DismissalMap {
  // key = `${membershipId}:${milestone}` -> dismissed=true
  [key: string]: true;
}

const loadDismissed = (): DismissalMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveDismissed = (m: DismissalMap) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch { /* ignore */ }
};

/** Pick the lowest-but-still-relevant milestone for a given days-remaining value. */
const matchMilestone = (days: number): number | null => {
  if (days <= 1) return 1;
  if (days <= 7) return 7;
  if (days <= 30) return 30;
  return null;
};

const RenewalSentinel = ({ memberships }: Props) => {
  const [dismissed, setDismissed] = useState<DismissalMap>(() => loadDismissed());

  // Reset dismissal when membership list changes (in case a renewal date was updated)
  useEffect(() => { setDismissed(loadDismissed()); }, [memberships.length]);

  const dismiss = (id: string, milestone: number) => {
    const next = { ...dismissed, [`${id}:${milestone}`]: true as const };
    setDismissed(next);
    saveDismissed(next);
  };

  const upcoming = memberships
    .filter(m => m.renewal_date)
    .map(m => {
      const days = differenceInDays(parseISO(m.renewal_date as string), new Date());
      const milestone = matchMilestone(days);
      return { ...m, days, milestone };
    })
    .filter(m => m.milestone !== null && !dismissed[`${m.id}:${m.milestone}`])
    .sort((a, b) => a.days - b.days);

  if (upcoming.length === 0) return null;

  return (
    <div className="px-5 py-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-amber-600" />
          Renewal Sentinel
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">{upcoming.length} upcoming</span>
      </div>
      <div className="rounded-2xl bg-amber-50/60 border border-amber-100 p-3 space-y-2">
        {upcoming.map(m => {
          const urgent = (m.milestone ?? 30) <= 7;
          return (
            <div key={m.id} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-base shrink-0" aria-hidden>{m.logo}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-500">Renews {format(parseISO(m.renewal_date as string), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${
                urgent ? 'bg-rose-600 text-white' : 'bg-white text-amber-700 border border-amber-200'
              }`}>
                {urgent && <AlertCircle className="w-3 h-3" />}
                {m.days <= 0 ? 'Due now' : `${m.days}d`}
              </span>
              <button
                onClick={() => dismiss(m.id, m.milestone as number)}
                aria-label={`Dismiss ${m.name} renewal reminder`}
                className="shrink-0 w-6 h-6 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/70 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RenewalSentinel;
