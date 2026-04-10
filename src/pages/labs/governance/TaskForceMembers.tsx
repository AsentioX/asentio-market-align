import { useGovernanceStore } from './governanceStore';

const TaskForceMembers = () => {
  const { members } = useGovernanceStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Task Force Members</h2>
        <p className="text-gray-500 mt-1">People shaping the operating model.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {m.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{m.name}</p>
              <p className="text-sm text-gray-500">{m.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskForceMembers;
