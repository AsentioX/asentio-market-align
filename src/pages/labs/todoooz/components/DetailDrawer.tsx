import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CornerDownRight,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Folder,
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
    addTask: (projectId: string, title: string, due?: string | null) => void;
    updateTask: (id: string, patch: Partial<TdzTask>) => void;
    deleteTask: (id: string) => void;
    addActivity: (projectId: string, summary: string, detail?: string) => void;
    addStakeholder: (projectId: string, payload: Partial<TdzStakeholder>) => void;
    linkContactToCard: (projectId: string, contact: TdzContact, role?: string | null) => void;
    openContacts: () => void;
    removeStakeholder: (id: string) => void;
    addDocument: (projectId: string, url: string, title: string, type: string, taskId?: string | null) => void;
    updateDocument: (id: string, patch: Partial<TdzDocument>) => void;
    removeDocument: (id: string) => void;
    spawnCard: (task: TdzTask) => void;
    openCard: (id: string) => void;
    deleteCard: (id: string) => void;
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

  const theme = card ? resolveTheme(card, parent) : null;
  const linkedEvents = useMemo(
    () => (card ? events.filter((e) => e.project_id === card.id) : []),
    [card, events],
  );
  if (!card) return null;

  const tags = (card.context_label ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const setTags = (next: string[]) =>
    api.patchCard(card.id, { context_label: next.length ? next.join(', ') : null });

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

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
              {activities.map((a) => (
                <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span className="uppercase tracking-wide">{a.source}</span>
                    <span>{new Date(a.occurred_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-sm text-white/85">{a.summary}</div>
                  {a.detail && <p className="mt-1 whitespace-pre-wrap text-xs text-white/50">{a.detail}</p>}
                </div>
              ))}
              {activities.length === 0 && <p className="text-xs text-white/40">Nothing captured yet.</p>}
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
                      <div className="text-[11px] text-white/45">{s.role ?? '—'}</div>
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
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => api.toggleTask(t)}
                    className="h-4 w-4 accent-[hsl(var(--tdz-accent))]"
                  />
                  <span className={`flex-1 truncate text-sm ${t.done ? 'text-white/35 line-through' : 'text-white/85'}`}>
                    {t.title}
                  </span>
                  <input
                    type="date"
                    value={t.due_date ? t.due_date.slice(0, 10) : ''}
                    onChange={(e) =>
                      api.updateTask(t.id, { due_date: e.target.value ? new Date(e.target.value).toISOString() : null })
                    }
                    className="rounded border border-white/10 bg-transparent px-1 text-[10px] text-white/60"
                  />
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
                </li>
              ))}
              {tasks.length === 0 && <li className="text-xs text-white/40">No tasks yet.</li>}
            </ul>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Mode</div>
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
            </div>
            <TagEditor value={tags} onChange={setTags} />

            <Textarea
              value={card.description ?? ''}
              onChange={(e) => api.patchCard(card.id, { description: e.target.value })}
              placeholder="Notes"
              className="min-h-[90px] border-white/10 bg-white/5 text-sm"
            />
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Linked documents</div>
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
            </div>

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
            <label className="block text-xs text-white/50">
              Due date
              <input
                type="date"
                value={card.due_date ? card.due_date.slice(0, 10) : ''}
                onChange={(e) =>
                  api.patchCard(card.id, { due_date: e.target.value ? new Date(e.target.value).toISOString() : null })
                }
                className="mt-1 block w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
              />
            </label>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Linked events</div>
            {linkedEvents.length === 0 && <p className="text-xs text-white/40">No calendar events linked.</p>}
            {linkedEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs">
                <CalendarDays className="h-4 w-4 text-white/40" />
                <span className="flex-1 truncate text-white/80">{e.title}</span>
                <span className="text-white/40">{new Date(e.starts_at).toLocaleString()}</span>
              </div>
            ))}
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60">
              Checkpoints: {tasks.filter((t) => t.due_date).length} dated task
              {tasks.filter((t) => t.due_date).length === 1 ? '' : 's'} · {done}/{tasks.length} complete
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default DetailDrawer;
