import { useGovernanceStore } from './governanceStore';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusStyle: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  active: 'bg-emerald-100 text-emerald-700',
  'under-revision': 'bg-amber-100 text-amber-700',
};

const PolicyLibrary = () => {
  const { policies, updatePolicyStatus } = useGovernanceStore();
  const visible = policies.filter((p) => p.status !== 'archived');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Policy Library</h2>
        <p className="text-gray-500 mt-1">Your approved operating model. Discuss and refine each policy.</p>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No policies yet. Upload a transcript to generate your first cards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${statusStyle[policy.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {policy.status.replace('-', ' ')}
                  </span>
                  <select
                    value={policy.status}
                    onChange={(e) => updatePolicyStatus(policy.id, e.target.value as any)}
                    className="text-[10px] text-gray-400 bg-transparent border-none cursor-pointer focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="under-revision">Under Revision</option>
                  </select>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{policy.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3">{policy.summary}</p>
              </div>
              <div className="border-t border-gray-100 px-5 py-3">
                <Link
                  to={`/labs/governance/library/${policy.id}`}
                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Discussion
                  {policy.proposals.length > 0 && (
                    <span className="ml-auto text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                      {policy.proposals.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PolicyLibrary;
