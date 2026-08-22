import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CornerDownRight,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Folder,
  GripVertical,
  Plus,
  Presentation,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ColorSwatchRow from './ColorSwatchRow';
import TagEditor from './TagEditor';
import CollapsibleSection from './CollapsibleSection';

import { resolveTheme } from '../lib/theme';
import type {
  TdzActivity,
  TdzCard,
  TdzDocument,
  TdzEvent,
  TdzContact,
  TdzStakeholder,
  TdzTask,
} from '../lib/types';
import { flattenTaskTree } from '../lib/taskTree';

export const TAB_KEYS = ['said', 'people', 'tasks', 'overview', 'schedule'] as const;
export type TabKey = (typeof TAB_KEYS)[number];

const detectDocType = (url: string) => {
  if (url.includes('/document/')) return 'doc';
  if (url.includes('/spreadsheets/')) return 'sheet';
  if (url.includes('/presentation/')) return 'slide';
  if (url.includes('drive.google.com')) return 'drive';
  return 'other';
};

const docIcon = (type: string) => {
  if (type === 'sheet') return <FileSpreadsheet className="h-4 w-4 text-emerald-300" />;
  if (type === 'slide') return <Presentation className="h-4 w-4 text-amber-300" />;
  if (type === 'drive') return <Folder className="h-4 w-4 text-sky-300" />;
  return <FileText className="h-4 w-4 text-indigo-300" />;
};

interface Props {
  card: TdzCard | null;
  parent: TdzCard | null;
  children: TdzCard[];
  allCards: TdzCard[];
  tasks: TdzTask[];
  activities: TdzActivity[];
  stakeholders: TdzStakeholder[];
  documents: TdzDocument[];
  events: TdzEvent[];
  contacts: TdzContact[];
  tab: TabKey;
  onTab: (t: TabKey) => void;
  onClose: () => void;
  api: {
    patchCard: (id: string, patch: Partial<TdzCard>) => void;
    toggleTask: (task: TdzTask) => void;
    addTask: (projectId: string, title: string, due?: string | null, parentTaskId?: string | null) => void;
    updateTask: (id: string, patch: Partial<TdzTask>) => void;
    deleteTask: (id: string) => void;
    reorderTasks: (projectId: string, ordered: TdzTask[], movedId?: string) => void;
    addActivity: (projectId: string, summary: string, detail?: string) => void;
    addStakeholder: (projectId: string, payload: Partial<TdzStakeholder>) => void;
    linkContactToCard: (
      projectId: string,
      contact: TdzContact,
      role?: string | null,
      taskId?: string | null,
    ) => void;
    linkContactToTask: (task: TdzTask, contact: TdzContact, role?: string | null) => void;
    openContacts: () => void;
    removeStakeholder: (id: string) => void;
    addDocument: (projectId: string, url: string, title: string, type: string, taskId?: string | null) => void;
    updateDocument: (id: string, patch: Partial<TdzDocument>) => void;
    removeDocument: (id: string) => void;
    spawnCard: (task: TdzTask) => void;
    openCard: (id: string) => void;
    deleteCard: (id: string) => void;
    updateEvent: (id: string, patch: Partial<TdzEvent>) => void;

  };
}

const DetailDrawer: React.FC<Props> = ({
  card,
  parent,
  children,
  allCards,
  tasks,
  activities,
  stakeholders,
  documents,
  events,
  contacts,
  tab,
  onTab,
  onClose,
  api,
}) => {
  const [note, setNote] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('');
  const [contactQuery, setContactQuery] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [subtaskFor, setSubtaskFor] = useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [taskContactQuery, setTaskContactQuery] = useState('');

  const theme = card ? resolveTheme(card, parent) : null;
  const linkedEvents = useMemo(
    () => (card ? events.filter((e) => e.project_id === card.id) : []),
    [card, events],
  );
  const linkableEvents = useMemo(
    () =>
      events
        .filter((e) => !e.project_id)
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
        .slice(0, 100),
    [events],
  );
  /** Activities + linked calendar events merged into one reverse-chronological feed. */
  const timelineEntries = useMemo(() => {
    const items: (
      | { kind: 'activity'; id: string; at: string; activity: TdzActivity }
      | { kind: 'event'; id: string; at: string; event: TdzEvent }
    )[] = [
      ...activities.map((a) => ({ kind: 'activity' as const, id: `a-${a.id}`, at: a.occurred_at, activity: a })),
      ...linkedEvents.map((e) => ({ kind: 'event' as const, id: `e-${e.id}`, at: e.starts_at, event: e })),
    ];
    return items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  }, [activities, linkedEvents]);


  if (!card) return null;

  const tags = (card.context_label ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const setTags = (next: string[]) =>
    api.patchCard(card.id, { context_label: next.length ? next.join(', ') : null });

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const orderedTasks = flattenTaskTree(tasks);

  /** Move the dragged task (and its children, when it is a root) before the drop target. */
  const dropOn = (targetId: string) => {
    setOverId(null);
    const sourceId = dragId;
    setDragId(null);
    if (!sourceId || sourceId === targetId) return;

    const flat = orderedTasks.map((f) => f.task);
    const source = flat.find((t) => t.id === sourceId);
    const target = flat.find((t) => t.id === targetId);
    if (!source || !target) return;
    // Children only reorder among their own siblings.
    if ((source.parent_task_id ?? null) !== (target.parent_task_id ?? null)) return;

    const block = flat.filter((t) => t.id === sourceId || t.parent_task_id === sourceId);
    const blockIds = new Set(block.map((t) => t.id));
    const rest = flat.filter((t) => !blockIds.has(t.id));
    const targetIndex = rest.findIndex((t) => t.id === targetId);
    if (targetIndex < 0) return;
    const next = [...rest.slice(0, targetIndex), ...block, ...rest.slice(targetIndex)];
    api.reorderTasks(card.id, next, sourceId);
  };

  /** Move a task up/down among its own siblings (children travel with a root). */
  const siblingsOf = (t: TdzTask) =>
    orderedTasks
      .map((f) => f.task)
      .filter((x) => (x.parent_task_id ?? null) === (t.parent_task_id ?? null));

  const moveTask = (t: TdzTask, dir: -1 | 1) => {
    const flat = orderedTasks.map((f) => f.task);
    const sibs = siblingsOf(t);
    const i = sibs.findIndex((x) => x.id === t.id);
    const neighbour = sibs[i + dir];
    if (!neighbour) return;

    const block = flat.filter((x) => x.id === t.id || x.parent_task_id === t.id);
    const blockIds = new Set(block.map((x) => x.id));
    const rest = flat.filter((x) => !blockIds.has(x.id));

    let insertAt: number;
    if (dir === -1) {
      insertAt = rest.findIndex((x) => x.id === neighbour.id);
    } else {
      const nBlock = rest.filter((x) => x.id === neighbour.id || x.parent_task_id === neighbour.id);
      const last = nBlock[nBlock.length - 1];
      insertAt = rest.findIndex((x) => x.id === last.id) + 1;
    }
    if (insertAt < 0) return;
    const next = [...rest.slice(0, insertAt), ...block, ...rest.slice(insertAt)];
    api.reorderTasks(card.id, next, t.id);
  };


  return (
    <Sheet open={!!card} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-white/10 bg-slate-950/95 text-white backdrop-blur-xl sm:max-w-xl"
        style={theme ? ({ '--tdz-accent': theme.hsl } as React.CSSProperties) : undefined}
      >
        <SheetHeader className="space-y-2 text-left">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={card.parent_id ?? ''}
              onChange={(e) => api.patchCard(card.id, { parent_id: e.target.value || null })}
              className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white"
            >
              <option value="">No parent (top level)</option>
              {allCards
                .filter((c) => c.id !== card.id && !c.parent_id && children.length === 0)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </select>
            {card.parent_id && (
              <Button size="sm" variant="ghost" onClick={() => api.patchCard(card.id, { parent_id: null })}>
                Promote to top level
              </Button>
            )}
          </div>
          <SheetTitle className="text-white">
            <Input
              value={card.title}
              onChange={(e) => api.patchCard(card.id, { title: e.target.value })}
              className="border-none bg-transparent p-0 text-lg font-semibold text-white focus-visible:ring-0"
            />
          </SheetTitle>
          <div className="flex flex-wrap items-center gap-2">
            <ColorSwatchRow
              value={card.color_theme}
              allowInherit={!!parent}
              onChange={(key) => api.patchCard(card.id, { color_theme: key })}
            />
          </div>
          {children.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
              <div className="mb-1 text-[10px] uppercase tracking-wide text-white/40">Sub-task cards</div>
              <ul className="space-y-1">
                {children.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => api.openCard(c.id)}
                      className="flex w-full items-center justify-between text-xs text-white/70 hover:text-white"
                    >
                      <span className="truncate">{c.title}</span>
                      <span className="text-white/35">{c.progress}%</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SheetHeader>

        <Tabs value={tab} onValueChange={(v) => onTab(v as TabKey)} className="mt-4">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 text-[10px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="said">Timeline</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="said" className="space-y-3 pt-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Paste meeting notes (Granola, Otter, plain text)…"
              className="min-h-[100px] border-white/10 bg-white/5 text-sm"
            />
            <Button
              size="sm"
              disabled={!note.trim()}
              onClick={() => {
                const first = note.trim().split('\n')[0].slice(0, 120);
                api.addActivity(card.id, first, note.trim());
                setNote('');
              }}
            >
              Add to timeline
            </Button>
            <div className="space-y-2">
              {timelineEntries.map((entry) =>
                entry.kind === 'activity' ? (
                  <div key={entry.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span className="uppercase tracking-wide">{entry.activity.source}</span>
                      <span>{new Date(entry.at).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 text-sm text-white/85">{entry.activity.summary}</div>
                    {entry.activity.detail && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-white/50">{entry.activity.detail}</p>
                    )}
                  </div>
                ) : (
                  <div
                    key={entry.id}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: 'hsl(var(--tdz-accent) / 0.35)',
                      background: 'hsl(var(--tdz-accent) / 0.08)',
                    }}
                  >
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span className="inline-flex items-center gap-1 uppercase tracking-wide">
                        <CalendarDays className="h-3 w-3" /> Calendar
                      </span>
                      <span>{new Date(entry.at).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 text-sm text-white/85">{entry.event.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
                      {entry.event.location && <span>{entry.event.location}</span>}
                      {entry.event.meeting_link && (
                        <a
                          href={entry.event.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-300 hover:underline"
                        >
                          Join
                        </a>
                      )}
                    </div>
                  </div>
                ),
              )}
              {timelineEntries.length === 0 && <p className="text-xs text-white/40">Nothing captured yet.</p>}
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-3 pt-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-white/40">Link from contacts</span>
                <button onClick={api.openContacts} className="text-[11px] text-indigo-300 hover:text-indigo-200">
                  Manage contacts
                </button>
              </div>
              <Input
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                placeholder="Search your master contacts…"
                className="mt-2 border-white/10 bg-white/5 text-sm"
              />
              {contactQuery.trim() && (
                <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto">
                  {contacts
                    .filter((c) =>
                      [c.name, c.email, c.company, c.job_title]
                        .filter(Boolean)
                        .some((v) => String(v).toLowerCase().includes(contactQuery.trim().toLowerCase())),
                    )
                    .slice(0, 8)
                    .map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => {
                            api.linkContactToCard(card.id, c);
                            setContactQuery('');
                          }}
                          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-white/80 hover:bg-white/10"
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-white/40">
                            {[c.job_title, c.company].filter(Boolean).join(' · ') || c.email}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Name"
                className="border-white/10 bg-white/5"
              />
              <Input
                value={personRole}
                onChange={(e) => setPersonRole(e.target.value)}
                placeholder="Role"
                className="border-white/10 bg-white/5"
              />
              <Button
                size="icon"
                disabled={!personName.trim()}
                onClick={() => {
                  api.addStakeholder(card.id, { name: personName.trim(), role: personRole.trim() || null });
                  setPersonName('');
                  setPersonRole('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {stakeholders.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-white">{s.name}</div>
                      <div className="text-[11px] text-white/45">
                        {s.role ?? '—'}
                        {s.task_id && (
                          <span className="ml-1 rounded bg-white/10 px-1 text-[9px] text-white/55">
                            {tasks.find((t) => t.id === s.task_id)?.title ?? 'task'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => api.removeStakeholder(s.id)} className="text-white/30 hover:text-rose-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {stakeholders.length === 0 && (
                <li className="flex items-center gap-2 text-xs text-white/40">
                  <Users className="h-3.5 w-3.5" /> No stakeholders yet.
                </li>
              )}
            </ul>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-3 pt-4">
            <Progress value={pct} className="h-1.5 bg-white/10" />
            <div className="flex gap-2">
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && taskTitle.trim()) {
                    api.addTask(card.id, taskTitle);
                    setTaskTitle('');
                  }
                }}
                placeholder="Add a task…"
                className="border-white/10 bg-white/5"
              />
              <Button
                size="icon"
                disabled={!taskTitle.trim()}
                onClick={() => {
                  api.addTask(card.id, taskTitle);
                  setTaskTitle('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {orderedTasks.map(({ task: t, depth }) => {
                const taskPeople = stakeholders.filter((s) => s.task_id === t.id);
                const taskEvents = events.filter((e) => e.task_id === t.id);
                const taskDocs = documents.filter((d) => d.task_id === t.id);
                const open = openTaskId === t.id;
                const sibs = siblingsOf(t);
                const sibIndex = sibs.findIndex((x) => x.id === t.id);
                return (
                <li key={t.id} style={{ marginLeft: depth ? 20 : 0 }} className="space-y-1">
                <div
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (overId !== t.id) setOverId(t.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    dropOn(t.id);
                  }}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 transition ${
                    depth
                      ? 'border-white/[0.06] border-l-2 border-l-white/20 bg-white/[0.02]'
                      : 'border-white/10 bg-white/[0.03]'
                  } ${dragId === t.id ? 'opacity-40' : ''} ${
                    overId === t.id && dragId && dragId !== t.id ? 'border-t-2 border-t-[hsl(var(--tdz-accent))]' : ''
                  }`}
                >
                  <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-white/25" />
                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      title="Move up"
                      aria-label="Move up"
                      disabled={sibIndex <= 0}
                      onClick={() => moveTask(t, -1)}
                      className="text-white/30 hover:text-white disabled:opacity-20 disabled:hover:text-white/30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      aria-label="Move down"
                      disabled={sibIndex < 0 || sibIndex >= sibs.length - 1}
                      onClick={() => moveTask(t, 1)}
                      className="text-white/30 hover:text-white disabled:opacity-20 disabled:hover:text-white/30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => api.toggleTask(t)}
                    className="h-4 w-4 accent-[hsl(var(--tdz-accent))]"
                  />

                  <button
                    onClick={() => setOpenTaskId(open ? null : t.id)}
                    className={`flex-1 truncate text-left text-sm ${t.done ? 'text-white/35 line-through' : 'text-white/85'}`}
                  >
                    {t.title}
                  </button>
                  {taskPeople.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded bg-white/10 px-1.5 text-[9px] text-white/60">
                      <Users className="h-3 w-3" />
                      {taskPeople.length}
                    </span>
                  )}
                  {taskEvents.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded bg-white/10 px-1.5 text-[9px] text-white/60">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(taskEvents[0].starts_at).toLocaleDateString()}
                    </span>
                  )}
                  <input
                    type="date"
                    value={t.due_date ? t.due_date.slice(0, 10) : ''}
                    onChange={(e) =>
                      api.updateTask(t.id, { due_date: e.target.value ? new Date(e.target.value).toISOString() : null })
                    }
                    className="rounded border border-white/10 bg-transparent px-1 text-[10px] text-white/60"
                  />
                  {!depth && (
                    <button
                      onClick={() => {
                        setSubtaskFor(subtaskFor === t.id ? null : t.id);
                        setSubtaskTitle('');
                      }}
                      title="Add subtask"
                      className="text-white/35 hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => api.spawnCard(t)}
                    title="Spawn as sub-task card"
                    className="text-white/35 hover:text-white"
                  >
                    <CornerDownRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => api.deleteTask(t.id)} className="text-white/30 hover:text-rose-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {subtaskFor === t.id && (
                  <div className="ml-6 flex gap-2">
                    <Input
                      autoFocus
                      value={subtaskTitle}
                      onChange={(e) => setSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && subtaskTitle.trim()) {
                          api.addTask(card.id, subtaskTitle, null, t.id);
                          setSubtaskTitle('');
                          setSubtaskFor(null);
                        }
                        if (e.key === 'Escape') setSubtaskFor(null);
                      }}
                      placeholder="Subtask title…"
                      className="h-8 border-white/10 bg-white/5 text-xs"
                    />
                    <Button
                      size="sm"
                      disabled={!subtaskTitle.trim()}
                      onClick={() => {
                        api.addTask(card.id, subtaskTitle, null, t.id);
                        setSubtaskTitle('');
                        setSubtaskFor(null);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}

                {open && (
                  <div className="ml-6 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <Input
                      value={t.title}
                      onChange={(e) => api.updateTask(t.id, { title: e.target.value })}
                      className="h-8 border-white/10 bg-white/5 text-sm"
                    />
                    <Textarea
                      defaultValue={t.notes ?? ''}
                      onBlur={(e) => {
                        if ((t.notes ?? '') !== e.target.value) api.updateTask(t.id, { notes: e.target.value || null });
                      }}
                      placeholder="Task notes (synced to Google Tasks)…"
                      className="min-h-[70px] border-white/10 bg-white/5 text-xs"
                    />
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/45">
                      <span>{t.account_slot ? `${t.account_slot} account` : 'local task'}</span>
                      {t.google_task_id ? <span>· synced with Google Tasks</span> : <span>· not yet on Google</span>}
                      {t.completed_at && <span>· completed {new Date(t.completed_at).toLocaleDateString()}</span>}
                    </div>

                    {/* People on this task */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wide text-white/40">People</div>
                      {taskPeople.map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1 text-xs">
                          <span className="truncate text-white/80">
                            {s.name}
                            {s.role && <span className="text-white/40"> · {s.role}</span>}
                          </span>
                          <button onClick={() => api.removeStakeholder(s.id)} className="text-white/30 hover:text-rose-300">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <Input
                        value={taskContactQuery}
                        onChange={(e) => setTaskContactQuery(e.target.value)}
                        placeholder="Search contacts to link…"
                        className="h-8 border-white/10 bg-white/5 text-xs"
                      />
                      {taskContactQuery.trim() && (
                        <ul className="max-h-36 space-y-1 overflow-y-auto">
                          {contacts
                            .filter((c) =>
                              [c.name, c.email, c.company, c.job_title]
                                .filter(Boolean)
                                .some((v) => String(v).toLowerCase().includes(taskContactQuery.trim().toLowerCase())),
                            )
                            .slice(0, 6)
                            .map((c) => (
                              <li key={c.id}>
                                <button
                                  onClick={() => {
                                    api.linkContactToTask(t, c);
                                    setTaskContactQuery('');
                                  }}
                                  className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs text-white/80 hover:bg-white/10"
                                >
                                  <span>{c.name}</span>
                                  <span className="text-[10px] text-white/40">
                                    {[c.job_title, c.company].filter(Boolean).join(' · ') || c.email}
                                  </span>
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>

                    {/* Calendar events on this task */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wide text-white/40">Calendar</div>
                      {taskEvents.map((e) => (
                        <div key={e.id} className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1 text-xs">
                          <span className="truncate text-white/80">
                            {new Date(e.starts_at).toLocaleString()} · {e.title}
                          </span>
                          <button
                            onClick={() => api.updateEvent(e.id, { task_id: null })}
                            className="text-white/30 hover:text-rose-300"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <select
                        value=""
                        aria-label="Link an event to this task"
                        onChange={(ev) => {
                          if (ev.target.value)
                            api.updateEvent(ev.target.value, { task_id: t.id, project_id: card.id });
                        }}
                        className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                      >
                        <option value="">+ Link an event…</option>
                        {events
                          .filter((e) => !e.task_id && (!e.project_id || e.project_id === card.id))
                          .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
                          .slice(0, 60)
                          .map((e) => (
                            <option key={e.id} value={e.id} className="bg-neutral-900">
                              {new Date(e.starts_at).toLocaleDateString()} · {e.title}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Attachments imported from Google */}
                    {taskDocs.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wide text-white/40">Attachments</div>
                        {taskDocs.map((d) => (
                          <a
                            key={d.id}
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-xs text-white/75 hover:bg-white/10"
                          >
                            {docIcon(d.doc_type)}
                            <span className="flex-1 truncate">{d.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-white/40" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                </li>
                );
              })}
              {tasks.length === 0 && <li className="text-xs text-white/40">No tasks yet.</li>}
            </ul>
          </TabsContent>


          <TabsContent value="overview" className="space-y-3 pt-4">
            <CollapsibleSection id="overview-mode" title="Mode & tags">
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
                {(['work', 'personal'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => api.patchCard(card.id, { mode: m })}
                    className={
                      'rounded-md px-3 py-1.5 text-xs capitalize transition ' +
                      (card.mode === m ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white')
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
              <TagEditor value={tags} onChange={setTags} />
            </CollapsibleSection>

            <CollapsibleSection id="overview-notes" title="Notes">
              <Textarea
                value={card.description ?? ''}
                onChange={(e) => api.patchCard(card.id, { description: e.target.value })}
                placeholder="Notes"
                className="min-h-[90px] border-white/10 bg-white/5 text-sm"
              />
            </CollapsibleSection>

            <CollapsibleSection
              id="overview-docs"
              title="Linked documents"
              meta={documents.length || null}
              defaultOpen={false}
            >
              <div className="flex gap-2">
                <Input
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="Paste a Google Docs / Sheets / Slides / Drive link"
                  className="border-white/10 bg-white/5 text-xs"
                />
                <Input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Label"
                  className="w-28 border-white/10 bg-white/5 text-xs"
                />
                <Button
                  size="icon"
                  disabled={!docUrl.trim()}
                  onClick={() => {
                    api.addDocument(
                      card.id,
                      docUrl.trim(),
                      docTitle.trim() || docUrl.trim().replace(/^https?:\/\//, '').slice(0, 40),
                      detectDocType(docUrl),
                    );
                    setDocUrl('');
                    setDocTitle('');
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul className="mt-2 space-y-2">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                    {docIcon(d.doc_type)}
                    <Input
                      value={d.title}
                      onChange={(e) => api.updateDocument(d.id, { title: e.target.value })}
                      className="h-7 flex-1 border-none bg-transparent px-0 text-sm text-white focus-visible:ring-0"
                    />
                    {d.task_id && <span className="rounded bg-white/10 px-1.5 text-[9px] text-white/50">task</span>}
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button onClick={() => api.removeDocument(d.id)} className="text-white/30 hover:text-rose-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {documents.length === 0 && <li className="text-xs text-white/40">No documents linked yet.</li>}
              </ul>
            </CollapsibleSection>

            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => api.deleteCard(card.id)}
                className="w-full border border-rose-500/30 text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-200"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Card
              </Button>
            </div>
          </TabsContent>


          <TabsContent value="schedule" className="space-y-3 pt-4">
            <CollapsibleSection id="schedule-due" title="Due date">
              <input
                type="date"
                value={card.due_date ? card.due_date.slice(0, 10) : ''}
                onChange={(e) =>
                  api.patchCard(card.id, { due_date: e.target.value ? new Date(e.target.value).toISOString() : null })
                }
                className="mt-1 block w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
              />
            </CollapsibleSection>
            <CollapsibleSection id="schedule-events" title="Linked events" meta={linkedEvents.length || null}>
              {linkedEvents.length === 0 && <p className="text-xs text-white/40">No calendar events linked.</p>}
              {linkedEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs">
                  <CalendarDays className="h-4 w-4 text-white/40" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-white/80">{e.title}</div>
                    {e.location && <div className="truncate text-[10px] text-white/40">{e.location}</div>}
                  </div>
                  <span className="shrink-0 text-white/40">{new Date(e.starts_at).toLocaleString()}</span>
                  <button
                    onClick={() => api.updateEvent(e.id, { project_id: null })}
                    aria-label="Unlink event"
                    className="shrink-0 text-white/30 hover:text-rose-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {linkableEvents.length > 0 && (
                <select
                  value=""
                  aria-label="Link an event"
                  onChange={(ev) => {
                    if (ev.target.value) api.updateEvent(ev.target.value, { project_id: card.id });
                  }}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white"
                >
                  <option value="">+ Link an event…</option>
                  {linkableEvents.map((e) => (
                    <option key={e.id} value={e.id} className="bg-neutral-900">
                      {new Date(e.starts_at).toLocaleDateString()} · {e.title}
                    </option>
                  ))}
                </select>
              )}

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60">
                Checkpoints: {tasks.filter((t) => t.due_date).length} dated task
                {tasks.filter((t) => t.due_date).length === 1 ? '' : 's'} · {done}/{tasks.length} complete
              </div>
            </CollapsibleSection>
          </TabsContent>

        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default DetailDrawer;
