import { useTopicHistory } from '@/hooks/useTopics';
import { useMembers } from '@/hooks/useGovernance';
import { CheckCircle2, ListPlus, Sparkles, FileEdit, MessageSquare } from 'lucide-react';

const ICONS: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  action_created: { icon: ListPlus, color: 'bg-teal-100 text-teal-700', label: 'Action created' },
  action_completed: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700', label: 'Action completed' },
  insight_added: { icon: Sparkles, color: 'bg-indigo-100 text-indigo-700', label: 'New insight' },
  description_updated: { icon: FileEdit, color: 'bg-amber-100 text-amber-700', label: 'Description updated' },
  note: { icon: MessageSquare, color: 'bg-gray-100 text-gray-600', label: 'Note' },
};

const formatRel = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

export const HistoryThread = ({ topicId }: { topicId: string }) => {
  const { data: history = [] } = useTopicHistory(topicId);
  const { data: members = [] } = useMembers();

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">History Thread</h3>
        <p className="text-sm text-gray-400">No events yet. As action items are created, completed, and insights added, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">History Thread</h3>
      <ol className="relative border-l-2 border-gray-100 space-y-4 ml-2 pl-5">
        {history.map(ev => {
          const cfg = ICONS[ev.event_type] ?? ICONS.note;
          const Icon = cfg.icon;
          const actor = ev.actor_id ? members.find(m => m.user_id === ev.actor_id) : null;
          const task = (ev.payload as any)?.task_description as string | undefined;
          const insight = (ev.payload as any)?.insight as string | undefined;
          const outcome = (ev.payload as any)?.outcome as string | undefined;
          return (
            <li key={ev.id} className="relative">
              <span className={`absolute -left-[34px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${cfg.color}`}>
                <Icon className="w-3 h-3" />
              </span>
              <div className="flex items-baseline gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{cfg.label}</p>
                <span className="text-[11px] text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">{formatRel(ev.created_at)}</span>
                {actor && <span className="text-[11px] text-gray-400">· by {actor.name}</span>}
              </div>
              {task && <p className="text-sm text-gray-700 mt-1">{task}</p>}
              {outcome && <p className="text-xs text-emerald-700 italic mt-0.5">→ {outcome}</p>}
              {insight && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{insight}</p>}
              {(ev.payload as any)?.source === 'ai_transcript' && (
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">AI</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
