import React, { useMemo, useState } from 'react';
import { Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SOURCE_LABEL } from '../lib/contacts';
import type { TdzAccountSlot, TdzCard, TdzContact, TdzStakeholder } from '../lib/types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contacts: TdzContact[];
  stakeholders: TdzStakeholder[];
  cardById: Map<string, TdzCard>;
  api: {
    createContact: (payload: Partial<TdzContact>) => Promise<TdzContact | null>;
    updateContact: (id: string, patch: Partial<TdzContact>) => void;
    deleteContact: (id: string) => void;
    syncContacts: (slot: TdzAccountSlot) => Promise<void>;
  };
  onOpenCard: (id: string) => void;
}

const SOURCES = ['all', 'google_work', 'google_personal', 'manual'] as const;

const ContactsCRM: React.FC<Props> = ({
  open,
  onOpenChange,
  contacts,
  stakeholders,
  cardById,
  api,
  onOpenCard,
}) => {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<(typeof SOURCES)[number]>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const selected = contacts.find((c) => c.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => (sourceFilter === 'all' ? true : c.source === sourceFilter))
      .filter((c) =>
        !q
          ? true
          : [c.name, c.email, c.company, c.job_title, ...(c.tags ?? [])]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q)),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, query, sourceFilter]);

  const linkedCards = useMemo(() => {
    if (!selected) return [];
    return stakeholders
      .filter((s) => s.contact_id === selected.id)
      .map((s) => cardById.get(s.project_id))
      .filter(Boolean) as TdzCard[];
  }, [selected, stakeholders, cardById]);

  const sync = async (slot: TdzAccountSlot) => {
    setSyncing(slot);
    await api.syncContacts(slot);
    setSyncing(null);
  };

  const field = (
    label: string,
    value: string | null,
    key: keyof TdzContact,
    placeholder = '',
  ) => (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-white/40">{label}</span>
      <Input
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => selected && api.updateContact(selected.id, { [key]: e.target.value || null } as Partial<TdzContact>)}
        className="mt-1 border-white/10 bg-white/5 text-sm"
      />
    </label>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-white/10 bg-slate-950/95 text-white backdrop-blur-xl sm:max-w-3xl"
      >
        <SheetHeader>
          <SheetTitle className="text-white">Contacts</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(['work', 'personal'] as const).map((slot) => (
            <Button
              key={slot}
              size="sm"
              variant="outline"
              disabled={syncing !== null}
              onClick={() => sync(slot)}
              className="border-white/15 bg-transparent text-xs capitalize hover:bg-white/10"
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', syncing === slot && 'animate-spin')} />
              Sync {slot} Google
            </Button>
          ))}
          <Button
            size="sm"
            onClick={async () => {
              const c = await api.createContact({ name: 'New contact', source: 'manual' });
              if (c) setSelectedId(c.id);
            }}
            className="text-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New contact
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, company, email, tag…"
              className="h-9 border-white/10 bg-white/5 pl-9 text-sm placeholder:text-white/30"
            />
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {SOURCES.map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] transition',
                  sourceFilter === s ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white',
                )}
              >
                {s === 'all' ? 'All' : SOURCE_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid max-h-[calc(100vh-220px)] grid-cols-1 gap-4 overflow-hidden md:grid-cols-[1fr_1fr]">
          <div className="overflow-y-auto pr-1">
            <div className="mb-2 text-[11px] text-white/40">{filtered.length} contacts</div>
            <ul className="space-y-1.5">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition',
                      selectedId === c.id
                        ? 'border-indigo-400/50 bg-indigo-400/10'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]',
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px]">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-white">{c.name}</div>
                      <div className="truncate text-[11px] text-white/45">
                        {[c.job_title, c.company].filter(Boolean).join(' · ') || c.email || '—'}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-white/35">{SOURCE_LABEL[c.source] ?? c.source}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-white/40">
                  No contacts yet — sync a Google account or add one manually.
                </li>
              )}
            </ul>
          </div>

          <div className="overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-4">
            {!selected ? (
              <p className="text-xs text-white/40">Select a contact to edit their details.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold text-white">{selected.name}</div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${selected.name}?`)) {
                        api.deleteContact(selected.id);
                        setSelectedId(null);
                      }
                    }}
                    className="text-white/30 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {field('Name', selected.name, 'name')}
                {field('Email', selected.email, 'email')}
                {field('Phone', selected.phone, 'phone')}
                {field('Company', selected.company, 'company')}
                {field('Title', selected.job_title, 'job_title')}

                <div>
                  <span className="text-[10px] uppercase tracking-wide text-white/40">Tags</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(selected.tags ?? []).map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="border-white/15 bg-white/5 text-[10px] text-white/70"
                      >
                        {t}
                        <button
                          className="ml-1 text-white/40 hover:text-rose-300"
                          onClick={() =>
                            api.updateContact(selected.id, {
                              tags: (selected.tags ?? []).filter((x) => x !== t),
                            })
                          }
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                    <Input
                      placeholder="add tag…"
                      className="h-6 w-24 border-white/10 bg-white/5 px-2 text-[11px]"
                      onKeyDown={(e) => {
                        const v = (e.target as HTMLInputElement).value.trim();
                        if (e.key === 'Enter' && v) {
                          api.updateContact(selected.id, {
                            tags: Array.from(new Set([...(selected.tags ?? []), v])),
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <label className="block">
                  <span className="text-[10px] uppercase tracking-wide text-white/40">Notes</span>
                  <Textarea
                    value={selected.notes ?? ''}
                    onChange={(e) => api.updateContact(selected.id, { notes: e.target.value })}
                    rows={4}
                    className="mt-1 border-white/10 bg-white/5 text-sm"
                  />
                </label>

                <div>
                  <span className="text-[10px] uppercase tracking-wide text-white/40">On cards</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {linkedCards.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onOpenCard(c.id);
                          onOpenChange(false);
                        }}
                        className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/75 hover:bg-white/10"
                      >
                        {c.title}
                      </button>
                    ))}
                    {linkedCards.length === 0 && (
                      <span className="text-[11px] text-white/40">Not linked to any card yet.</span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-white/30">
                  {SOURCE_LABEL[selected.source] ?? selected.source}
                  {selected.last_synced_at
                    ? ` · synced ${new Date(selected.last_synced_at).toLocaleString()}`
                    : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ContactsCRM;
