import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TdzCard, TdzEvent } from '../lib/types';

interface Props {
  events: TdzEvent[];
  cardById: Map<string, TdzCard>;
  collapsed: boolean;
  onToggle: () => void;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const CalendarSidebar: React.FC<Props> = ({ events, cardById, collapsed, onToggle }) => {
  const [view, setView] = useState<'agenda' | 'time'>('agenda');
  const now = new Date();

  const upcoming = useMemo(
    () => [...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    [events],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, TdzEvent[]>();
    upcoming.forEach((e) => {
      const key = new Date(e.starts_at).toDateString();
      map.set(key, [...(map.get(key) ?? []), e]);
    });
    return [...map.entries()];
  }, [upcoming]);

  const nowPct = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        aria-label="Show calendar"
        className="flex w-10 shrink-0 flex-col items-center gap-2 border-l border-white/10 py-4 text-white/50 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        <CalendarDays className="h-4 w-4" />
      </button>
    );
  }

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <CalendarDays className="h-4 w-4" /> Calendar
        </div>
        <div className="flex items-center gap-1">
          <div className="flex rounded-md border border-white/10 p-0.5 text-[10px]">
            {(['agenda', 'time'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn('rounded px-2 py-0.5 capitalize', view === v ? 'bg-white/15 text-white' : 'text-white/45')}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={onToggle} aria-label="Hide calendar" className="p-1 text-white/40 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {upcoming.length === 0 && (
          <p className="text-xs text-white/40">No events for this mode. Connect a Google account to sync.</p>
        )}

        {view === 'agenda' &&
          grouped.map(([day, list]) => (
            <div key={day} className="mb-4">
              <div className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/35">
                {new Date(day).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div className="space-y-2">
                {list.map((e) => {
                  const project = e.project_id ? cardById.get(e.project_id) : null;
                  return (
                    <div key={e.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm text-white">{e.title}</span>
                        <span className="shrink-0 text-[10px] text-white/45">{fmt(e.starts_at)}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-white/45">
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 capitalize">{e.account_slot}</span>
                        {e.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {e.location}
                          </span>
                        )}
                        {e.meeting_link && (
                          <a
                            href={e.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-sky-300 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Join
                          </a>
                        )}
                        {project && <span className="rounded bg-white/10 px-1.5 py-0.5">{project.title}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {view === 'time' && (
          <div className="relative h-[960px] rounded-lg border border-white/10 bg-white/[0.02]">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="absolute left-0 right-0 border-t border-white/5" style={{ top: `${(h / 24) * 100}%` }}>
                <span className="absolute -top-2 left-1 text-[9px] text-white/25">{h}:00</span>
              </div>
            ))}
            <div className="absolute left-0 right-0 z-10 border-t border-rose-500" style={{ top: `${nowPct}%` }}>
              <span className="absolute -top-2 right-1 rounded bg-rose-500 px-1 text-[9px] text-white">now</span>
            </div>
            {upcoming
              .filter((e) => new Date(e.starts_at).toDateString() === now.toDateString())
              .map((e) => {
                const s = new Date(e.starts_at);
                const en = new Date(e.ends_at);
                const top = ((s.getHours() * 60 + s.getMinutes()) / 1440) * 100;
                const height = Math.max(2.2, ((en.getTime() - s.getTime()) / 60000 / 1440) * 100);
                return (
                  <div
                    key={e.id}
                    className="absolute left-10 right-2 overflow-hidden rounded-md border border-sky-400/40 bg-sky-400/15 px-2 py-1 text-[10px] text-white"
                    style={{ top: `${top}%`, height: `${height}%` }}
                  >
                    <div className="truncate font-medium">{e.title}</div>
                    <div className="text-white/50">{fmt(e.starts_at)}</div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default CalendarSidebar;
