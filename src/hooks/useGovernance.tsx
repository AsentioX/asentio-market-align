import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PolicyStatus = 'draft' | 'active' | 'under-revision' | 'archived';
export type VoteType = 'agree' | 'abstain' | 'disagree' | 'block';
export type Phase = 'visioning' | 'drafting' | 'community-review' | 'finalized';

export interface Policy {
  id: string;
  title: string;
  summary: string;
  context_snippet: string | null;
  status: PolicyStatus;
  created_at: string;
}

export interface Proposal {
  id: string;
  policy_id: string;
  title: string;
  description: string;
  author: string;
  created_at: string;
}

export interface VoteTally {
  agree: number;
  abstain: number;
  disagree: number;
  block: number;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Draft {
  id: string;
  title: string;
  summary: string;
  context_snippet: string | null;
}

// Phase
export function usePhase() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['gov-phase'],
    queryFn: async () => {
      const { data } = await supabase.from('gov_settings').select('value').eq('key', 'phase').single();
      return (data?.value ?? 'visioning') as Phase;
    },
  });

  const mutation = useMutation({
    mutationFn: async (phase: Phase) => {
      await supabase.from('gov_settings').update({ value: phase }).eq('key', 'phase');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-phase'] }),
  });

  return { phase: query.data ?? 'visioning', setPhase: mutation.mutate, isLoading: query.isLoading };
}

// Policies
export function usePolicies() {
  return useQuery({
    queryKey: ['gov-policies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_policies').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Policy[];
    },
  });
}

export function usePolicy(id: string | undefined) {
  return useQuery({
    queryKey: ['gov-policies', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_policies').select('*').eq('id', id!).single();
      if (error) throw error;
      return data as Policy;
    },
  });
}

export function usePolicyMutations() {
  const qc = useQueryClient();

  const addPolicy = useMutation({
    mutationFn: async (p: { title: string; summary: string; context_snippet?: string; status?: PolicyStatus }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('gov_policies').insert({
        title: p.title,
        summary: p.summary,
        context_snippet: p.context_snippet ?? null,
        status: p.status ?? 'draft',
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-policies'] }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PolicyStatus }) => {
      const { error } = await supabase.from('gov_policies').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-policies'] }),
  });

  return { addPolicy, updateStatus };
}

// Proposals
export function useProposals(policyId: string | undefined) {
  return useQuery({
    queryKey: ['gov-proposals', policyId],
    enabled: !!policyId,
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_proposals').select('*').eq('policy_id', policyId!).order('created_at', { ascending: true });
      if (error) throw error;
      return data as Proposal[];
    },
  });
}

export function useProposalMutations() {
  const qc = useQueryClient();

  const addProposal = useMutation({
    mutationFn: async (p: { policy_id: string; title: string; description: string; author?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('gov_proposals').insert({
        policy_id: p.policy_id,
        title: p.title,
        description: p.description,
        author: p.author ?? 'Anonymous',
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['gov-proposals', vars.policy_id] }),
  });

  return { addProposal };
}

// Votes
export function useVoteTally(proposalId: string) {
  return useQuery({
    queryKey: ['gov-votes', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_votes').select('vote').eq('proposal_id', proposalId);
      if (error) throw error;
      const tally: VoteTally = { agree: 0, abstain: 0, disagree: 0, block: 0 };
      data?.forEach((v) => { tally[v.vote as VoteType]++; });
      return tally;
    },
  });
}

export function useCastVote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, vote }: { proposalId: string; vote: VoteType }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to vote');
      // Upsert: one vote per user per proposal
      const { error } = await supabase.from('gov_votes').upsert(
        { proposal_id: proposalId, user_id: user.id, vote },
        { onConflict: 'proposal_id,user_id' }
      );
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['gov-votes', vars.proposalId] }),
  });
}

// Members
export function useMembers() {
  return useQuery({
    queryKey: ['gov-members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_members').select('*').order('created_at');
      if (error) throw error;
      return data as Member[];
    },
  });
}

// Drafts
export function useDrafts() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['gov-drafts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_drafts').select('*').order('created_at');
      if (error) throw error;
      return data as Draft[];
    },
  });

  const addDrafts = useMutation({
    mutationFn: async (drafts: { title: string; summary: string; context_snippet?: string }[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('gov_drafts').insert(
        drafts.map((d) => ({ ...d, created_by: user?.id ?? null }))
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-drafts'] }),
  });

  const removeDraft = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_drafts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-drafts'] }),
  });

  return { drafts: query.data ?? [], isLoading: query.isLoading, addDrafts, removeDraft };
}
