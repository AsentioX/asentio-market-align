import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActionItem {
  id: string;
  topic_id: string;
  task_description: string;
  driver_id: string | null;
  deadline: string | null;
  is_completed: boolean;
  friction_point: string | null;
  outcome: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TopicHistoryEvent {
  id: string;
  topic_id: string;
  event_type: 'description_updated' | 'action_created' | 'action_completed' | 'insight_added' | 'note';
  payload: Record<string, any>;
  actor_id: string | null;
  created_at: string;
}

export interface TopicAssignee {
  id: string;
  topic_id: string;
  member_id: string;
  role: string;
  created_at: string;
}

export interface TopicRelation {
  id: string;
  topic_id: string;
  related_topic_id: string;
  relation_type: string;
}

// ---------- Action Items ----------
export function useActionItems(topicId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['gov-action-items', topicId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('gov_action_items').select('*').order('created_at', { ascending: false });
      if (topicId) q = q.eq('topic_id', topicId);
      const { data, error } = await q;
      if (error) throw error;
      return data as ActionItem[];
    },
  });

  const addActionItem = useMutation({
    mutationFn: async (input: { topic_id: string; task_description: string; driver_id?: string | null; deadline?: string | null; friction_point?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('gov_action_items').insert({
        topic_id: input.topic_id,
        task_description: input.task_description,
        driver_id: input.driver_id ?? null,
        deadline: input.deadline ?? null,
        friction_point: input.friction_point ?? null,
        created_by: user?.id ?? null,
      }).select().single();
      if (error) throw error;
      // Append history
      await supabase.from('gov_topic_history').insert({
        topic_id: input.topic_id,
        event_type: 'action_created',
        actor_id: user?.id ?? null,
        payload: { action_id: data.id, task_description: input.task_description, driver_id: input.driver_id ?? null },
      });
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['gov-action-items'] });
      qc.invalidateQueries({ queryKey: ['gov-topic-history', vars.topic_id] });
      qc.invalidateQueries({ queryKey: ['gov-policies'] });
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ item, outcome }: { item: ActionItem; outcome?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const next = !item.is_completed;
      const { error } = await supabase.from('gov_action_items').update({
        is_completed: next,
        completed_at: next ? new Date().toISOString() : null,
        outcome: outcome ?? item.outcome,
      }).eq('id', item.id);
      if (error) throw error;
      if (next) {
        await supabase.from('gov_topic_history').insert({
          topic_id: item.topic_id,
          event_type: 'action_completed',
          actor_id: user?.id ?? null,
          payload: { action_id: item.id, task_description: item.task_description, outcome: outcome ?? null },
        });
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['gov-action-items'] });
      qc.invalidateQueries({ queryKey: ['gov-topic-history', vars.item.topic_id] });
    },
  });

  const updateActionItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActionItem> & { id: string }) => {
      const { error } = await supabase.from('gov_action_items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-action-items'] }),
  });

  const deleteActionItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_action_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-action-items'] }),
  });

  return { actionItems: query.data ?? [], isLoading: query.isLoading, addActionItem, toggleComplete, updateActionItem, deleteActionItem };
}

// ---------- Topic History ----------
export function useTopicHistory(topicId?: string) {
  return useQuery({
    queryKey: ['gov-topic-history', topicId],
    enabled: !!topicId,
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_topic_history').select('*').eq('topic_id', topicId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as TopicHistoryEvent[];
    },
  });
}

// ---------- Pit Crew (assignees) ----------
export function useTopicAssignees(topicId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['gov-topic-assignees', topicId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('gov_topic_assignees').select('*');
      if (topicId) q = q.eq('topic_id', topicId);
      const { data, error } = await q;
      if (error) throw error;
      return data as TopicAssignee[];
    },
  });

  const assign = useMutation({
    mutationFn: async ({ topic_id, member_id, role = 'contributor' }: { topic_id: string; member_id: string; role?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('gov_topic_assignees').insert({ topic_id, member_id, role, assigned_by: user?.id ?? null });
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-topic-assignees'] }),
  });

  const unassign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_topic_assignees').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-topic-assignees'] }),
  });

  return { assignees: query.data ?? [], isLoading: query.isLoading, assign, unassign };
}

// ---------- Topic Relations ----------
export function useTopicRelations(topicId?: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['gov-topic-relations', topicId],
    enabled: !!topicId,
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_topic_relations').select('*').or(`topic_id.eq.${topicId},related_topic_id.eq.${topicId}`);
      if (error) throw error;
      return data as TopicRelation[];
    },
  });

  const link = useMutation({
    mutationFn: async ({ topic_id, related_topic_id }: { topic_id: string; related_topic_id: string }) => {
      const { error } = await supabase.from('gov_topic_relations').insert({ topic_id, related_topic_id });
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-topic-relations'] }),
  });

  const unlink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_topic_relations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-topic-relations'] }),
  });

  return { relations: query.data ?? [], link, unlink };
}

// ---------- Topic field updates (priority/owner/vibe/elephant) ----------
export function useTopicFieldMutations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; priority?: number; owner_id?: string | null; vibe?: string | null; elephant_in_room?: string | null; last_discussed_at?: string | null }) => {
      const { error } = await supabase.from('gov_policies').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gov-policies'] });
    },
  });
}

// ---------- Heat score helpers ----------
export function daysSince(iso?: string | null): number {
  if (!iso) return 9999;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function heatScore(priority: number | null | undefined, lastDiscussedAt: string | null | undefined, createdAt: string): number {
  const p = priority ?? 3;
  const ref = lastDiscussedAt ?? createdAt;
  const days = daysSince(ref);
  return p * 2 + days;
}

export function isStale(priority: number | null | undefined, lastDiscussedAt: string | null | undefined, createdAt: string): boolean {
  if ((priority ?? 3) < 4) return false;
  const days = daysSince(lastDiscussedAt ?? createdAt);
  return days >= 7;
}
