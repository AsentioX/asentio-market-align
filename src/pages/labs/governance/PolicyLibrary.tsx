import { useState, useMemo, useRef, useEffect } from 'react';
import { usePolicies, usePolicyMutations, usePolicyLikes, usePolicyVotes, useCanParticipate, useDocket, Policy, PolicyStatus, VoteType } from '@/hooks/useGovernance';
import { MessageCircle, ThumbsUp, Vote, Filter, ArrowUpDown, ChevronDown, ChevronRight, Calendar, Clock, CheckCircle2, Archive, AlertTriangle, FileText, Trash2, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

const statusStyle: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  commenting: 'bg-blue-100 text-blue-700',
  voting: 'bg-indigo-100 text-indigo-700',
  passed: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-red-100 text-red-500',
};

const VOTE_OPTIONS: { value: VoteType; label: string; color: string }[] = [
  { value: 'agree', label: 'Agree', color: 'bg-emerald-500' },
  { value: 'abstain', label: 'Abstain', color: 'bg-gray-400' },
  { value: 'disagree', label: 'Disagree', color: 'bg-amber-500' },
];

type SortField = 'created_at' | 'title' | 'voting_deadline' | 'status';
type FilterStatus = 'all' | PolicyStatus;
type SectionKey = 'draft' | 'commenting' | 'voting' | 'passed' | 'archived';
const STATUS_OPTIONS: { value: PolicyStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'commenting', label: 'Commenting' },
  { value: 'voting', label: 'Voting' },
  { value: 'passed', label: 'Passed' },
  { value: 'archived', label: 'Archived' },
];

const PolicyStatusDropdown = ({ current, onChange, onDelete, onEdit, className = '' }: { current: PolicyStatus; onChange: (s: PolicyStatus) => void; onDelete: () => void; onEdit: () => void; className?: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button onClick={() => setOpen(!open)} className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none flex items-center gap-1">
        {current.replace('-', ' ')} <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px]">
          {STATUS_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 ${current === opt.value ? 'font-semibold text-teal-700' : 'text-gray-600'}`}>
              {opt.label}
            </button>
          ))}
          <Separator className="my-1" />
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 text-gray-600 flex items-center gap-1.5">
            <Pencil className="w-3 h-3" /> Edit Policy
          </button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left text-xs px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-1.5">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const PolicyLibrary = () => {
  const { data: policies = [] } = usePolicies();
  const { updateStatus, updatePolicy, deletePolicy } = usePolicyMutations();
  const { likes, toggleLike } = usePolicyLikes();
  const { votes, castVote, removeVote } = usePolicyVotes();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { isOnDocket, toggleDocket } = useDocket();

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

  const canParticipate = useCanParticipate();

  const handleVote = (policyId: string, vote: VoteType) => {
    if (!user) { toast({ title: 'Sign in required', variant: 'destructive' }); return; }
    if (!canParticipate) { toast({ title: 'View-only access', description: 'Community Members cannot vote.', variant: 'destructive' }); return; }
    const current = getUserVote(policyId);
    if (current === vote) { removeVote.mutate(policyId); } else { castVote.mutate({ policyId, vote }); }
  };

  // Classify policies into sections
  const classifyPolicy = (p: Policy): SectionKey => {
    if (p.status === 'archived') return 'archived';
    if (p.status === 'passed') return 'passed';
    if (p.status === 'voting') return 'voting';
    if (p.status === 'commenting') return 'commenting';
    return 'draft';
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
    const groups: Record<SectionKey, Policy[]> = { draft: [], commenting: [], voting: [], passed: [], archived: [] };
    filtered.forEach(p => groups[classifyPolicy(p)].push(p));
    return [
      { key: 'draft' as SectionKey, label: 'Draft', icon: <FileText className="w-5 h-5 text-gray-500" />, policies: groups.draft },
      { key: 'commenting' as SectionKey, label: 'Commenting', icon: <MessageCircle className="w-5 h-5 text-blue-600" />, policies: groups.commenting },
      { key: 'voting' as SectionKey, label: 'Voting', icon: <Vote className="w-5 h-5 text-indigo-600" />, policies: groups.voting },
      { key: 'passed' as SectionKey, label: 'Passed', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, policies: groups.passed },
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

  const renderVoteBar = (policyId: string, section: SectionKey) => {
    if (section !== 'voting') return null;

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

  const CategoryAutocomplete = ({ defaultValue, onCommit }: { defaultValue: string; onCommit: (val: string | null) => void }) => {
    const [value, setValue] = useState(defaultValue);
    const [focused, setFocused] = useState(false);
    const suggestions = useMemo(() => {
      if (!value.trim()) return categories;
      return categories.filter(c => c.toLowerCase().includes(value.toLowerCase()));
    }, [value, categories]);

    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setTimeout(() => setFocused(false), 150); onCommit(value.trim() || null); }}
          placeholder="e.g. Ethics, Operations"
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full"
        />
        {focused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-32 overflow-y-auto">
            {suggestions.map(cat => (
              <button
                key={cat}
                onMouseDown={e => { e.preventDefault(); setValue(cat); onCommit(cat); setFocused(false); }}
                className="w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 text-gray-600"
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEditModal = () => {
    const p = policies.find(pol => pol.id === editingTimeline);
    if (!p) return null;
    return (
      <Dialog open={!!editingTimeline} onOpenChange={(open) => { if (!open) setEditingTimeline(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Title</label>
              <input type="text" defaultValue={p.title} onBlur={e => { if (e.target.value && e.target.value !== p.title) updatePolicy.mutate({ id: p.id, title: e.target.value }); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full font-medium" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Summary</label>
              <textarea defaultValue={p.summary} rows={3} onBlur={e => { if (e.target.value && e.target.value !== p.summary) updatePolicy.mutate({ id: p.id, summary: e.target.value }); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Commenting Deadline</label>
                <input type="date" defaultValue={p.voting_start ? format(new Date(p.voting_start), 'yyyy-MM-dd') : ''} onChange={e => updatePolicy.mutate({ id: p.id, voting_start: e.target.value ? new Date(e.target.value).toISOString() : null })} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Voting Deadline</label>
                <input type="date" defaultValue={p.voting_deadline ? format(new Date(p.voting_deadline), 'yyyy-MM-dd') : ''} onChange={e => updatePolicy.mutate({ id: p.id, voting_deadline: e.target.value ? new Date(e.target.value).toISOString() : null })} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <CategoryAutocomplete
                  key={p.id}
                  defaultValue={p.category ?? ''}
                  onCommit={val => updatePolicy.mutate({ id: p.id, category: val })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Status</label>
                <select value={p.status} onChange={e => updatePolicy.mutate({ id: p.id, status: e.target.value as PolicyStatus })} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full">
                  {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { updatePolicy.mutate({ id: p.id, passed_at: new Date().toISOString(), status: 'passed' }); setEditingTimeline(null); }} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                Mark Passed
              </button>
              <button onClick={() => setEditingTimeline(null)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 ml-auto">
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderPolicyCard = (policy: Policy, indent = false, section: SectionKey = 'draft') => (
    <div key={policy.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col ${indent ? 'ml-6 border-l-4 border-l-teal-200' : ''}`}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Checkbox
                checked={isOnDocket(policy.id)}
                onCheckedChange={() => toggleDocket(policy.id)}
                className="mr-1"
                title="Add to docket"
              />
            )}
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
            <PolicyStatusDropdown
              current={policy.status}
              onChange={(s) => updatePolicy.mutate({ id: policy.id, status: s })}
              onDelete={() => { if (confirm('Delete this policy permanently?')) deletePolicy.mutate(policy.id); }}
              onEdit={() => setEditingTimeline(policy.id)}
            />
          )}
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{policy.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{policy.summary}</p>
        {renderTimeline(policy)}
        <div className="mt-3">
          {renderVoteBar(policy.id, section)}
        </div>
      </div>
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <Link to={`/labs/fieldofviews/library/${policy.id}`} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"> className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"> className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
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
                      {renderPolicyCard(p, false, section.key as SectionKey)}
                      {p.children.map(c => renderPolicyCard(c, true, section.key as SectionKey))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {uncategorized.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildHierarchy(uncategorized).map(p => (
                  <div key={p.id}>
                    {renderPolicyCard(p, false, section.key as SectionKey)}
                    {p.children.map(c => renderPolicyCard(c, true, section.key as SectionKey))}
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
          <option value="commenting">Commenting</option>
          <option value="voting">Voting</option>
          <option value="passed">Passed</option>
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
      {renderEditModal()}
    </div>
  );
};

export default PolicyLibrary;
