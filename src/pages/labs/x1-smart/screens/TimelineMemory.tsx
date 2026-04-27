import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Filter as FilterIcon, Brain, User, Eye } from 'lucide-react';
import { RES_FEED, RES_INSIGHTS, RES_PEOPLE, RES_SPACES, type ResFeedEvent } from '../residentialData';
import { COM_FEED, COM_INSIGHTS, COM_PEOPLE, COM_SPACES, type ComFeedEvent } from '../commercialData';

type AnyEvent = ResFeedEvent | ComFeedEvent;

interface Props {
  appMode: 'aihome' | 'aispaces';
}

type RowType = 'ai-action' | 'user-action' | 'observation';

const TYPE_META: Record<RowType, { dot: string; ring: string; pill: string; label: string; icon: any }> = {
  'ai-action':    { dot: 'bg-violet-500', ring: 'ring-violet-200', pill: 'bg-violet-50 text-violet-700 border-violet-200', label: 'AI action', icon: Brain },
  'user-action':  { dot: 'bg-indigo-500', ring: 'ring-indigo-200', pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'You',       icon: User  },
  'observation':  { dot: 'bg-stone-400',  ring: 'ring-stone-200',  pill: 'bg-stone-100 text-stone-600 border-stone-200',  label: 'Observed',  icon: Eye   },
};

const FILTER_TYPES: { value: 'all' | RowType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ai-action', label: 'AI actions' },
  { value: 'user-action', label: 'You' },
  { value: 'observation', label: 'Observations' },
];

const classifyEvent = (e: AnyEvent): RowType => {
  if (e.actor === 'user') return 'user-action';
  if (e.actor === 'ai') return 'ai-action';
  if (e.kind === 'action' || e.kind === 'suggestion') return 'ai-action';
  return 'observation';
};

// crude bucketing for prototype
const bucketOf = (timestamp: string): 'Now' | 'Today' | 'Earlier today' | 'Yesterday' => {
  const t = timestamp.toLowerCase();
  if (t.includes('now') || t.includes('min')) return 'Now';
  if (t.includes('hr') || t.includes('hour')) return 'Earlier today';
  if (t.includes('yesterday')) return 'Yesterday';
  return 'Today';
};

const TimelineMemory = ({ appMode }: Props) => {
  const events: AnyEvent[] = appMode === 'aihome' ? RES_FEED : COM_FEED;
  const insights = appMode === 'aihome' ? RES_INSIGHTS : COM_INSIGHTS;
  const peopleList = appMode === 'aihome' ? RES_PEOPLE : COM_PEOPLE;
  const spaceList = appMode === 'aihome' ? RES_SPACES : COM_SPACES;

  const [typeFilter, setTypeFilter] = useState<'all' | RowType>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [spaceFilter, setSpaceFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== 'all' && classifyEvent(e) !== typeFilter) return false;
      if (personFilter !== 'all' && e.personId !== personFilter) return false;
      if (spaceFilter !== 'all' && e.spaceId !== spaceFilter) return false;
      return true;
    });
  }, [events, typeFilter, personFilter, spaceFilter]);

  // group by bucket label, preserving order
  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, AnyEvent[]>();
    filtered.forEach((e) => {
      const b = bucketOf(e.timestamp);
      if (!map.has(b)) {
        order.push(b);
        map.set(b, []);
      }
      map.get(b)!.push(e);
    });
    return { order, map };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Memory · timeline</h2>
        <p className="text-[17px] text-stone-700 leading-snug">
          A chronological record of what happened, what X1 decided, and what it learned —{' '}
          <span className="text-stone-900 font-semibold">across people, spaces, and time</span>.
        </p>
      </div>

      {/* Pinned insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.slice(0, 2).map((ins) => {
          const Trend = ins.trend === 'down' ? TrendingDown : TrendingUp;
          const trendCls = ins.trend === 'up' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
          return (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl bg-white border border-violet-100 p-4 overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/40 to-fuchsia-100/30 rounded-full blur-2xl -translate-y-10 translate-x-8" />
              <div className="relative flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-violet-700">Insight</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${trendCls}`}>
                      <Trend className="w-2.5 h-2.5" /> {ins.metric}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-stone-900 mt-1 leading-snug">{ins.headline}</h3>
                  <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">{ins.detail}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm space-y-2">
        <FilterRow label="Type" icon={FilterIcon}>
          {FILTER_TYPES.map((opt) => (
            <Chip key={opt.value} active={typeFilter === opt.value} onClick={() => setTypeFilter(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Person">
          <Chip active={personFilter === 'all'} onClick={() => setPersonFilter('all')}>All</Chip>
          {peopleList.map((p) => (
            <Chip key={p.id} active={personFilter === p.id} onClick={() => setPersonFilter(p.id)}>
              {p.name}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Space">
          <Chip active={spaceFilter === 'all'} onClick={() => setSpaceFilter('all')}>All</Chip>
          {spaceList.map((s) => (
            <Chip key={s.id} active={spaceFilter === s.id} onClick={() => setSpaceFilter(s.id)}>
              {s.name.split('·')[0].trim()}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {/* Timeline rail */}
      <div className="relative">
        {/* vertical rail */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-stone-200" />

        <div className="space-y-8">
          {grouped.order.map((bucket) => (
            <div key={bucket}>
              <div className="flex items-center gap-3 mb-3 pl-10">
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold">{bucket}</span>
                <span className="h-px flex-1 bg-stone-200" />
              </div>
              <div className="space-y-2.5">
                {grouped.map.get(bucket)!.map((e, i) => {
                  const t = classifyEvent(e);
                  const m = TYPE_META[t];
                  const Icon = m.icon;
                  const person = e.personId ? peopleList.find((p) => p.id === e.personId) : undefined;
                  const space = e.spaceId ? spaceList.find((s) => s.id === e.spaceId) : undefined;

                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.2) }}
                      className="relative pl-10"
                    >
                      {/* dot */}
                      <span className={`absolute left-[14px] top-3 w-2.5 h-2.5 rounded-full ${m.dot} ring-4 ring-white shadow`} />
                      <div className="rounded-xl bg-white border border-black/[0.06] hover:border-black/12 p-3 transition-colors shadow-sm">
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-500">
                          <span className="font-medium text-stone-700">{e.timestamp}</span>
                          <span className="text-stone-300">·</span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border font-semibold ${m.pill}`}>
                            <Icon className="w-2.5 h-2.5" />
                            {m.label}
                          </span>
                          {person && (
                            <>
                              <span className="text-stone-300">·</span>
                              <span>{person.name}</span>
                            </>
                          )}
                          {space && (
                            <>
                              <span className="text-stone-300">·</span>
                              <span>{space.name.split('·')[0].trim()}</span>
                            </>
                          )}
                        </div>
                        <div className="text-[14px] font-semibold text-stone-900 mt-1.5 leading-snug">{e.title}</div>
                        {e.whyItMatters && (
                          <div className="text-[12px] text-stone-600 mt-1 italic leading-relaxed">
                            <span className="text-violet-600 font-semibold not-italic">Why it mattered: </span>
                            {e.whyItMatters}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="pl-10 text-sm text-stone-500 italic">No events match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterRow = ({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-stone-500 font-bold w-16">
      {Icon && <Icon className="w-3 h-3" />} {label}
    </div>
    <div className="flex flex-wrap gap-1">{children}</div>
  </div>
);

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
      active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
    }`}
  >
    {children}
  </button>
);

export default TimelineMemory;
