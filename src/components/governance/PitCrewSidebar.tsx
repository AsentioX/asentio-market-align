import { useMemo, useState } from 'react';
import { useTopicAssignees } from '@/hooks/useTopics';
import { useMembers, Member } from '@/hooks/useGovernance';
import { useTopicFieldMutations } from '@/hooks/useTopics';
import { Plus, X, AlertTriangle, Crown } from 'lucide-react';

const parseAvatar = (a: string) => {
  const [emoji, bg] = a.split('|');
  return { emoji: emoji || '🐻', bg: bg || 'bg-teal-100 text-teal-700' };
};

interface Props {
  topicId: string;
  ownerId: string | null;
  vibe: string | null;
  elephant: string | null;
  canEdit: boolean;
}

export const PitCrewSidebar = ({ topicId, ownerId, vibe, elephant, canEdit }: Props) => {
  const { assignees, assign, unassign } = useTopicAssignees(topicId);
  const { data: members = [] } = useMembers();
  const updateField = useTopicFieldMutations();

  const owner = members.find(m => m.id === ownerId) ?? null;
  const crew = useMemo(
    () => assignees.map(a => members.find(m => m.id === a.member_id)).filter(Boolean) as Member[],
    [assignees, members],
  );

  const [showAdd, setShowAdd] = useState(false);
  const [editingElephant, setEditingElephant] = useState(false);
  const [elephantDraft, setElephantDraft] = useState(elephant ?? '');

  const availableMembers = members.filter(m => !crew.some(c => c.id === m.id));

  return (
    <aside className="space-y-4">
      {/* Driver / Owner */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Driver</h3>
          {canEdit && (
            <select
              value={ownerId ?? ''}
              onChange={(e) => updateField.mutate({ id: topicId, owner_id: e.target.value || null })}
              className="text-xs text-gray-500 bg-transparent border-none focus:outline-none"
            >
              <option value="">None</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
        </div>
        {owner ? (
          <div className="flex items-center gap-3">
            {(() => {
              const { emoji, bg } = parseAvatar(owner.avatar);
              return (
                <div className="relative">
                  <span className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${bg}`}>{emoji}</span>
                  <Crown className="absolute -top-1 -right-1 w-4 h-4 text-amber-500 fill-amber-400" />
                </div>
              );
            })()}
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{owner.name}</p>
              <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                Driving
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No driver assigned</p>
        )}
      </div>

      {/* Pit Crew */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Pit Crew</h3>
          {canEdit && (
            <button onClick={() => setShowAdd(s => !s)} className="text-gray-400 hover:text-teal-600">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        {showAdd && availableMembers.length > 0 && (
          <div className="mb-3 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-1 space-y-0.5">
            {availableMembers.map(m => (
              <button
                key={m.id}
                onClick={() => { assign.mutate({ topic_id: topicId, member_id: m.id }); setShowAdd(false); }}
                className="w-full text-left text-xs px-2 py-1.5 hover:bg-teal-50 rounded flex items-center gap-2"
              >
                {(() => { const { emoji, bg } = parseAvatar(m.avatar); return <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${bg}`}>{emoji}</span>; })()}
                {m.name}
              </button>
            ))}
          </div>
        )}
        {crew.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No contributors yet</p>
        ) : (
          <div className="space-y-2">
            {crew.map(m => {
              const { emoji, bg } = parseAvatar(m.avatar);
              const assignment = assignees.find(a => a.member_id === m.id);
              return (
                <div key={m.id} className="flex items-center gap-2 group">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${bg}`}>{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{m.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{m.role}</p>
                  </div>
                  {canEdit && assignment && (
                    <button onClick={() => unassign.mutate(assignment.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vibe */}
      {(vibe || canEdit) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Vibe</h3>
          {canEdit ? (
            <input
              type="text"
              defaultValue={vibe ?? ''}
              onBlur={(e) => { if (e.target.value !== (vibe ?? '')) updateField.mutate({ id: topicId, vibe: e.target.value || null }); }}
              placeholder="e.g. tense but productive"
              className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-100 focus:border-teal-400 focus:outline-none pb-1"
            />
          ) : (
            <p className="text-sm text-gray-700">{vibe}</p>
          )}
        </div>
      )}

      {/* Elephant in the Room */}
      <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">Elephant in the Room</h3>
        </div>
        {editingElephant && canEdit ? (
          <div className="space-y-2">
            <textarea
              value={elephantDraft}
              onChange={(e) => setElephantDraft(e.target.value)}
              rows={3}
              placeholder="Capture unresolved tension or what's not being said…"
              className="w-full text-sm text-gray-700 bg-white border border-amber-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { updateField.mutate({ id: topicId, elephant_in_room: elephantDraft || null }); setEditingElephant(false); }}
                className="px-3 py-1 text-xs bg-amber-600 text-white rounded-lg font-medium"
              >Save</button>
              <button onClick={() => { setElephantDraft(elephant ?? ''); setEditingElephant(false); }} className="px-3 py-1 text-xs text-gray-500">Cancel</button>
            </div>
          </div>
        ) : elephant ? (
          <p
            onClick={() => canEdit && setEditingElephant(true)}
            className={`text-sm text-amber-900 italic leading-relaxed ${canEdit ? 'cursor-pointer hover:opacity-80' : ''}`}
          >
            "{elephant}"
          </p>
        ) : (
          <button
            onClick={() => canEdit && setEditingElephant(true)}
            disabled={!canEdit}
            className="text-xs text-amber-700/70 italic hover:text-amber-800 disabled:cursor-default"
          >
            {canEdit ? '+ Name the unresolved tension' : 'No tension noted'}
          </button>
        )}
      </div>
    </aside>
  );
};
