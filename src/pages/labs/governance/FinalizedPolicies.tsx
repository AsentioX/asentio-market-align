import { useMemo } from 'react';
import { usePolicies, usePolicyLikes, Policy } from '@/hooks/useGovernance';
import { ThumbsUp, MessageCircle, Calendar, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const FinalizedPolicies = () => {
  const { data: policies = [] } = usePolicies();
  const { likes, toggleLike } = usePolicyLikes();
  const { user } = useAuth();
  const { toast } = useToast();

  const finalized = useMemo(() => {
    return policies
      .filter(p => p.status === 'active' && p.passed_at)
      .sort((a, b) => (b.passed_at ?? '').localeCompare(a.passed_at ?? ''));
  }, [policies]);

  const getLikeCount = (id: string) => likes.filter(l => l.policy_id === id).length;
  const hasLiked = (id: string) => !!user && likes.some(l => l.policy_id === id && l.user_id === user.id);
  const handleLike = (id: string) => {
    if (!user) { toast({ title: 'Sign in required', variant: 'destructive' }); return; }
    toggleLike.mutate(id);
  };

  // Group by category
  const grouped = useMemo(() => {
    const catMap: Record<string, Policy[]> = {};
    const uncategorized: Policy[] = [];
    finalized.forEach(p => {
      if (p.category) (catMap[p.category] ??= []).push(p);
      else uncategorized.push(p);
    });
    return { catMap, uncategorized, catKeys: Object.keys(catMap).sort() };
  }, [finalized]);

  const renderCard = (p: Policy) => (
    <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            Finalized
          </span>
          {p.category && (
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              {p.category}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{p.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3">{p.summary}</p>
        {p.passed_at && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
            <Calendar className="w-3 h-3" />
            Passed {format(new Date(p.passed_at), 'MMM d, yyyy')}
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <Link to={`/labs/governance/library/${p.id}`} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
          <MessageCircle className="w-4 h-4" />
          View Discussion
        </Link>
        <button onClick={() => handleLike(p.id)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${hasLiked(p.id) ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}`}>
          <ThumbsUp className={`w-4 h-4 ${hasLiked(p.id) ? 'fill-teal-600' : ''}`} />
          {getLikeCount(p.id) > 0 && <span>{getLikeCount(p.id)}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-7 h-7 text-emerald-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Finalized Policies</h2>
          <p className="text-gray-500 mt-0.5">Policies that have been voted on and officially adopted.</p>
        </div>
      </div>

      {finalized.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No finalized policies yet</p>
          <p className="text-sm mt-1">Policies will appear here once they pass the voting phase.</p>
        </div>
      )}

      {grouped.catKeys.map(cat => (
        <div key={cat}>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">{cat}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.catMap[cat].map(renderCard)}
          </div>
        </div>
      ))}

      {grouped.uncategorized.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grouped.uncategorized.map(renderCard)}
        </div>
      )}
    </div>
  );
};

export default FinalizedPolicies;
