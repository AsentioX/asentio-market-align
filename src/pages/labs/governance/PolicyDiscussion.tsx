import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePolicy, useProposals, useProposalMutations, useVoteTally, useCastVote, VoteType } from '@/hooks/useGovernance';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const VOTE_CONFIG: { type: VoteType; label: string; color: string; bg: string }[] = [
  { type: 'agree', label: 'Agree', color: '#10b981', bg: 'bg-emerald-500 hover:bg-emerald-600' },
  { type: 'abstain', label: 'Abstain', color: '#eab308', bg: 'bg-yellow-500 hover:bg-yellow-600' },
  { type: 'disagree', label: 'Disagree', color: '#ef4444', bg: 'bg-red-500 hover:bg-red-600' },
  { type: 'block', label: 'Block', color: '#f97316', bg: 'bg-orange-500 hover:bg-orange-600' },
];

const ProposalVotes = ({ proposalId }: { proposalId: string }) => {
  const { data: tally } = useVoteTally(proposalId);
  const castVote = useCastVote();

  if (!tally) return null;

  const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);
  const chartData = VOTE_CONFIG.map((v) => ({ name: v.label, value: tally[v.type], color: v.color })).filter(d => d.value > 0);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
        {VOTE_CONFIG.map((v) => (
          <button
            key={v.type}
            onClick={() => castVote.mutate({ proposalId, vote: v.type })}
            disabled={castVote.isPending}
            className={`${v.bg} text-white rounded-xl px-3 py-3 text-xs font-bold transition-colors flex flex-col items-center gap-1 disabled:opacity-50`}
          >
            <span>{v.label}</span>
            <span className="text-white/80 text-lg">{tally[v.type]}</span>
          </button>
        ))}
      </div>

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

const PolicyDiscussion = () => {
  const { id } = useParams<{ id: string }>();
  const { data: policy, isLoading: policyLoading } = usePolicy(id);
  const { data: proposals = [], isLoading: proposalsLoading } = useProposals(id);
  const { addProposal } = useProposalMutations();

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
        <Link to="/labs/governance/library" className="text-teal-600 text-sm mt-2 inline-block">← Back to Library</Link>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!title.trim()) return;
    addProposal.mutate({ policy_id: policy.id, title, description: desc, author: 'You' });
    setTitle('');
    setDesc('');
    setShowForm(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/labs/governance/library" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
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
          <h3 className="font-semibold text-gray-800">Proposals</h3>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> New Proposal
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-teal-200 p-5 shadow-sm space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proposal title…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the proposal…"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={addProposal.isPending} className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium">Submit</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-gray-500 text-xs">Cancel</button>
            </div>
          </div>
        )}

        {proposals.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 py-6 text-center">No proposals yet. Start the conversation!</p>
        )}

        {proposals.map((proposal) => (
          <div key={proposal.id} className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-800">{proposal.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">by {proposal.author}</p>
              </div>
            </div>
            {proposal.description && <p className="text-sm text-gray-600 mb-4">{proposal.description}</p>}
            <ProposalVotes proposalId={proposal.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyDiscussion;
