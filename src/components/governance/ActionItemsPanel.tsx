import { useState } from 'react';
import { useActionItems, ActionItem } from '@/hooks/useTopics';
import { useMembers } from '@/hooks/useGovernance';
import { Check, Plus, Trash2, AlertCircle, Calendar } from 'lucide-react';

const parseAvatar = (a: string) => {
  const [emoji, bg] = a.split('|');
  return { emoji: emoji || '🐻', bg: bg || 'bg-teal-100 text-teal-700' };
};

interface Props {
  topicId: string;
  canEdit: boolean;
}

export const ActionItemsPanel = ({ topicId, canEdit }: Props) => {
  const { actionItems, addActionItem, toggleComplete, deleteActionItem } = useActionItems(topicId);
  const { data: members = [] } = useMembers();

  const [showForm, setShowForm] = useState(false);
  const [task, setTask] = useState('');
  const [driverId, setDriverId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [friction, setFriction] = useState('');

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('');

  const handleSubmit = () => {
    if (!task.trim()) return;
    addActionItem.mutate({
      topic_id: topicId,
      task_description: task.trim(),
      driver_id: driverId || null,
      deadline: deadline || null,
      friction_point: friction.trim() || null,
    });
    setTask(''); setDriverId(''); setDeadline(''); setFriction('');
    setShowForm(false);
  };

  const handleComplete = (item: ActionItem) => {
    if (item.is_completed) {
      toggleComplete.mutate({ item });
      return;
    }
    setCompletingId(item.id);
    setOutcome('');
  };

  const confirmComplete = (item: ActionItem) => {
    toggleComplete.mutate({ item, outcome: outcome.trim() || undefined });
    setCompletingId(null);
    setOutcome('');
  };

  const open = actionItems.filter(a => !a.is_completed);
  const done = actionItems.filter(a => a.is_completed);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Action Items</h3>
          <p className="text-xs text-gray-400 mt-0.5">{open.length} open · {done.length} completed</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(s => !s)} className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-teal-50/40 rounded-lg border border-teal-200 p-4 mb-4 space-y-3">
          <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="What needs to happen?" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">No driver</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <input value={friction} onChange={(e) => setFriction(e.target.value)} placeholder="Friction point (optional)…" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-gray-500 text-xs">Cancel</button>
          </div>
        </div>
      )}

      {actionItems.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 py-6 text-center">No action items yet.</p>
      )}

      <div className="space-y-2">
        {[...open, ...done].map(item => {
          const driver = item.driver_id ? members.find(m => m.id === item.driver_id) : null;
          const overdue = !item.is_completed && item.deadline && new Date(item.deadline) < new Date();
          return (
            <div key={item.id} className={`group p-3 rounded-lg border transition-colors ${item.is_completed ? 'bg-gray-50/50 border-gray-100 opacity-70' : 'border-gray-100 hover:border-teal-200'}`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => canEdit && handleComplete(item)}
                  disabled={!canEdit}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-teal-500'} disabled:cursor-default`}
                >
                  {item.is_completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${item.is_completed ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>{item.task_description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                    {driver && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-full text-gray-600">
                        {(() => { const { emoji, bg } = parseAvatar(driver.avatar); return <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${bg}`}>{emoji}</span>; })()}
                        {driver.name}
                      </span>
                    )}
                    {item.deadline && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${overdue ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {overdue && ' · overdue'}
                      </span>
                    )}
                    {item.friction_point && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                        <AlertCircle className="w-3 h-3" /> {item.friction_point}
                      </span>
                    )}
                  </div>
                  {item.outcome && (
                    <p className="text-[11px] text-emerald-700 italic mt-1.5">→ {item.outcome}</p>
                  )}
                  {completingId === item.id && (
                    <div className="mt-2 flex gap-2">
                      <input value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Result / outcome (optional)…" className="flex-1 text-xs px-2 py-1 border border-emerald-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" autoFocus />
                      <button onClick={() => confirmComplete(item)} className="text-xs px-2 py-1 bg-emerald-600 text-white rounded">Done</button>
                      <button onClick={() => setCompletingId(null)} className="text-xs px-2 py-1 text-gray-500">Skip</button>
                    </div>
                  )}
                </div>
                {canEdit && (
                  <button onClick={() => deleteActionItem.mutate(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
