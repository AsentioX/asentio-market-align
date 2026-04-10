import { create } from 'zustand';

export type Phase = 'visioning' | 'drafting' | 'community-review' | 'finalized';
export type PolicyStatus = 'draft' | 'active' | 'under-revision' | 'archived';
export type VoteType = 'agree' | 'abstain' | 'disagree' | 'block';

export interface PolicyCard {
  id: string;
  title: string;
  summary: string;
  contextSnippet: string;
  status: PolicyStatus;
  createdAt: string;
  proposals: Proposal[];
}

export interface DraftCard {
  id: string;
  title: string;
  summary: string;
  contextSnippet: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  votes: Record<VoteType, number>;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface GovernanceState {
  phase: Phase;
  setPhase: (p: Phase) => void;
  policies: PolicyCard[];
  addPolicy: (card: Omit<PolicyCard, 'id' | 'createdAt' | 'proposals'>) => void;
  updatePolicyStatus: (id: string, status: PolicyStatus) => void;
  archivePolicy: (id: string) => void;
  drafts: DraftCard[];
  setDrafts: (d: DraftCard[]) => void;
  removeDraft: (id: string) => void;
  addProposal: (policyId: string, proposal: Omit<Proposal, 'id' | 'createdAt' | 'votes'>) => void;
  castVote: (policyId: string, proposalId: string, vote: VoteType) => void;
  members: Member[];
}

const SAMPLE_MEMBERS: Member[] = [
  { id: '1', name: 'Amara Okafor', role: 'Facilitator', avatar: 'AO' },
  { id: '2', name: 'Jordan Lee', role: 'Policy Lead', avatar: 'JL' },
  { id: '3', name: 'Priya Sharma', role: 'Community Rep', avatar: 'PS' },
  { id: '4', name: 'Marcus Chen', role: 'Technical Advisor', avatar: 'MC' },
  { id: '5', name: 'Sofia Reyes', role: 'Secretary', avatar: 'SR' },
];

let idCounter = 0;
const uid = () => `gov-${Date.now()}-${++idCounter}`;

export const useGovernanceStore = create<GovernanceState>((set) => ({
  phase: 'visioning',
  setPhase: (phase) => set({ phase }),

  policies: [
    {
      id: 'seed-1',
      title: 'Decision-Making Framework',
      summary: 'All strategic decisions require a two-thirds supermajority from voting members. Operational decisions may be made by designated leads with a 48-hour objection window.',
      contextSnippet: '"We agreed that big-picture strategy should need broad consensus, but day-to-day ops can move faster with a cooling-off period."',
      status: 'active',
      createdAt: new Date().toISOString(),
      proposals: [],
    },
    {
      id: 'seed-2',
      title: 'Community Engagement Protocol',
      summary: 'Monthly open forums and quarterly surveys ensure ongoing community input. All engagement results are published within 5 business days.',
      contextSnippet: '"Transparency is non-negotiable. If we ask for input, we publish the results."',
      status: 'draft',
      createdAt: new Date().toISOString(),
      proposals: [],
    },
  ],

  addPolicy: (card) =>
    set((s) => ({
      policies: [
        ...s.policies,
        { ...card, id: uid(), createdAt: new Date().toISOString(), proposals: [] },
      ],
    })),

  updatePolicyStatus: (id, status) =>
    set((s) => ({
      policies: s.policies.map((p) => (p.id === id ? { ...p, status } : p)),
    })),

  archivePolicy: (id) =>
    set((s) => ({
      policies: s.policies.map((p) => (p.id === id ? { ...p, status: 'archived' as PolicyStatus } : p)),
    })),

  drafts: [],
  setDrafts: (drafts) => set({ drafts }),
  removeDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),

  addProposal: (policyId, proposal) =>
    set((s) => ({
      policies: s.policies.map((p) =>
        p.id === policyId
          ? {
              ...p,
              proposals: [
                ...p.proposals,
                { ...proposal, id: uid(), createdAt: new Date().toISOString(), votes: { agree: 0, abstain: 0, disagree: 0, block: 0 } },
              ],
            }
          : p,
      ),
    })),

  castVote: (policyId, proposalId, vote) =>
    set((s) => ({
      policies: s.policies.map((p) =>
        p.id === policyId
          ? {
              ...p,
              proposals: p.proposals.map((pr) =>
                pr.id === proposalId ? { ...pr, votes: { ...pr.votes, [vote]: pr.votes[vote] + 1 } } : pr,
              ),
            }
          : p,
      ),
    })),

  members: SAMPLE_MEMBERS,
}));
