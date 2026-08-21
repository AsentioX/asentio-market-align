import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { seedToDoooZ } from './seed';
import type {
  TdzActivity,
  TdzCard,
  TdzConnection,
  TdzDocument,
  TdzEvent,
  TdzStakeholder,
  TdzTask,
} from './types';

export const useToDoooZ = (userId: string | undefined) => {
  const [cards, setCards] = useState<TdzCard[]>([]);
  const [tasks, setTasks] = useState<TdzTask[]>([]);
  const [events, setEvents] = useState<TdzEvent[]>([]);
  const [activities, setActivities] = useState<TdzActivity[]>([]);
  const [stakeholders, setStakeholders] = useState<TdzStakeholder[]>([]);
  const [documents, setDocuments] = useState<TdzDocument[]>([]);
  const [connections, setConnections] = useState<TdzConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    const [c, t, e, a, s, d, g] = await Promise.all([
      supabase.from('tdz_projects').select('*').order('sort_order'),
      supabase.from('tdz_tasks').select('*').order('rank'),
      supabase.from('tdz_calendar_events').select('*').order('starts_at'),
      supabase.from('tdz_activity_logs').select('*').order('occurred_at', { ascending: false }),
      supabase.from('tdz_stakeholders').select('*'),
      supabase.from('tdz_documents').select('*').order('added_at'),
      supabase.from('tdz_google_connections').select('*'),
    ]);
    setCards((c.data ?? []) as TdzCard[]);
    setTasks((t.data ?? []) as TdzTask[]);
    setEvents((e.data ?? []) as TdzEvent[]);
    setActivities((a.data ?? []) as TdzActivity[]);
    setStakeholders((s.data ?? []) as TdzStakeholder[]);
    setDocuments((d.data ?? []) as TdzDocument[]);
    setConnections((g.data ?? []) as TdzConnection[]);
    setLoading(false);
    return (c.data ?? []).length;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const count = await load();
      if (cancelled || count !== 0) return;
      await seedToDoooZ(userId);
      await load();
    })();
    return () => {
      cancelled = true;
    };
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

  const toggleTask = useCallback(
    async (task: TdzTask) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
      await supabase.from('tdz_tasks').update({ done: !task.done }).eq('id', task.id);
      await patchCard(task.project_id, {}, true);
    },
    [patchCard],
  );

  const addTask = useCallback(
    async (projectId: string, title: string, due?: string | null) => {
      if (!userId || !title.trim()) return;
      const { data, error } = await supabase
        .from('tdz_tasks')
        .insert({ user_id: userId, project_id: projectId, title: title.trim(), due_date: due ?? null })
        .select()
        .single();
      if (error) return toast.error(error.message);
      setTasks((prev) => [...prev, data as TdzTask]);
    },
    [userId],
  );

  const updateTask = useCallback(async (id: string, patch: Partial<TdzTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...(patch as TdzTask) } : t)));
    await supabase.from('tdz_tasks').update(patch).eq('id', id);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('tdz_tasks').delete().eq('id', id);
  }, []);

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

  return {
    loading,
    cards,
    tasks,
    events,
    activities,
    stakeholders,
    documents,
    connections,
    cardById,
    childrenOf,
    reload: load,
    patchCard,
    createCard,
    deleteCard,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    addActivity,
    addStakeholder,
    removeStakeholder,
    addDocument,
    updateDocument,
    removeDocument,
    setConnections,
  };
};
