import { useState, useMemo } from 'react';
import { usePolicies, usePolicyMutations, usePolicyLikes, usePolicyVotes, Policy, PolicyStatus, VoteType } from '@/hooks/useGovernance';
import { MessageCircle, ThumbsUp, Vote, Filter, ArrowUpDown, ChevronDown, ChevronRight, Calendar, Clock, CheckCircle2, Archive, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const statusStyle: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  active: 'bg-emerald-100 text-emerald-700',
  'under-revision': 'bg-amber-100 text-amber-700',
  archived: 'bg-red-100 text-red-500',
};

const VOTE_OPTIONS: { value: VoteType; label: string; color: string }[] = [
  { value: 'agree', label: 'Agree', color: 'bg-emerald-500' },
  { value: 'abstain', label: 'Abstain', color: 'bg-gray-400' },
  { value: 'disagree', label: 'Disagree', color: 'bg-amber-500' },
  { value: 'block', label: 'Block', color: 'bg-red-500' },
];

type SortField = 'created_at' | 'title' | 'voting_deadline' | 'status';
type FilterStatus = 'all' | PolicyStatus;
type SectionKey = 'voting' | 'discussion' | 'passed' | 'archived';

const PolicyLibrary = () => {
  const { data: policies = [] } = usePolicies();
  const { updateStatus, updatePolicy } = usePolicyMutations();
  const { likes, toggleLike } = usePolicyLikes();
  const { votes, castVote, removeVote } = usePolicyVotes();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [editingTimeline, setEditingTimeline] = useState<string | null>(null);

  // Gather unique categories
  const categories = useMemo(() => {
    const cats = new Set(policies.map(p => p.category).filter(Boolean) as string[]);
    return Array.from(cats).sort();
  }, [policies]);

  // Vote helpers
  const getVoteTally = (policyId: string) => {
    const pv = votes.filter(v => v.policy_id === policyId);
    return { agree: pv.filter(v => v.vote === 'agree').length, abstain: pv.filter(v => v.vote === 'abstain').length, disagree: pv.filter(v => v.vote === 'disagree').length, block: pv.filter(v => v.vote === 'block').length, total: pv.length };
  };
  const getUserVote = (policyId: string) => user ? votes.find(v => v.policy_id === policyId && v.user_id === user.id)?.vote : undefined;

  const getLikeCount = (policyId: string) => likes.filter(l => l.policy_id === policyId).length;
  const hasLiked = (policyId: string) => !!user && likes.some(l => l.policy_id === policyId && l.user_id === user.id);

  const handleLike = (policyId: string) => {
    if (!user) { toast({ title: 'Sign in required', variant: 'destructive' }); return; }
    toggleLike.mutate(policyId);
  };

  const handleVote = (policyId: string, vote: VoteType) => {
    if (!user) { toast({ title: 'Sign in required', variant: 'destructive' }); return; }
    const current = getUserVote(policyId);
    if (current === vote) { removeVote.mutate(policyId); } else { castVote.mutate({ policyId, vote }); }
  };

  // Classify policies into sections
  const classifyPolicy = (p: Policy): SectionKey => {
    if (p.status === 'archived') return 'archived';
    if (p.status === 'active' && p.passed_at) return 'passed';
    if (p.voting_start && !p.passed_at) return 'voting';
    return 'discussion';
  };

  // Filter & sort
  const filtered = useMemo(() => {
    let list = [...policies];
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    if (filterCategory !== 'all') list = list.filter(p => p.category === filterCategory);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'voting_deadline') cmp = (a.voting_deadline ?? '').localeCompare(b.voting_deadline ?? '');
      else cmp = a.created_at.localeCompare(b.created_at);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [policies, filterStatus, filterCategory, sortField, sortAsc]);

  // Group by section, then by category within section
  const sections: { key: SectionKey; label: string; icon: React.ReactNode; policies: Policy[] }[] = useMemo(() => {
    const groups: Record<SectionKey, Policy[]> = { voting: [], discussion: [], passed: [], archived: [] };
    filtered.forEach(p => groups[classifyPolicy(p)].push(p));
    return [
      { key: 'voting' as SectionKey, label: 'Under Voting', icon: <Vote className="w-5 h-5 text-indigo-600" />, policies: groups.voting },
      { key: 'discussion' as SectionKey, label: 'Under Discussion', icon: <MessageCircle className="w-5 h-5 text-teal-600" />, policies: groups.discussion },
      { key: 'passed' as SectionKey, label: 'Passed Policies', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, policies: groups.passed },
      { key: 'archived' as SectionKey, label: 'Archived', icon: <Archive className="w-5 h-5 text-gray-400" />, policies: groups.archived },
    ];
  }, [filtered]);

  // Group policies by category within a section
  const groupByCategory = (pols: Policy[]) => {
    const uncategorized: Policy[] = [];
    const catMap: Record<string, Policy[]> = {};
    pols.forEach(p => {
      if (p.category) { (catMap[p.category] ??= []).push(p); } else { uncategorized.push(p); }
    });
    return { catMap, uncategorized };
  };

  // Build hierarchy: top-level + children
  const buildHierarchy = (pols: Policy[]) => {
    const topLevel = pols.filter(p => !p.parent_id);
    const children = pols.filter(p => p.parent_id);
    return topLevel.map(p => ({
      ...p,
      children: children.filter(c => c.parent_id === p.id),
    }));
  };

  const toggleSection = (key: string) => setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const renderTimeline = (p: Policy) => {
    const items = [
      { label: 'Created', date: p.created_at, icon: <Calendar className="w-3 h-3" /> },
      p.voting_start && { label: 'Voting Opens', date: p.voting_start, icon: <Vote className="w-3 h-3" /> },
      p.voting_deadline && { label: 'Voting Deadline', date: p.voting_deadline, icon: <Clock className="w-3 h-3" />, warn: new Date(p.voting_deadline) < new Date() },
      p.passed_at && { label: 'Passed', date: p.passed_at, icon: <CheckCircle2 className="w-3 h-3" /> },
      p.status === 'archived' && { label: 'Archived', date: p.created_at, icon: <Archive className="w-3 h-3" /> },
    ].filter(Boolean) as { label: string; date: string; icon: React.ReactNode; warn?: boolean }[];

    return (
      <div className="flex items-center gap-2 flex-wrap mt-2">
        {items.map((item, i) => (
          <span key={i} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${item.warn ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
            {item.icon} {item.label}: {format(new Date(item.date), 'MMM d')}
          </span>
        ))}
      </div>
    );
  };

  const renderVoteBar = (policyId: string) => {
    const tally = getVoteTally(policyId);
    const userVote = getUserVote(policyId);
    if (tally.total === 0 && !user) return null;

    return (
      <div className="space-y-2">
        {tally.total > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
            {VOTE_OPTIONS.map(opt => {
              const pct = (tally[opt.value] / tally.total) * 100;
              return pct > 0 ? <div key={opt.value} className={`${opt.color}`} style={{ width: `${pct}%` }} /> : null;
            })}
          </div>
        )}
        <div className="flex gap-1">
          {VOTE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleVote(policyId, opt.value)}
              className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
                userVote === opt.value
                  ? `${opt.color} text-white`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {opt.label} {tally[opt.value] > 0 && `(${tally[opt.value]})`}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAdminTimeline = (p: Policy) => {
    if (!isAdmin) return null;
    if (editingTimeline !== p.id) {
      return (
        <button onClick={() => setEditingTimeline(p.id)} className="text-[10px] text-teal-600 hover:text-teal-700 font-medium mt-1">
          Set Timeline
        </button>
      );
    }
    return (
      <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Voting Start</label>
            <input type="date" defaultValue={p.voting_start ? format(new Date(p.voting_start), 'yyyy-MM-dd') : ''} onChange={e => updatePolicy.mutate({ id: p.id, voting_start: e.target.value ? new Date(e.target.value).toISOString() : null })} className="text-xs border border-gray-200 rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Voting Deadline</label>
            <input type="date" defaultValue={p.voting_deadline ? format(new Date(p.voting_deadline), 'yyyy-MM-dd') : ''} onChange={e => updatePolicy.mutate({ id: p.id, voting_deadline: e.target.value ? new Date(e.target.value).toISOString() : null })} className="text-xs border border-gray-200 rounded px-2 py-1 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Category</label>
            <input type="text" defaultValue={p.category ?? ''} placeholder="e.g. Ethics, Operations" onBlur={e => updatePolicy.mutate({ id: p.id, category: e.target.value || null })} className="text-xs border border-gray-200 rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Status</label>
            <select value={p.status} onChange={e => updatePolicy.mutate({ id: p.id, status: e.target.value as PolicyStatus })} className="text-xs border border-gray-200 rounded px-2 py-1 w-full">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="under-revision">Under Revision</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { updatePolicy.mutate({ id: p.id, passed_at: new Date().toISOString(), status: 'active' }); setEditingTimeline(null); }} className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700">
            Mark Passed
          </button>
          <button onClick={() => setEditingTimeline(null)} className="text-[10px] text-gray-500 px-2 py-1 rounded hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    );
  };

  const renderPolicyCard = (policy: Policy, indent = false) => (
    <div key={policy.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col ${indent ? 'ml-6 border-l-4 border-l-teal-200' : ''}`}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${statusStyle[policy.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {policy.status.replace('-', ' ')}
            </span>
            {policy.category && (
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                {policy.category}
              </span>
            )}
          </div>
          {isAdmin && (
            <select value={policy.status} onChange={e => updatePolicy.mutate({ id: policy.id, status: e.target.value as PolicyStatus })} className="text-[10px] text-gray-400 bg-transparent border-none cursor-pointer focus:outline-none">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="under-revision">Under Revision</option>
              <option value="archived">Archived</option>
            </select>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{policy.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{policy.summary}</p>
        {renderTimeline(policy)}
        {renderAdminTimeline(policy)}
        <div className="mt-3">
          {renderVoteBar(policy.id)}
        </div>
      </div>
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <Link to={`/labs/governance/library/${policy.id}`} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
          <MessageCircle className="w-4 h-4" />
          Discussion
        </Link>
        <button onClick={() => handleLike(policy.id)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${hasLiked(policy.id) ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}`}>
          <ThumbsUp className={`w-4 h-4 ${hasLiked(policy.id) ? 'fill-teal-600' : ''}`} />
          {getLikeCount(policy.id) > 0 && <span>{getLikeCount(policy.id)}</span>}
        </button>
      </div>
    </div>
  );

  const renderSection = (section: typeof sections[0]) => {
    const isCollapsed = collapsedSections[section.key];
    const { catMap, uncategorized } = groupByCategory(section.policies);
    const catKeys = Object.keys(catMap).sort();

    return (
      <div key={section.key} className="space-y-3">
        <button onClick={() => toggleSection(section.key)} className="flex items-center gap-2 w-full text-left">
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          {section.icon}
          <h3 className="font-semibold text-gray-800">{section.label}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{section.policies.length}</span>
        </button>

        {!isCollapsed && section.policies.length === 0 && (
          <p className="text-sm text-gray-400 pl-11">No policies in this section.</p>
        )}

        {!isCollapsed && (
          <div className="space-y-4 pl-7">
            {catKeys.map(cat => (
              <div key={cat}>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">{cat}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buildHierarchy(catMap[cat]).map(p => (
                    <div key={p.id}>
                      {renderPolicyCard(p)}
                      {p.children.map(c => renderPolicyCard(c, true))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {uncategorized.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildHierarchy(uncategorized).map(p => (
                  <div key={p.id}>
                    {renderPolicyCard(p)}
                    {p.children.map(c => renderPolicyCard(c, true))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Policy Library</h2>
        <p className="text-gray-500 mt-1">Your approved operating model. Discuss, vote, and refine each policy.</p>
      </div>

      {/* Toolbar: Filter & Sort */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filter:</span>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="under-revision">Under Revision</option>
          <option value="archived">Archived</option>
        </select>
        {categories.length > 0 && (
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-sm text-gray-500">
          <ArrowUpDown className="w-4 h-4" />
          <span className="font-medium">Sort:</span>
        </div>
        {([['created_at', 'Date'], ['title', 'Title'], ['voting_deadline', 'Deadline'], ['status', 'Status']] as [SortField, string][]).map(([field, label]) => (
          <button key={field} onClick={() => toggleSort(field)} className={`text-sm px-2.5 py-1 rounded-lg transition-colors ${sortField === field ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
            {label} {sortField === field && (sortAsc ? '↑' : '↓')}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map(renderSection)}
      </div>
    </div>
  );
};

export default PolicyLibrary;
