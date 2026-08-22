import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { syncGoogleContacts } from './contacts';
import { authorizeGoogleAccount } from './gis';
import {
  GoogleAuthNeeded,
  designateAccount,
  disconnectAccount,
  importGoogleCalendar,
  importGoogleCalendarRange,

  importGoogleTasks,
  pushTaskToGoogle,
  deleteGoogleTask,
  moveGoogleTask,
  pushEventToGoogle,
  deleteGoogleEvent,
  pushContactToGoogle,
  deleteGoogleContact,
  listGoogleIdentities,
  swapSlots,
  type GoogleIdentity,
} from './google';

import type {
  TdzAccountSlot,
  TdzActivity,
  TdzCard,
  TdzConnection,
  TdzContact,
  TdzDocument,
  TdzEvent,
  TdzStakeholder,
  TdzTag,
  TdzTask,
} from './types';

export const useToDoooZ = (userId: string | undefined) => {
  const [cards, setCards] = useState<TdzCard[]>([]);
  const [tasks, setTasks] = useState<TdzTask[]>([]);
  /** Mirror of `tasks` that is updated synchronously so back-to-back mutations
   *  (e.g. move sub-tasks then delete the parent) never read a stale snapshot. */
  const tasksRef = useRef<TdzTask[]>([]);
  const commitTasks = useCallback((next: TdzTask[] | ((prev: TdzTask[]) => TdzTask[])) => {
    tasksRef.current = typeof next === 'function' ? (next as (p: TdzTask[]) => TdzTask[])(tasksRef.current) : next;
    setTasks(tasksRef.current);
  }, []);
  const [events, setEvents] = useState<TdzEvent[]>([]);
  const [activities, setActivities] = useState<TdzActivity[]>([]);
  const [stakeholders, setStakeholders] = useState<TdzStakeholder[]>([]);
  const [documents, setDocuments] = useState<TdzDocument[]>([]);
  const [connections, setConnections] = useState<TdzConnection[]>([]);
  const [contacts, setContacts] = useState<TdzContact[]>([]);
  const [tags, setTags] = useState<TdzTag[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    const [c, t, e, a, s, d, g, ct, tg] = await Promise.all([
      supabase.from('tdz_projects').select('*').order('sort_order'),
      supabase.from('tdz_tasks').select('*').order('rank'),
      supabase.from('tdz_calendar_events').select('*').order('starts_at'),
      supabase.from('tdz_activity_logs').select('*').order('occurred_at', { ascending: false }),
      supabase.from('tdz_stakeholders').select('*'),
      supabase.from('tdz_documents').select('*').order('added_at'),
      supabase.from('tdz_google_connections').select('*'),
      supabase.from('tdz_contacts').select('*').order('name'),
      supabase.from('tdz_tags').select('*').order('name'),
    ]);
    setCards((c.data ?? []) as TdzCard[]);
    commitTasks((t.data ?? []) as TdzTask[]);
    setEvents((e.data ?? []) as TdzEvent[]);
    setActivities((a.data ?? []) as TdzActivity[]);
    setStakeholders((s.data ?? []) as TdzStakeholder[]);
    setDocuments((d.data ?? []) as TdzDocument[]);
    setConnections((g.data ?? []) as TdzConnection[]);
    setContacts((ct.data ?? []) as TdzContact[]);
    setTags((tg.data ?? []) as TdzTag[]);
    setLoading(false);
    return (c.data ?? []).length;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId, load]);


  const childrenOf = useMemo(() => {
    const map = new Map<string, TdzCard[]>();
    cards.forEach((c) => {
      if (!c.parent_id) return;
      map.set(c.parent_id, [...(map.get(c.parent_id) ?? []), c]);
    });
    return map;
  }, [cards]);

  const cardById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const patchCard = useCallback(
    async (id: string, patch: Partial<TdzCard>, touch = true) => {
      const body = { ...patch, ...(touch ? { last_activity_at: new Date().toISOString() } : {}) };
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...(body as TdzCard) } : c)));
      const { error } = await supabase.from('tdz_projects').update(body).eq('id', id);
      if (error) {
        toast.error(error.message);
        load();
      }
    },
    [load],
  );

  const createCard = useCallback(
    async (patch: Partial<TdzCard>) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('tdz_projects')
        .insert({ user_id: userId, title: 'Untitled card', ...patch } as never)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      setCards((prev) => [...prev, data as TdzCard]);
      return data as TdzCard;
    },
    [userId],
  );

  const deleteCard = useCallback(async (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
    const { error } = await supabase.from('tdz_projects').delete().eq('id', id);
    if (error) toast.error(error.message);
  }, []);

  /** Email of the Google account backing a slot (falls back to the signed-in one). */
  const emailForSlot = useCallback(
    (slot?: string | null) =>
      connections.find((c) => c.account_slot === (slot ?? 'work'))?.account_email ??
      connections[0]?.account_email ??
      null,
    [connections],
  );

  /** Mirror a local task into Google Tasks; failures never block the local edit. */
  const pushTask = useCallback(
    async (taskId: string) => {
      const { data } = await supabase.from('tdz_tasks').select('*').eq('id', taskId).maybeSingle();
      const task = data as TdzTask | null;
      if (!task) return;
      const card = cards.find((c) => c.id === task.project_id);
      try {
        await pushTaskToGoogle(task, card?.title ?? 'ToDoooZ', emailForSlot(task.account_slot ?? card?.mode));
      } catch (err) {
        if (err instanceof GoogleAuthNeeded) return; // stay silent until the user re-authorises
        console.error('Google Tasks sync failed', err);
      }
    },
    [cards, emailForSlot],
  );

  const toggleTask = useCallback(
    async (task: TdzTask) => {
      const done = !task.done;
      const completed_at = done ? new Date().toISOString() : null;
      commitTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done, completed_at } : t)));
      await supabase.from('tdz_tasks').update({ done, completed_at }).eq('id', task.id);
      await patchCard(task.project_id, {}, true);
      pushTask(task.id);
    },
    [patchCard, pushTask, commitTasks],
  );

  const addTask = useCallback(
    async (
      projectId: string,
      title: string,
      due?: string | null,
      parentTaskId?: string | null,
    ): Promise<TdzTask | undefined> => {
      if (!userId || !title.trim()) return undefined;
      const { data, error } = await supabase
        .from('tdz_tasks')
        .insert({
          user_id: userId,
          project_id: projectId,
          title: title.trim(),
          due_date: due ?? null,
          parent_task_id: parentTaskId ?? null,
        })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return undefined;
      }
      commitTasks((prev) => [...prev, data as TdzTask]);
      pushTask((data as TdzTask).id);
      return data as TdzTask;
    },
    [userId, pushTask],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<TdzTask>) => {
      commitTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...(patch as TdzTask) } : t)));
      await supabase.from('tdz_tasks').update(patch).eq('id', id);
      pushTask(id);
    },
    [pushTask],
  );

  /**
   * Nest a task under another task (or promote it to root with `null`).
   * Google Tasks allows a single level, so children of a task that becomes a
   * subtask are re-attached to the same new parent.
   */
  const setTaskParent = useCallback(
    async (taskId: string, parentTaskId: string | null) => {
      const current = tasksRef.current;
      const task = current.find((t) => t.id === taskId);
      if (!task || taskId === parentTaskId) return;
      const parent = parentTaskId ? current.find((t) => t.id === parentTaskId) : null;
      if (parentTaskId && !parent) return;
      if (parent?.parent_task_id === taskId) return; // no cycles
      const children = parentTaskId ? current.filter((t) => t.parent_task_id === taskId) : [];
      const moving = [task, ...children];
      const targetParent = parentTaskId ?? null;

      commitTasks((prev) =>
        prev.map((t) =>
          moving.some((m) => m.id === t.id) ? { ...t, parent_task_id: targetParent } : t,
        ),
      );
      const results = await Promise.all(
        moving.map((m) =>
          supabase.from('tdz_tasks').update({ parent_task_id: targetParent }).eq('id', m.id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        toast.error(failed.error.message);
        load();
        return;
      }

      const card = cards.find((c) => c.id === task.project_id);
      const parentGoogleId = parent?.google_task_id ?? null;
      for (const m of moving) {
        if (!m.google_task_id) continue;
        try {
          await moveGoogleTask(
            m.project_id,
            m.google_task_id,
            null,
            parentGoogleId,
            emailForSlot(m.account_slot ?? card?.mode),
          );
        } catch (err) {
          if (!(err instanceof GoogleAuthNeeded)) console.error('Google Tasks nest failed', err);
        }
      }
    },
    [cards, emailForSlot, commitTasks, load],
  );


  const deleteTask = useCallback(
    async (id: string) => {
      const current = tasksRef.current;
      const task = current.find((t) => t.id === id);
      // Children cascade in the database; mirror that locally and on Google.
      // Only tasks that still live on the same card cascade — ones already moved
      // to another card were re-parented and must survive.
      const children = current.filter(
        (t) => t.parent_task_id === id && t.project_id === task?.project_id,
      );
      const removed = [task, ...children].filter(Boolean) as TdzTask[];
      const removedIds = new Set(removed.map((t) => t.id));
      commitTasks((prev) => prev.filter((t) => !removedIds.has(t.id)));
      await supabase.from('tdz_tasks').delete().eq('id', id);
      for (const t of removed) {
        if (!t.google_task_id) continue;
        const card = cards.find((c) => c.id === t.project_id);
        try {
          await deleteGoogleTask(
            t.project_id,
            t.google_task_id,
            emailForSlot(t.account_slot ?? card?.mode),
          );
        } catch (err) {
          if (!(err instanceof GoogleAuthNeeded)) console.error('Google Tasks delete failed', err);
        }
      }
    },
    [cards, emailForSlot, commitTasks],
  );

  /**
   * Move tasks (and their descendants) onto another card.
   * Google-backed tasks are removed from the old list so the next push recreates
   * them in the target card's list.
   */
  const moveTasksToCard = useCallback(
    async (taskIds: string[], targetProjectId: string) => {
      const moving = tasksRef.current.filter((t) => taskIds.includes(t.id));
      if (!moving.length) return;
      const movingIds = new Set(moving.map((t) => t.id));
      commitTasks((prev) =>
        prev.map((t) =>
          movingIds.has(t.id)
            ? {
                ...t,
                project_id: targetProjectId,
                parent_task_id:
                  t.parent_task_id && movingIds.has(t.parent_task_id) ? t.parent_task_id : null,
                google_task_id: null,
              }
            : t,
        ),
      );
      for (const t of moving) {
        await supabase
          .from('tdz_tasks')
          .update({
            project_id: targetProjectId,
            parent_task_id:
              t.parent_task_id && movingIds.has(t.parent_task_id) ? t.parent_task_id : null,
            google_task_id: null,
          })
          .eq('id', t.id);
        if (t.google_task_id) {
          const card = cards.find((c) => c.id === t.project_id);
          try {
            await deleteGoogleTask(
              t.project_id,
              t.google_task_id,
              emailForSlot(t.account_slot ?? card?.mode),
            );
          } catch (err) {
            if (!(err instanceof GoogleAuthNeeded)) console.error('Google Tasks move failed', err);
          }
        }
      }
      for (const t of moving) await pushTask(t.id);
    },
    [cards, emailForSlot, pushTask, commitTasks],
  );

  /**
   * Reverse of `spawnCard`: turn a child card back into a task on its parent.
   * Creates a top-level task from the child card's title, moves the child card's
   * tasks onto the parent (preserving any inter-nesting as far as Google's
   * single level allows), nests them under the new task, then deletes the card.
   */
  const importCardAsTask = useCallback(
    async (childCard: TdzCard, parentCardId: string) => {
      const created = await addTask(parentCardId, childCard.title, childCard.due_date);
      if (!created) return;

      const childTasks = tasksRef.current
        .filter((t) => t.project_id === childCard.id)
        .sort((a, b) => a.rank - b.rank);
      // Former top-level tasks (pre-move snapshot, ids are stable across the move).
      const roots = childTasks.filter((t) => !t.parent_task_id).map((t) => t.id);

      if (childTasks.length) await moveTasksToCard(childTasks.map((t) => t.id), parentCardId);

      // Re-parent the former roots (and their sub-trees) under the new task.
      for (const rId of roots) {
        await setTaskParent(rId, created.id);
      }

      await deleteCard(childCard.id);
      toast.success('Imported back into task list');
    },
    [addTask, moveTasksToCard, setTaskParent, deleteCard],
  );


  /**
   * Persist a manual order for a card's tasks.
   * `ordered` is the full display order (roots followed by their children);
   * ranks are renumbered and the moved task is repositioned on Google too.
   */
  const reorderTasks = useCallback(
    async (projectId: string, ordered: TdzTask[], movedId?: string) => {
      const rankById = new Map(ordered.map((t, i) => [t.id, i]));
      commitTasks((prev) =>
        prev.map((t) => (rankById.has(t.id) ? { ...t, rank: rankById.get(t.id) as number } : t)),
      );
      const results = await Promise.all(
        ordered.map((t, i) => supabase.from('tdz_tasks').update({ rank: i }).eq('id', t.id)),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        toast.error(failed.error.message);
        load();
        return;
      }

      const moved = movedId ? ordered.find((t) => t.id === movedId) : undefined;
      if (!moved?.google_task_id) return;
      const index = ordered.findIndex((t) => t.id === moved.id);
      const previous = [...ordered.slice(0, index)]
        .reverse()
        .find((t) => (t.parent_task_id ?? null) === (moved.parent_task_id ?? null));
      const parent = moved.parent_task_id ? ordered.find((t) => t.id === moved.parent_task_id) : undefined;
      const card = cards.find((c) => c.id === projectId);
      try {
        await moveGoogleTask(
          projectId,
          moved.google_task_id,
          previous?.google_task_id ?? null,
          parent?.google_task_id ?? null,
          emailForSlot(moved.account_slot ?? card?.mode),
        );
      } catch (err) {
        if (!(err instanceof GoogleAuthNeeded)) console.error('Google Tasks move failed', err);
      }
    },
    [cards, emailForSlot, load],
  );

  /** Persist a manual order for cards (used by within-cell drag in the matrix). */
  const reorderCards = useCallback(async (ordered: TdzCard[]) => {
    const orderById = new Map(ordered.map((c, i) => [c.id, i]));
    setCards((prev) =>
      prev.map((c) => (orderById.has(c.id) ? { ...c, sort_order: orderById.get(c.id) as number } : c)),
    );
    await Promise.all(
      ordered.map((c, i) => supabase.from('tdz_projects').update({ sort_order: i }).eq('id', c.id)),
    );
  }, []);

  /** Edit a calendar event locally and mirror it into Google Calendar. */
  const updateEvent = useCallback(
    async (id: string, patch: Partial<TdzEvent>) => {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...(patch as TdzEvent) } : e)));
      const { error } = await supabase.from('tdz_calendar_events').update(patch).eq('id', id);
      if (error) {
        toast.error(error.message);
        return;
      }
      // Card / task linking is a ToDoooZ-only concept — nothing to push to Google.
      const keys = Object.keys(patch);
      if (keys.length && keys.every((k) => k === 'project_id' || k === 'task_id')) return;

      const { data } = await supabase.from('tdz_calendar_events').select('*').eq('id', id).maybeSingle();
      const event = data as TdzEvent | null;
      if (!event) return;
      try {
        await pushEventToGoogle(event, emailForSlot(event.account_slot));
      } catch (err) {
        if (err instanceof GoogleAuthNeeded) toast.error(err.message);
        else console.error('Google Calendar sync failed', err);
      }
    },
    [emailForSlot],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const event = events.find((e) => e.id === id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      await supabase.from('tdz_calendar_events').delete().eq('id', id);
      if (event?.google_event_id) {
        try {
          await deleteGoogleEvent(event.google_event_id, event.google_calendar_id, emailForSlot(event.account_slot));
        } catch (err) {
          if (!(err instanceof GoogleAuthNeeded)) console.error('Google Calendar delete failed', err);
        }
      }
    },
    [events, emailForSlot],
  );

  const addActivity = useCallback(
    async (projectId: string, summary: string, detail?: string, source = 'manual') => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('tdz_activity_logs')
        .insert({ user_id: userId, project_id: projectId, summary, detail: detail ?? null, source })
        .select()
        .single();
      if (error) return toast.error(error.message);
      setActivities((prev) => [data as TdzActivity, ...prev]);
      patchCard(projectId, {});
    },
    [userId, patchCard],
  );

  const addStakeholder = useCallback(
    async (projectId: string, payload: Partial<TdzStakeholder>) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('tdz_stakeholders')
        .insert({ user_id: userId, project_id: projectId, name: payload.name ?? 'Unnamed', ...payload } as never)
        .select()
        .single();
      if (error) return toast.error(error.message);
      setStakeholders((prev) => [...prev, data as TdzStakeholder]);
    },
    [userId],
  );

  const removeStakeholder = useCallback(async (id: string) => {
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
    await supabase.from('tdz_stakeholders').delete().eq('id', id);
  }, []);

  const addDocument = useCallback(
    async (projectId: string, url: string, title: string, docType: string, taskId?: string | null) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('tdz_documents')
        .insert({ user_id: userId, project_id: projectId, url, title, doc_type: docType, task_id: taskId ?? null })
        .select()
        .single();
      if (error) return toast.error(error.message);
      setDocuments((prev) => [...prev, data as TdzDocument]);
    },
    [userId],
  );

  const updateDocument = useCallback(async (id: string, patch: Partial<TdzDocument>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...(patch as TdzDocument) } : d)));
    await supabase.from('tdz_documents').update(patch).eq('id', id);
  }, []);

  const removeDocument = useCallback(async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await supabase.from('tdz_documents').delete().eq('id', id);
  }, []);

  /** Mirror a local contact into Google Contacts. */
  const pushContact = useCallback(
    async (contactId: string) => {
      const { data } = await supabase.from('tdz_contacts').select('*').eq('id', contactId).maybeSingle();
      const contact = data as TdzContact | null;
      if (!contact) return;
      try {
        await pushContactToGoogle(contact, emailForSlot(contact.account_slot));
      } catch (err) {
        if (err instanceof GoogleAuthNeeded) return;
        console.error('Google contact sync failed', err);
      }
    },
    [emailForSlot],
  );

  const createContact = useCallback(
    async (payload: Partial<TdzContact>) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('tdz_contacts')
        .insert({ user_id: userId, name: payload.name?.trim() || 'Unnamed', ...payload } as never)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      setContacts((prev) => [...prev, data as TdzContact]);
      pushContact((data as TdzContact).id);
      return data as TdzContact;
    },
    [userId, pushContact],
  );

  const updateContact = useCallback(
    async (id: string, patch: Partial<TdzContact>) => {
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...(patch as TdzContact) } : c)));
      const { error } = await supabase.from('tdz_contacts').update(patch).eq('id', id);
      if (error) return toast.error(error.message);
      pushContact(id);
    },
    [pushContact],
  );

  const deleteContact = useCallback(
    async (id: string) => {
      const contact = contacts.find((c) => c.id === id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      const { error } = await supabase.from('tdz_contacts').delete().eq('id', id);
      if (error) return toast.error(error.message);
      if (contact?.google_resource_id) {
        try {
          await deleteGoogleContact(contact.google_resource_id, emailForSlot(contact.account_slot));
        } catch (err) {
          if (!(err instanceof GoogleAuthNeeded)) console.error('Google contact delete failed', err);
        }
      }
    },
    [contacts, emailForSlot],
  );

  const handleGoogleError = useCallback((err: unknown) => {
    if (err instanceof GoogleAuthNeeded) toast.error(err.message);
    else toast.error(err instanceof Error ? err.message : 'Google sync failed');
  }, []);

  const syncContacts = useCallback(
    async (slot: TdzAccountSlot) => {
      if (!userId) return;
      try {
        const email = connections.find((c) => c.account_slot === slot)?.account_email;
        const res = await syncGoogleContacts(userId, slot, contacts, email);
        const { data } = await supabase.from('tdz_contacts').select('*').order('name');
        setContacts((data ?? []) as TdzContact[]);
        toast.success(`${slot} Google contacts imported — ${res.added} new, ${res.updated} updated`);
      } catch (err) {
        handleGoogleError(err);
      }
    },
    [userId, contacts, connections, handleGoogleError],
  );

  const syncCalendar = useCallback(
    async (slot: TdzAccountSlot) => {
      if (!userId) return;
      try {
        const email = connections.find((c) => c.account_slot === slot)?.account_email;
        const count = await importGoogleCalendar(userId, slot, email);
        await load();
        toast.success(`${slot} calendar imported — ${count} events`);
      } catch (err) {
        handleGoogleError(err);
      }
    },
    [userId, load, connections, handleGoogleError],
  );

  /** Import a specific window (e.g. an earlier month) for every linked account. */
  const syncCalendarRange = useCallback(
    async (from: Date, to: Date) => {
      if (!userId || !connections.length) return 0;
      let total = 0;
      try {
        for (const conn of connections) {
          total += await importGoogleCalendarRange(
            userId,
            conn.account_slot,
            from,
            to,
            conn.account_email,
          );
        }
        const { data } = await supabase.from('tdz_calendar_events').select('*').order('starts_at');
        setEvents((data ?? []) as TdzEvent[]);
      } catch (err) {
        handleGoogleError(err);
      }
      return total;
    },
    [userId, connections, handleGoogleError],
  );


  const syncTasks = useCallback(
    async (slot: TdzAccountSlot) => {
      if (!userId) return;
      try {
        const email = connections.find((c) => c.account_slot === slot)?.account_email;
        const count = await importGoogleTasks(userId, slot, email);
        await load();
        toast.success(
          count ? `${slot} Google Tasks imported — ${count} tasks` : `No Google Tasks found for your ${slot} account`,
        );
      } catch (err) {
        handleGoogleError(err);
      }
    },
    [userId, load, connections, handleGoogleError],
  );


  const googleIdentities = useCallback(async (): Promise<GoogleIdentity[]> => listGoogleIdentities(), []);

  /** Authorise an additional Google account (e.g. a personal one) via Google's picker. */
  const addGoogleAccount = useCallback(async (): Promise<GoogleIdentity | null> => {
    try {
      const identity = await authorizeGoogleAccount();
      toast.success(`${identity.email} authorised`);
      return identity;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not authorise that Google account');
      return null;
    }
  }, []);

  const setAccountSlot = useCallback(
    async (slot: TdzAccountSlot, identity: GoogleIdentity) => {
      if (!userId) return;
      try {
        await designateAccount(userId, slot, identity);
        await load();
        toast.success(`${identity.email} set as your ${slot} account`);
      } catch (err) {
        handleGoogleError(err);
      }
    },
    [userId, load, handleGoogleError],
  );

  const removeAccount = useCallback(
    async (slot: TdzAccountSlot) => {
      if (!userId) return;
      await disconnectAccount(userId, slot);
      await load();
    },
    [userId, load],
  );

  const swapAccounts = useCallback(async () => {
    if (!userId) return;
    await swapSlots(userId);
    await load();
    toast.success('Work and personal accounts swapped');
  }, [userId, load]);



  const linkContactToCard = useCallback(
    async (projectId: string, contact: TdzContact, role?: string | null, taskId?: string | null) => {
      if (!userId) return;
      const duplicate = stakeholders.some(
        (s) =>
          s.contact_id === contact.id &&
          s.project_id === projectId &&
          (s.task_id ?? null) === (taskId ?? null),
      );
      if (duplicate) {
        toast.info(`${contact.name} is already linked here`);
        return;
      }
      const { data, error } = await supabase
        .from('tdz_stakeholders')
        .insert({
          user_id: userId,
          project_id: projectId,
          task_id: taskId ?? null,
          contact_id: contact.id,
          name: contact.name,
          role: role ?? contact.job_title ?? null,
          email: contact.email,
          avatar_url: contact.avatar_url,
        } as never)
        .select()
        .single();
      if (error) return toast.error(error.message);
      setStakeholders((prev) => [...prev, data as TdzStakeholder]);
    },
    [userId, stakeholders],
  );

  /** Attach a contact to a specific task / subtask (also visible on the card). */
  const linkContactToTask = useCallback(
    async (task: TdzTask, contact: TdzContact, role?: string | null) =>
      linkContactToCard(task.project_id, contact, role, task.id),
    [linkContactToCard],
  );


  const createTag = useCallback(
    async (name: string, color = '#6366f1') => {
      if (!userId) return null;
      const clean = name.trim();
      if (!clean) return null;
      const existing = tags.find((t) => t.name.toLowerCase() === clean.toLowerCase());
      if (existing) return existing;
      const { data, error } = await supabase
        .from('tdz_tags')
        .insert({ user_id: userId, name: clean, color } as never)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      setTags((prev) => [...prev, data as TdzTag].sort((a, b) => a.name.localeCompare(b.name)));
      return data as TdzTag;
    },
    [userId, tags],
  );

  const updateTag = useCallback(async (id: string, patch: Partial<TdzTag>) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...(patch as TdzTag) } : t)));
    const { error } = await supabase.from('tdz_tags').update(patch).eq('id', id);
    if (error) toast.error(error.message);
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('tdz_tags').delete().eq('id', id);
    if (error) toast.error(error.message);
  }, []);

  return {
    loading,
    cards,
    tasks,
    events,
    activities,
    stakeholders,
    documents,
    connections,
    contacts,
    tags,
    createTag,
    updateTag,
    deleteTag,
    cardById,
    childrenOf,
    reload: load,
    patchCard,
    createCard,
    deleteCard,
    toggleTask,
    addTask,
    updateTask,
    setTaskParent,
    deleteTask,
    moveTasksToCard,
    importCardAsTask,
    reorderTasks,
    reorderCards,
    addActivity,
    addStakeholder,
    removeStakeholder,
    addDocument,
    updateDocument,
    removeDocument,
    createContact,
    updateContact,
    deleteContact,
    syncContacts,
    syncCalendar,
    syncTasks,
    updateEvent,
    deleteEvent,
    googleIdentities,
    addGoogleAccount,
    setAccountSlot,
    removeAccount,
    swapAccounts,

    linkContactToCard,
    linkContactToTask,
    setConnections,
  };
};

