import { useGovernanceStore } from './governanceStore';
import { ArchiveRestore } from 'lucide-react';

const GovernanceArchive = () => {
  const { policies, updatePolicyStatus } = useGovernanceStore();
  const archived = policies.filter((p) => p.status === 'archived');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Archive</h2>
        <p className="text-gray-500 mt-1">Retired or superseded policies.</p>
      </div>

      {archived.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No archived policies.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {archived.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">{p.title}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{p.summary}</p>
              </div>
              <button
                onClick={() => updatePolicyStatus(p.id, 'draft')}
                className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium flex-shrink-0 mt-1"
              >
                <ArchiveRestore className="w-4 h-4" /> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GovernanceArchive;
