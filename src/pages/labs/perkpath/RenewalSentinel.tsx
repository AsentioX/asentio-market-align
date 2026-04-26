import { CalendarDays, AlertCircle } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import type { Membership } from '@/hooks/usePerkPath';

interface Props { memberships: Membership[] }

const RenewalSentinel = ({ memberships }: Props) => {
  const upcoming = memberships
    .filter(m => m.renewal_date)
    .map(m => ({ ...m, days: differenceInDays(parseISO(m.renewal_date as string), new Date()) }))
    .filter(m => m.days <= 180)
    .sort((a, b) => a.days - b.days)
    .slice(0, 4);

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
          const urgent = m.days <= 30;
          return (
            <div key={m.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RenewalSentinel;
