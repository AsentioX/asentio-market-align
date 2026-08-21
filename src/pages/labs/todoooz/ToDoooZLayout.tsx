import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Briefcase,
  Command,
  Home,
  Layers,
  Loader2,
  LogOut,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import ToDoooZLogin from './ToDoooZLogin';
import SpatialMatrix from './components/SpatialMatrix';
import CalendarSidebar from './components/CalendarSidebar';
import ChiefOfStaff from './components/ChiefOfStaff';
import DetailDrawer, { TAB_KEYS, type TabKey } from './components/DetailDrawer';
import ShortcutOverlay from './components/ShortcutOverlay';
import ContactsCRM from './components/ContactsCRM';
import GoogleAccountsPanel from './components/GoogleAccountsPanel';
import { useToDoooZ } from './lib/useToDoooZ';
import { rememberProviderToken } from './lib/google';

import { useKeyboardNav } from './lib/useKeyboardNav';
import { buildNudges, completionRing } from './lib/chiefOfStaff';
import type { TdzBucket, TdzEnvironment, TdzPriority, TdzViewMode } from './lib/types';

const ENVIRONMENTS: { key: TdzEnvironment; label: string; hint: string }[] = [
  { key: 'ar', label: 'AR Passthrough', hint: 'Pure black for optical see-through headsets' },
  { key: 'slate', label: 'Slate Dark', hint: 'Standard desktop workspace' },
  { key: 'studio', label: '360 Studio', hint: 'Immersive gradient environment' },
];

const envClass: Record<TdzEnvironment, string> = {
  ar: 'bg-black',
  slate: 'bg-slate-950',
  studio: 'bg-[radial-gradient(circle_at_20%_-10%,hsl(243_75%_30%/0.55),transparent_55%),radial-gradient(circle_at_85%_110%,hsl(175_70%_30%/0.45),transparent_55%)] bg-slate-950',
};

const ToDoooZLayout: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  const tdz = useToDoooZ(userId);

  const [mode, setMode] = useState<TdzViewMode>('work');
  const [environment, setEnvironment] = useState<TdzEnvironment>('slate');
  const [query, setQuery] = useState('');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('said');
  const [calCollapsed, setCalCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  const visibleCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tdz.cards.filter((c) => {
      if (mode !== 'unified' && c.mode !== mode) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.context_label ?? '').toLowerCase().includes(q)
      );
    });
  }, [tdz.cards, mode, query]);

  const visibleEvents = useMemo(
    () => tdz.events.filter((e) => mode === 'unified' || e.account_slot === mode),
    [tdz.events, mode],
  );

  const visibleTasks = useMemo(() => {
    const ids = new Set(visibleCards.map((c) => c.id));
    return tdz.tasks.filter((t) => ids.has(t.project_id));
  }, [tdz.tasks, visibleCards]);

  const nudges = useMemo(
    () => buildNudges(visibleCards, visibleTasks, visibleEvents),
    [visibleCards, visibleTasks, visibleEvents],
  );
  const ring = useMemo(() => completionRing(visibleTasks), [visibleTasks]);

  const openCard = tdz.cardById.get(openId ?? '') ?? null;
  const openParent = openCard?.parent_id ? (tdz.cardById.get(openCard.parent_id) ?? null) : null;

  const createCard = async (bucket: TdzBucket, priority: TdzPriority, parentId?: string) => {
    const parent = parentId ? tdz.cardById.get(parentId) : undefined;
    const card = await tdz.createCard({
      title: parentId ? 'New sub-task' : 'New card',
      mode: (mode === 'unified' ? (parent?.mode ?? 'work') : mode) as 'work' | 'personal',
      time_bucket: parent?.time_bucket ?? bucket,
      priority: parent?.priority ?? priority,
      parent_id: parentId ?? null,
      sort_order: tdz.cards.length,
    });
    if (card) {
      setFocusedId(card.id);
      setOpenId(card.id);
      setTab('overview');
    }
  };

  useKeyboardNav({
    cards: visibleCards,
    focusedId,
    setFocusedId,
    drawerOpen: !!openId,
    actions: {
      open: (id) => setOpenId(id),
      closeDrawer: () => (openId ? setOpenId(null) : setHelpOpen(false)),
      cycleTab: (dir) => {
        const i = TAB_KEYS.indexOf(tab);
        setTab(TAB_KEYS[(i + dir + TAB_KEYS.length) % TAB_KEYS.length]);
      },
      rename: (id) => {
        setOpenId(id);
        setTab('overview');
      },
      newCard: (b, p) => createCard(b, p),
      newSub: (parentId) => createCard('today', 'core', parentId),
      move: (id, patch) => tdz.patchCard(id, patch),
      toggleDone: (id) => {
        const c = tdz.cardById.get(id);
        if (c) tdz.patchCard(id, { status: c.status === 'done' ? 'active' : 'done', progress: c.status === 'done' ? 0 : 100 });
      },
      toggleCollapse: (id) => {
        const c = tdz.cardById.get(id);
        if (c) tdz.patchCard(id, { collapsed: !c.collapsed }, );
      },
      remove: (id) => {
        if (window.confirm('Delete this card and its sub-tasks?')) tdz.deleteCard(id);
      },
      toggleMode: () => setMode((m) => (m === 'work' ? 'personal' : m === 'personal' ? 'unified' : 'work')),
      toggleCalendar: () => setCalCollapsed((v) => !v),
      toggleAssistant: () => setAssistantOpen((v) => !v),
      toggleHelp: () => setHelpOpen((v) => !v),
      focusSearch: () => searchRef.current?.focus(),
      jumpToday: () => {
        const first = visibleCards.find((c) => c.time_bucket === 'today');
        if (first) setFocusedId(first.id);
      },
    },
  });

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!session) return <ToDoooZLogin />;

  const modeBtn = (key: TdzViewMode, label: string, Icon: typeof Home) => (
    <button
      key={key}
      onClick={() => setMode(key)}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition',
        mode === key ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white',
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <div className={cn('min-h-screen text-white', envClass[environment])}>
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
        <Link to="/labs" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
            <Boxes className="h-4 w-4" />
          </div>
          <span className="bg-gradient-to-r from-indigo-300 to-emerald-300 bg-clip-text text-lg font-bold text-transparent">
            ToDoooZ
          </span>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {modeBtn('work', 'Work', Briefcase)}
          {modeBtn('personal', 'Personal', Home)}
          {modeBtn('unified', 'Unified', Layers)}
        </div>

        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards…  (press /)"
            className="h-9 border-white/10 bg-white/5 pl-9 text-sm placeholder:text-white/30"
          />
        </div>

        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value as TdzEnvironment)}
          title={ENVIRONMENTS.find((e) => e.key === environment)?.hint}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white"
        >
          {ENVIRONMENTS.map((e) => (
            <option key={e.key} value={e.key} className="bg-slate-900">
              {e.label}
            </option>
          ))}
        </select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setContactsOpen(true)}
          className="text-white/50 hover:text-white"
        >
          <Users className="mr-1 h-3.5 w-3.5" /> Contacts
        </Button>

        <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)} className="text-white/50 hover:text-white">
          <Command className="mr-1 h-3.5 w-3.5" /> Shortcuts
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
              {(session.user.email ?? '?').slice(0, 2).toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 border-white/10 bg-slate-900 text-white">
            <DropdownMenuLabel className="text-xs font-normal text-white/50">{session.user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-white/35">
              Google accounts
            </DropdownMenuLabel>
            {(['work', 'personal'] as const).map((slot) => {
              const conn = tdz.connections.find((c) => c.account_slot === slot);
              return (
                <DropdownMenuItem
                  key={slot}
                  onSelect={(e) => {
                    e.preventDefault();
                    setAccountsOpen(true);
                  }}
                  className="flex items-center justify-between text-xs focus:bg-white/10"
                >
                  <span className="capitalize">{slot}</span>
                  <span className={conn ? 'text-emerald-300' : 'text-white/35'}>
                    {conn ? (conn.account_email ?? 'Connected') : 'Not assigned'}
                  </span>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onSelect={() => supabase.auth.signOut()}
              className="text-xs focus:bg-white/10"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        <main className="flex-1 overflow-x-auto p-4">
          {tdz.loading ? (
            <div className="flex h-64 items-center justify-center text-white/40">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <SpatialMatrix
              cards={visibleCards}
              tasks={tdz.tasks}
              cardById={tdz.cardById}
              childrenOf={tdz.childrenOf}
              focusedId={focusedId}
              onFocus={setFocusedId}
              onOpen={(id) => {
                setFocusedId(id);
                setOpenId(id);
              }}
              onToggleTask={tdz.toggleTask}
              onPatch={tdz.patchCard}
              onCreate={(b, p) => createCard(b, p)}
              onAddSub={(parentId) => createCard('today', 'core', parentId)}
              onDelete={(id) => {
                if (window.confirm('Delete this card and its sub-tasks?')) tdz.deleteCard(id);
              }}
            />
          )}
        </main>

        <CalendarSidebar
          events={visibleEvents}
          cardById={tdz.cardById}
          collapsed={calCollapsed}
          onToggle={() => setCalCollapsed((v) => !v)}
        />
      </div>

      <ChiefOfStaff
        nudges={nudges}
        ring={ring}
        mode={mode}
        open={assistantOpen}
        onToggle={() => setAssistantOpen((v) => !v)}
        onJump={(id) => {
          setFocusedId(id);
          setOpenId(id);
        }}
      />

      <DetailDrawer
        card={openCard}
        parent={openParent}
        children={openCard ? (tdz.childrenOf.get(openCard.id) ?? []) : []}
        allCards={tdz.cards}
        tasks={openCard ? tdz.tasks.filter((t) => t.project_id === openCard.id) : []}
        activities={openCard ? tdz.activities.filter((a) => a.project_id === openCard.id) : []}
        stakeholders={openCard ? tdz.stakeholders.filter((s) => s.project_id === openCard.id) : []}
        documents={openCard ? tdz.documents.filter((d) => d.project_id === openCard.id) : []}
        events={tdz.events}
        contacts={tdz.contacts}
        tab={tab}
        onTab={setTab}
        onClose={() => setOpenId(null)}
        api={{
          patchCard: tdz.patchCard,
          toggleTask: tdz.toggleTask,
          addTask: tdz.addTask,
          updateTask: tdz.updateTask,
          deleteTask: tdz.deleteTask,
          addActivity: tdz.addActivity,
          addStakeholder: tdz.addStakeholder,
          removeStakeholder: tdz.removeStakeholder,
          linkContactToCard: tdz.linkContactToCard,
          openContacts: () => setContactsOpen(true),
          addDocument: tdz.addDocument,
          updateDocument: tdz.updateDocument,
          removeDocument: tdz.removeDocument,
          spawnCard: async (task) => {
            const parent = tdz.cardById.get(task.project_id);
            if (!parent) return;
            const card = await tdz.createCard({
              title: task.title,
              mode: parent.mode,
              time_bucket: parent.time_bucket,
              priority: parent.priority,
              parent_id: parent.id,
              due_date: task.due_date,
              sort_order: tdz.cards.length,
            });
            if (card) toast.success('Sub-task card created');
          },
          openCard: (id) => setOpenId(id),
        }}
      />

      <ContactsCRM
        open={contactsOpen}
        onOpenChange={setContactsOpen}
        contacts={tdz.contacts}
        stakeholders={tdz.stakeholders}
        cardById={tdz.cardById}
        api={{
          createContact: tdz.createContact,
          updateContact: tdz.updateContact,
          deleteContact: tdz.deleteContact,
          syncContacts: tdz.syncContacts,
        }}
        onOpenCard={(id) => {
          setFocusedId(id);
          setOpenId(id);
        }}
      />

      <ShortcutOverlay open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
};

export default ToDoooZLayout;
