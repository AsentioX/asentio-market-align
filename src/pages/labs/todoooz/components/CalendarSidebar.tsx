import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TdzCard, TdzEvent, TdzTask } from '../lib/types';
import { resolveTheme } from '../lib/theme';

interface Props {
  events: TdzEvent[];
  cardById: Map<string, TdzCard>;
  cards?: TdzCard[];
  tasks?: TdzTask[];
  collapsed: boolean;
  onToggle: () => void;
  onUpdateEvent?: (id: string, patch: Partial<TdzEvent>) => Promise<void> | void;
  onDeleteEvent?: (id: string) => Promise<void> | void;
  onOpenCard?: (id: string) => void;
  onSpawnCard?: (event: TdzEvent) => void;
  /** Import a date window from Google (used for back-scroll and month jumps). */
  onLoadRange?: (from: Date, to: Date) => Promise<number | void> | void;
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;



const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/** yyyy-MM-ddTHH:mm in local time, for <input type="datetime-local"> */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CalendarSidebar: React.FC<Props> = ({
  events,
  cardById,
  cards = [],
  tasks = [],
  collapsed,
  onToggle,
  onUpdateEvent,
  onDeleteEvent,
  onOpenCard,
  onSpawnCard,
  onLoadRange,
}) => {

  const [view, setView] = useState<'agenda' | 'time'>('agenda');
  const [monthOpen, setMonthOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [loadingRange, setLoadingRange] = useState(false);
  const loadedMonths = useRef(new Set<string>());
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingScrollDay = useRef<string | null>(null);
  const didInitScroll = useRef(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    title: string;
    location: string;
    starts_at: string;
    ends_at: string;
    project_id: string;
    task_id: string;
  }>({
    title: '',
    location: '',
    starts_at: '',
    ends_at: '',
    project_id: '',
    task_id: '',
  });

  const startEdit = (e: TdzEvent) => {
    setEditingId(e.id);
    setDraft({
      title: e.title,
      location: e.location ?? '',
      starts_at: toLocalInput(e.starts_at),
      ends_at: toLocalInput(e.ends_at),
      project_id: e.project_id ?? '',
      task_id: e.task_id ?? '',
    });
  };

  const saveEdit = async () => {
    if (!editingId || !onUpdateEvent) return setEditingId(null);
    await onUpdateEvent(editingId, {
      title: draft.title.trim() || '(no title)',
      location: draft.location.trim() || null,
      starts_at: new Date(draft.starts_at).toISOString(),
      ends_at: new Date(draft.ends_at).toISOString(),
      project_id: draft.project_id || null,
      task_id: draft.project_id ? draft.task_id || null : null,
    });
    setEditingId(null);
  };

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

  const eventsByDay = useMemo(() => {
    const m = new Map<string, number>();
    upcoming.forEach((e) => {
      const k = new Date(e.starts_at).toDateString();
      m.set(k, (m.get(k) ?? 0) + 1);
    });
    return m;
  }, [upcoming]);

  /** Earliest month currently pulled in — anything before this needs an import. */
  const earliestLoaded = useMemo(() => {
    const first = upcoming[0];
    const base = first ? new Date(first.starts_at) : new Date();
    return startOfMonth(base);
  }, [upcoming]);

  const loadMonth = useCallback(
    async (month: Date) => {
      if (!onLoadRange) return;
      const key = monthKey(month);
      if (loadedMonths.current.has(key)) return;
      loadedMonths.current.add(key);
      setLoadingRange(true);
      try {
        await onLoadRange(startOfMonth(month), addMonths(month, 1));
      } finally {
        setLoadingRange(false);
      }
    },
    [onLoadRange],
  );

  /** Pull in earlier events as the user scrolls back through the agenda. */
  const handleScroll = useCallback(async () => {
    const el = scrollRef.current;
    if (!el || view !== 'agenda' || loadingRange || !onLoadRange) return;
    if (el.scrollTop > 60) return;
    const target = addMonths(earliestLoaded, -1);
    if (loadedMonths.current.has(monthKey(target))) return;
    const prevHeight = el.scrollHeight;
    await loadMonth(target);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += scrollRef.current.scrollHeight - prevHeight;
      }
    });
  }, [view, loadingRange, onLoadRange, earliestLoaded, loadMonth]);

  const jumpToDay = useCallback(
    async (day: Date) => {
      setView('agenda');
      const key = day.toDateString();
      const node = dayRefs.current.get(key);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      pendingScrollDay.current = key;
      await loadMonth(startOfMonth(day));
    },
    [loadMonth],
  );

  // After a month import lands, scroll to the day the user picked.
  useEffect(() => {
    const key = pendingScrollDay.current;
    if (!key) return;
    const node = dayRefs.current.get(key);
    if (node) {
      pendingScrollDay.current = null;
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [grouped]);

  /** On first load (refresh) or when events arrive, jump the agenda to today. */
  useEffect(() => {
    if (didInitScroll.current) return;
    if (view !== 'agenda' || grouped.length === 0) return;
    didInitScroll.current = true;
    const todayKey = new Date().toDateString();
    let targetKey = todayKey;
    if (!dayRefs.current.has(todayKey)) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const future = grouped.find(([day]) => new Date(day) >= todayStart);
      targetKey = future ? future[0] : grouped[grouped.length - 1][0];
    }
    const node = dayRefs.current.get(targetKey);
    if (node) node.scrollIntoView({ block: 'start' });
    else pendingScrollDay.current = targetKey;
  }, [grouped, view]);

  const monthGrid = useMemo(() => {
    const first = startOfMonth(monthCursor);
    const lead = first.getDay();
    const days: (Date | null)[] = Array.from({ length: lead }, () => null);
    const total = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= total; i++) days.push(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), i));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [monthCursor]);

  const goMonth = (delta: number) => {
    const next = addMonths(monthCursor, delta);
    setMonthCursor(next);
    void loadMonth(next);
  };

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
    <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-hidden border-l border-white/10">
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

      <div className="border-b border-white/10">
        <button
          onClick={() => setMonthOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] text-white/60 hover:text-white"
        >
          <span className="font-medium">
            {monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          {monthOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {monthOpen && (
          <div className="px-3 pb-2">
            <div className="mb-1 flex items-center justify-between">
              <button
                onClick={() => goMonth(-1)}
                aria-label="Previous month"
                className="rounded p-1 text-white/45 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  const t = startOfMonth(new Date());
                  setMonthCursor(t);
                  void jumpToDay(new Date());
                }}
                className="rounded px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/45 hover:text-white"
              >
                Today
              </button>
              <button
                onClick={() => goMonth(1)}
                aria-label="Next month"
                className="rounded p-1 text-white/45 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-white/30">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>
            <div className="mt-0.5 grid grid-cols-7 gap-0.5">
              {monthGrid.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    onClick={() => jumpToDay(d)}
                    className={cn(
                      'relative flex h-6 items-center justify-center rounded text-[10px] text-white/60 hover:bg-white/10 hover:text-white',
                      sameDay(d, now) && 'bg-white/15 font-semibold text-white',
                    )}
                  >
                    {d.getDate()}
                    {eventsByDay.get(d.toDateString()) ? (
                      <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-sky-400" />
                    ) : null}
                  </button>
                ) : (
                  <div key={i} />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto p-3">
        {view === 'agenda' && onLoadRange && (
          <div className="mb-2 flex items-center justify-center">
            {loadingRange ? (
              <span className="flex items-center gap-1 text-[10px] text-white/40">
                <Loader2 className="h-3 w-3 animate-spin" /> Importing earlier events…
              </span>
            ) : (
              <button
                onClick={() => loadMonth(addMonths(earliestLoaded, -1))}
                className="rounded border border-white/10 px-2 py-0.5 text-[10px] text-white/40 hover:text-white"
              >
                Load earlier events
              </button>
            )}
          </div>
        )}

        {upcoming.length === 0 && (
          <p className="text-xs text-white/40">No events for this mode. Connect a Google account to sync.</p>
        )}

        {view === 'agenda' &&
          grouped.map(([day, list]) => (

            <div
              key={day}
              ref={(el) => {
                if (el) dayRefs.current.set(day, el);
                else dayRefs.current.delete(day);
              }}
              className={cn(
                'mb-4 rounded-lg',
                new Date(day) < new Date(now.getFullYear(), now.getMonth(), now.getDate())
                  ? 'bg-amber-500/[0.04] p-2 opacity-55'
                  : 'p-0',
              )}
            >

              <div className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/35">
                {new Date(day).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div className="space-y-2">
                {list.map((e) => {
                  const project = e.project_id ? cardById.get(e.project_id) : null;
                  return (
                    <div key={e.id} className="group rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                      {editingId === e.id ? (
                        <div className="space-y-1.5">
                          <input
                            value={draft.title}
                            onChange={(ev) => setDraft((d) => ({ ...d, title: ev.target.value }))}
                            placeholder="Event title"
                            className="w-full rounded border border-white/15 bg-black/30 px-2 py-1 text-sm text-white outline-none"
                          />
                          <div className="flex gap-1.5">
                            <input
                              type="datetime-local"
                              value={draft.starts_at}
                              onChange={(ev) => setDraft((d) => ({ ...d, starts_at: ev.target.value }))}
                              className="min-w-0 flex-1 rounded border border-white/15 bg-black/30 px-1.5 py-1 text-[10px] text-white outline-none"
                            />
                            <input
                              type="datetime-local"
                              value={draft.ends_at}
                              onChange={(ev) => setDraft((d) => ({ ...d, ends_at: ev.target.value }))}
                              className="min-w-0 flex-1 rounded border border-white/15 bg-black/30 px-1.5 py-1 text-[10px] text-white outline-none"
                            />
                          </div>
                          <input
                            value={draft.location}
                            onChange={(ev) => setDraft((d) => ({ ...d, location: ev.target.value }))}
                            placeholder="Location"
                            className="w-full rounded border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white outline-none"
                          />
                          <select
                            value={draft.project_id}
                            onChange={(ev) => setDraft((d) => ({ ...d, project_id: ev.target.value, task_id: '' }))}
                            aria-label="Linked card"
                            className="w-full rounded border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white outline-none"
                          >
                            <option value="">No linked card</option>
                            {cards.map((c) => (
                              <option key={c.id} value={c.id} className="bg-neutral-900">
                                {c.title}
                              </option>
                            ))}
                          </select>
                          {draft.project_id && (
                            <select
                              value={draft.task_id}
                              onChange={(ev) => setDraft((d) => ({ ...d, task_id: ev.target.value }))}
                              aria-label="Linked task"
                              className="w-full rounded border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white outline-none"
                            >
                              <option value="">Card level (no specific task)</option>
                              {tasks
                                .filter((t) => t.project_id === draft.project_id)
                                .map((t) => (
                                  <option key={t.id} value={t.id} className="bg-neutral-900">
                                    {t.title}
                                  </option>
                                ))}
                            </select>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={saveEdit}
                              className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-1 text-[10px] text-emerald-200 hover:bg-emerald-500/30"
                            >
                              <Check className="h-3 w-3" /> Save to Google
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-white/50 hover:text-white"
                            >
                              <X className="h-3 w-3" /> Cancel
                            </button>
                            {onDeleteEvent && (
                              <button
                                onClick={async () => {
                                  await onDeleteEvent(e.id);
                                  setEditingId(null);
                                }}
                                className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-[10px] text-rose-300 hover:bg-rose-500/15"
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                      <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm text-white">{e.title}</span>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="text-[10px] text-white/45">{fmt(e.starts_at)}</span>
                          {onUpdateEvent && (
                            <button
                              onClick={() => startEdit(e)}
                              aria-label="Edit event"
                              className="opacity-0 transition group-hover:opacity-100 text-white/40 hover:text-white"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          )}
                        </div>
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
                         {project ? (
                           (() => {
                             const hsl = resolveTheme(
                               project,
                               project.parent_id ? cardById.get(project.parent_id) : null,
                             ).hsl;
                             return (
                               <button
                                 onClick={() => onOpenCard?.(project.id)}
                                 className="rounded border px-1.5 py-0.5 transition-colors"
                                 style={{
                                   color: `hsl(${hsl})`,
                                   borderColor: `hsl(${hsl} / 0.4)`,
                                   background: `hsl(${hsl} / 0.14)`,
                                 }}
                               >
                                 {project.title}
                               </button>
                             );
                           })()
                         ) : (
                          <>
                          {onUpdateEvent && (
                            <button
                              onClick={() => startEdit(e)}
                              className="rounded border border-dashed border-white/15 px-1.5 py-0.5 text-white/40 hover:text-white"
                            >
                              + Link card
                            </button>
                          )}
                          {onSpawnCard && (
                            <button
                              onClick={() => onSpawnCard(e)}
                              className="flex items-center gap-1 rounded border border-dashed border-indigo-300/30 px-1.5 py-0.5 text-indigo-200/70 hover:text-indigo-100"
                            >
                              <Plus className="h-3 w-3" /> New card
                            </button>
                          )}
                          </>
                        )}

                      </div>
                      </>
                      )}
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
