import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PolicyStatus = 'draft' | 'commenting' | 'voting' | 'passed' | 'archived';
export type VoteType = 'agree' | 'abstain' | 'disagree' | 'block';
export type Phase = 'visioning' | 'drafting' | 'community-review' | 'finalized';

export interface Policy {
  id: string;
  title: string;
  summary: string;
  context_snippet: string | null;
  status: PolicyStatus;
  created_at: string;
  voting_start: string | null;
  voting_deadline: string | null;
  passed_at: string | null;
  category: string | null;
  parent_id: string | null;
}

export interface Proposal {
  id: string;
  policy_id: string;
  title: string;
  description: string;
  author: string;
  created_by: string | null;
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
  user_id: string | null;
  email: string | null;
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

  const updatePolicy = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; summary?: string; status?: PolicyStatus; voting_start?: string | null; voting_deadline?: string | null; passed_at?: string | null; category?: string | null; parent_id?: string | null }) => {
      const { error } = await supabase.from('gov_policies').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-policies'] }),
  });

  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_policies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-policies'] }),
  });

  return { addPolicy, updateStatus, updatePolicy, deletePolicy };
}

// Policy Votes
export function usePolicyVotes() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['gov-policy-votes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_policy_votes').select('policy_id, user_id, vote');
      if (error) throw error;
      return data as { policy_id: string; user_id: string; vote: VoteType }[];
    },
  });

  const castVote = useMutation({
    mutationFn: async ({ policyId, vote }: { policyId: string; vote: VoteType }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to vote');
      const { error } = await supabase.from('gov_policy_votes').upsert(
        { policy_id: policyId, user_id: user.id, vote },
        { onConflict: 'policy_id,user_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-policy-votes'] }),
  });

  const removeVote = useMutation({
    mutationFn: async (policyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('gov_policy_votes').delete().eq('policy_id', policyId).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-policy-votes'] }),
  });

  return { votes: query.data ?? [], castVote, removeVote };
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

export function useDeleteProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ proposalId, policyId }: { proposalId: string; policyId: string }) => {
      const { error } = await supabase.from('gov_proposals').delete().eq('id', proposalId);
      if (error) throw error;
      return policyId;
    },
    onSuccess: (policyId) => {
      qc.invalidateQueries({ queryKey: ['gov-proposals', policyId] });
      qc.invalidateQueries({ queryKey: ['gov-votes-all'] });
    },
  });
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

// Policy Likes
export function usePolicyLikes() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['gov-policy-likes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_policy_likes').select('policy_id, user_id');
      if (error) throw error;
      return data as { policy_id: string; user_id: string }[];
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (policyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      const existing = (query.data ?? []).find(
        (l) => l.policy_id === policyId && l.user_id === user.id
      );
      if (existing) {
        const { error } = await supabase.from('gov_policy_likes').delete().eq('policy_id', policyId).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gov_policy_likes').insert({ policy_id: policyId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-policy-likes'] }),
  });

  return { likes: query.data ?? [], toggleLike };
}

// Governance role for current user (auto-links by email if not yet linked)
export function useGovRole() {
  const membersQuery = useMembers();
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['gov-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const members = membersQuery.data ?? [];
      // First try matching by user_id
      let match = members.find(m => m.user_id === user.id);
      if (!match && user.email) {
        // Try matching by email and auto-link
        match = members.find(m => m.email?.toLowerCase() === user.email?.toLowerCase() && !m.user_id);
        if (match) {
          await supabase.from('gov_members').update({ user_id: user.id }).eq('id', match.id);
          qc.invalidateQueries({ queryKey: ['gov-members'] });
        }
      }
      return match?.role ?? null;
    },
    enabled: !membersQuery.isLoading,
  });
}

// Check if governance role can participate (vote/comment)
export function useCanParticipate() {
  const { data: govRole } = useGovRole();
  // community-member can only view
  return govRole !== 'community-member';
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

export function useMemberMutations() {
  const qc = useQueryClient();

  const addMember = useMutation({
    mutationFn: async (m: { name: string; role: string; avatar: string; email?: string }) => {
      const { error } = await supabase.from('gov_members').insert({
        name: m.name,
        role: m.role,
        avatar: m.avatar,
        email: m.email || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-members'] }),
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; role?: string; avatar?: string; email?: string }) => {
      const { error } = await supabase.from('gov_members').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-members'] }),
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-members'] }),
  });

  return { addMember, updateMember, deleteMember };
}

// Docket
export function useDocket() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['gov-docket'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_docket_items').select('*').order('created_at');
      if (error) throw error;
      return data as { id: string; policy_id: string; added_by: string | null; created_at: string }[];
    },
  });

  const addToDocket = useMutation({
    mutationFn: async (policyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('gov_docket_items').insert({ policy_id: policyId, added_by: user?.id ?? null });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-docket'] }),
  });

  const removeFromDocket = useMutation({
    mutationFn: async (policyId: string) => {
      const { error } = await supabase.from('gov_docket_items').delete().eq('policy_id', policyId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-docket'] }),
  });

  const isOnDocket = (policyId: string) => (query.data ?? []).some(d => d.policy_id === policyId);

  const toggleDocket = (policyId: string) => {
    if (isOnDocket(policyId)) {
      removeFromDocket.mutate(policyId);
    } else {
      addToDocket.mutate(policyId);
    }
  };

  return { docketItems: query.data ?? [], isLoading: query.isLoading, isOnDocket, toggleDocket };
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
