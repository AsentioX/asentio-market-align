import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePolicy, useProposals, useProposalMutations, useVoteTally, useCastVote, useCanParticipate, useMembers, VoteType, useDeleteProposal, useGovRole } from '@/hooks/useGovernance';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Plus, Loader2, Trash2 } from 'lucide-react';
import { PitCrewSidebar } from '@/components/governance/PitCrewSidebar';
import { ActionItemsPanel } from '@/components/governance/ActionItemsPanel';
import { HistoryThread } from '@/components/governance/HistoryThread';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const VOTE_CONFIG: { type: VoteType; label: string; color: string; bg: string }[] = [
  { type: 'agree', label: 'Agree', color: '#10b981', bg: 'bg-emerald-500 hover:bg-emerald-600' },
  { type: 'abstain', label: 'Abstain', color: '#eab308', bg: 'bg-yellow-500 hover:bg-yellow-600' },
  { type: 'disagree', label: 'Disagree', color: '#ef4444', bg: 'bg-red-500 hover:bg-red-600' },
];

const ProposalVotes = ({ proposalId, canParticipate, isVotingMode }: { proposalId: string; canParticipate: boolean; isVotingMode: boolean }) => {
  const { data: tally } = useVoteTally(proposalId);
  const castVote = useCastVote();

  if (!tally) return null;

  const totalVotes = tally.agree + tally.abstain + tally.disagree;
  const chartData = VOTE_CONFIG.map((v) => ({ name: v.label, value: tally[v.type], color: v.color })).filter(d => d.value > 0);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      {isVotingMode && (
        <div className="flex gap-2 flex-1">
          {VOTE_CONFIG.map((v) => (
            <button
              key={v.type}
              onClick={() => canParticipate && castVote.mutate({ proposalId, vote: v.type })}
              disabled={castVote.isPending || !canParticipate}
              className={`${v.bg} text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50`}
            >
              <span>{v.label}</span>
              <span className="text-white/80">{tally[v.type]}</span>
            </button>
          ))}
        </div>
      )}

      {totalVotes > 0 && (
        <div className="w-28 h-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={20} outerRadius={40} dataKey="value" strokeWidth={2} stroke="#fff">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} vote${value !== 1 ? 's' : ''}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

function useAllProposalTallies(proposalIds: string[]) {
  return useQuery({
    queryKey: ['gov-votes-all', proposalIds],
    enabled: proposalIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_votes').select('proposal_id, vote').in('proposal_id', proposalIds);
      if (error) throw error;
      const tallies: Record<string, { agree: number; abstain: number; disagree: number; block: number }> = {};
      for (const id of proposalIds) {
        tallies[id] = { agree: 0, abstain: 0, disagree: 0, block: 0 };
      }
      data?.forEach((v) => {
        if (tallies[v.proposal_id]) {
          tallies[v.proposal_id][v.vote as VoteType]++;
        }
      });
      return tallies;
    },
  });
}

const parseBgColor = (avatar: string) => {
  const parts = avatar.split('|');
  return { emoji: parts[0] || '🐻', bgColor: parts[1] || 'bg-teal-100 text-teal-700' };
};

const PolicyDiscussion = () => {
  const { id } = useParams<{ id: string }>();
  const { data: policy, isLoading: policyLoading } = usePolicy(id);
  const { data: proposals = [], isLoading: proposalsLoading } = useProposals(id);
  const { addProposal } = useProposalMutations();
  const deleteProposal = useDeleteProposal();
  const canParticipate = useCanParticipate();
  const { user, isAdmin } = useAuth();
  const { data: members = [] } = useMembers();

  // Resolve current user's member name (by user_id or email)
  const currentMember = useMemo(() => {
    if (!user) return null;
    return members.find(m => m.user_id === user.id) 
      ?? members.find(m => m.email?.toLowerCase() === user.email?.toLowerCase()) 
      ?? null;
  }, [user, members]);

  const getMemberByName = (name: string) => members.find(m => m.name === name);

  const proposalIds = useMemo(() => proposals.map(p => p.id), [proposals]);
  const { data: tallies } = useAllProposalTallies(proposalIds);

  const sortedProposals = useMemo(() => {
    if (!tallies) return proposals;
    return [...proposals].sort((a, b) => {
      const ta = tallies[a.id] || { agree: 0, disagree: 0, abstain: 0 };
      const tb = tallies[b.id] || { agree: 0, disagree: 0, abstain: 0 };
      if (tb.agree !== ta.agree) return tb.agree - ta.agree;
      if (tb.disagree !== ta.disagree) return tb.disagree - ta.disagree;
      return tb.abstain - ta.abstain;
    });
  }, [proposals, tallies]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  if (policyLoading || proposalsLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>;
  }

  if (!policy) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-gray-400">Policy not found.</p>
        <Link to="/labs/fieldofviews/library" className="text-teal-600 text-sm mt-2 inline-block">← Back to Library</Link>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!title.trim()) return;
    const authorName = currentMember?.name ?? user?.email ?? 'Anonymous';
    addProposal.mutate({ policy_id: policy.id, title, description: desc, author: authorName });
    setTitle('');
    setDesc('');
    setShowForm(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/labs/fieldofviews/library" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">{policy.title}</h2>
        <p className="text-sm text-gray-500 mt-2">{policy.summary}</p>
        {policy.context_snippet && (
          <blockquote className="mt-3 pl-3 border-l-2 border-teal-200 text-xs text-gray-400 italic">
            {policy.context_snippet}
          </blockquote>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Comments</h3>
          {canParticipate && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Comment
            </button>
          )}
        </div>

        {!canParticipate && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            Community Members have view-only access. Contact an admin to upgrade your role.
          </p>
        )}

        {showForm && (
          <div className="bg-white rounded-xl border border-teal-200 p-5 shadow-sm space-y-3">
            {currentMember && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {(() => {
                  const { emoji, bgColor } = parseBgColor(currentMember.avatar);
                  return (
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${bgColor}`}>{emoji}</span>
                  );
                })()}
                Posting as <span className="font-medium text-gray-700">{currentMember.name}</span>
              </div>
            )}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Comment title…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe your comment…"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={addProposal.isPending} className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium">Submit</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-gray-500 text-xs">Cancel</button>
            </div>
          </div>
        )}

        {sortedProposals.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 py-6 text-center">No comments yet. Start the conversation!</p>
        )}

        {sortedProposals.map((proposal) => {
          const member = getMemberByName(proposal.author);
          const avatarInfo = member ? parseBgColor(member.avatar) : null;

          return (
            <div key={proposal.id} className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                {avatarInfo ? (
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${avatarInfo.bgColor}`}>
                    {avatarInfo.emoji}
                  </span>
                ) : (
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-500 flex-shrink-0">
                    {proposal.author.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{proposal.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by <span className="font-medium text-gray-600">{proposal.author}</span>
                    {member && <span className="ml-1 text-gray-300">· {member.role}</span>}
                  </p>
                </div>
                {((user && proposal.created_by === user.id) || isAdmin) && (
                  <button
                    onClick={() => deleteProposal.mutate({ proposalId: proposal.id, policyId: policy.id })}
                    disabled={deleteProposal.isPending}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {proposal.description && <p className="text-sm text-gray-600 mb-4 ml-11">{proposal.description}</p>}
              <div className="ml-11">
                <ProposalVotes proposalId={proposal.id} canParticipate={canParticipate} isVotingMode={!!policy.voting_start && !policy.passed_at} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PolicyDiscussion;
