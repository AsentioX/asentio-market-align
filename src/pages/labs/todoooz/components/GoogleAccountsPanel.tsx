import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeftRight, Briefcase, CalendarDays, Home, Loader2, Plus, RefreshCw, ShieldAlert, Unlink, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateAccountTokens, type GoogleIdentity } from '../lib/google';
import type { TdzAccountSlot, TdzConnection } from '../lib/types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  connections: TdzConnection[];
  loadIdentities: () => Promise<GoogleIdentity[]>;
  onDesignate: (slot: TdzAccountSlot, identity: GoogleIdentity) => Promise<void>;
  onRemove: (slot: TdzAccountSlot) => Promise<void>;
  onSwap: () => Promise<void>;
  onSyncContacts: (slot: TdzAccountSlot) => Promise<void>;
  onSyncCalendar: (slot: TdzAccountSlot) => Promise<void>;
  onAddAccount: () => Promise<GoogleIdentity | null>;
}

const SLOTS: { key: TdzAccountSlot; label: string; icon: typeof Briefcase }[] = [
  { key: 'work', label: 'Work', icon: Briefcase },
  { key: 'personal', label: 'Personal', icon: Home },
];

const GoogleAccountsPanel: React.FC<Props> = ({
  open,
  onOpenChange,
  connections,
  loadIdentities,
  onDesignate,
  onRemove,
  onSwap,
  onSyncContacts,
  onSyncCalendar,
  onAddAccount,
}) => {
  const [identities, setIdentities] = useState<GoogleIdentity[]>([]);
  const [authStatus, setAuthStatus] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(
    async (notify: boolean) => {
      setRefreshing(true);
      try {
        const rows = await loadIdentities();
        setIdentities(rows);
        const status = await validateAccountTokens(rows);
        setAuthStatus(status);
        if (notify) {
          const expired = rows.filter((r) => status[r.email.toLowerCase()] === false).length;
          if (rows.length === 0) toast.info('No Google accounts linked yet');
          else if (expired > 0)
            toast.warning(
              `${rows.length} Google account${rows.length === 1 ? '' : 's'} linked · ${expired} need${
                expired === 1 ? 's' : ''
              } re-authorisation`,
            );
          else toast.success(`${rows.length} Google account${rows.length === 1 ? '' : 's'} linked`);
        }
      } catch (err) {
        if (notify) toast.error(err instanceof Error ? err.message : 'Could not refresh Google accounts');
      } finally {
        setRefreshing(false);
      }
    },
    [loadIdentities],
  );

  useEffect(() => {
    if (open) refresh(false);
  }, [open, refresh]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-base">Google accounts</DialogTitle>
          <DialogDescription className="text-xs text-white/45">
            Choose which signed-in Google account is your work account and which is personal, then import
            contacts and calendar events from each.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {SLOTS.map(({ key, label, icon: Icon }) => {
            const conn = connections.find((c) => c.account_slot === key);
            return (
              <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4 text-white/60" /> {label}
                  </div>
                  {conn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => run(`rm-${key}`, () => onRemove(key))}
                      className="h-7 text-[11px] text-white/45 hover:text-white"
                    >
                      <Unlink className="mr-1 h-3 w-3" /> Unassign
                    </Button>
                  )}
                </div>

                <div className="mt-2 space-y-1.5">
                  {identities.length === 0 && (
                    <p className="text-[11px] text-white/40">
                      No Google account authorised yet. Use “Add Google account” below to connect one.
                    </p>
                  )}
                  {identities.map((id) => {
                    const active = conn?.account_email === id.email;
                    return (
                      <button
                        key={`${key}-${id.email}`}
                        onClick={() => run(`${key}-${id.email}`, () => onDesignate(key, id))}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition',
                          active
                            ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
                            : 'border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06]',
                        )}
                      >
                        {id.avatar_url ? (
                          <img src={id.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px]">
                            {id.email.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="flex-1 truncate">
                          {id.name ?? id.email}
                          <span className="block truncate text-[10px] text-white/35">{id.email}</span>
                        </span>
                        {busy === `${key}-${id.email}` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          active && <span className="text-[10px] text-emerald-300">Selected</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {conn && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === `ct-${key}`}
                      onClick={() => run(`ct-${key}`, () => onSyncContacts(key))}
                      className="h-7 border-white/15 bg-transparent text-[11px] hover:bg-white/10"
                    >
                      {busy === `ct-${key}` ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Users className="mr-1 h-3 w-3" />
                      )}
                      Import contacts
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === `cal-${key}`}
                      onClick={() => run(`cal-${key}`, () => onSyncCalendar(key))}
                      className="h-7 border-white/15 bg-transparent text-[11px] hover:bg-white/10"
                    >
                      {busy === `cal-${key}` ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <CalendarDays className="mr-1 h-3 w-3" />
                      )}
                      Import calendar
                    </Button>
                    {conn.last_synced_at && (
                      <span className="text-[10px] text-white/35">
                        Last import {new Date(conn.last_synced_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Button
            size="sm"
            disabled={busy === 'add'}
            onClick={() =>
              run('add', async () => {
                const identity = await onAddAccount();
                if (identity) await refresh(false);
              })
            }
            className="w-full bg-white/10 text-xs text-white hover:bg-white/20"
          >
            {busy === 'add' ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="mr-1 h-3.5 w-3.5" />
            )}
            Add Google account
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={connections.length === 0 || busy === 'swap'}
            onClick={() => run('swap', onSwap)}
            className="w-full text-xs text-white/50 hover:text-white"
          >
            {busy === 'swap' ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowLeftRight className="mr-1 h-3.5 w-3.5" />
            )}
            Swap work and personal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={refreshing}
            onClick={() => refresh(true)}
            className="w-full text-[11px] text-white/35 hover:text-white"
          >
            {refreshing ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-3 w-3" />
            )}
            Refresh linked Google accounts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleAccountsPanel;
