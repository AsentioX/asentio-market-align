import { useState } from 'react';
import { usePolicies, useMembers, useDrafts, usePhase, useDocket } from '@/hooks/useGovernance';
import { useActionItems, heatScore, daysSince, isStale } from '@/hooks/useTopics';
import { FileText, Users, Vote, TrendingUp, Presentation, X, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DocketPresentation from './DocketPresentation';

const parseAvatar = (a: string) => {
  const [emoji, bg] = (a || '').split('|');
  return { emoji: emoji || '🐻', bg: bg || 'bg-teal-100 text-teal-700' };
};

const PriorityDots = ({ priority }: { priority: number }) => (
  <span className="inline-flex gap-0.5" title={`Priority ${priority}/5`}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= priority ? 'bg-rose-500' : 'bg-gray-200'}`} />
    ))}
  </span>
);

const GovernanceDashboard = () => {
  const { data: policies = [] } = usePolicies();
  const { data: members = [] } = useMembers();
  const { drafts } = useDrafts();
  const { phase } = usePhase();
  const { isAdmin } = useAuth();
  const { docketItems, toggleDocket } = useDocket();
  const { actionItems } = useActionItems();
  const [showPresentation, setShowPresentation] = useState(false);

  const activePolicies = policies.filter((p) => p.status !== 'archived');

  // Sort docket by Heat Score
  const docketPolicies = docketItems
    .map(d => policies.find(p => p.id === d.policy_id))
    .filter(Boolean)
    .sort((a, b) => heatScore(b!.priority, b!.last_discussed_at, b!.created_at) - heatScore(a!.priority, a!.last_discussed_at, a!.created_at));

  const openActions = actionItems.filter(a => !a.is_completed).length;

  const stats = [
    { label: 'Active Topics', value: activePolicies.length, icon: FileText, color: 'bg-teal-50 text-teal-600' },
    { label: 'Open Action Items', value: openActions, icon: TrendingUp, color: 'bg-rose-50 text-rose-600' },
    { label: 'Task Force Members', value: members.length, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Pending Drafts', value: drafts.length, icon: Vote, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Current phase: <span className="font-medium text-teal-600 capitalize">{phase.replace('-', ' ')}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Docket Section — sorted by Heat Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" /> Meeting Docket
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {docketPolicies.length} {docketPolicies.length === 1 ? 'topic' : 'topics'} · sorted by heat score (priority + days since last discussed)
            </p>
          </div>
          {docketPolicies.length > 0 && (
            <button
              onClick={() => setShowPresentation(true)}
              className="flex items-center gap-2 text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Presentation className="w-4 h-4" />
              Present
            </button>
          )}
        </div>

        {docketPolicies.length === 0 ? (
          <p className="text-sm text-gray-400">No topics on the docket. Use the checkboxes in the Policy Library to add items.</p>
        ) : (
          <div className="space-y-2">
            {docketPolicies.map((p) => p && (() => {
              const stale = isStale(p.priority, p.last_discussed_at, p.created_at);
              const heat = heatScore(p.priority, p.last_discussed_at, p.created_at);
              const daysCreated = daysSince(p.created_at);
              const owner = p.owner_id ? members.find(m => m.id === p.owner_id) : null;
              return (
                <div key={p.id} className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${stale ? 'border-amber-300 bg-amber-50/30 animate-pulse-slow' : 'border-gray-100 hover:bg-gray-50'} group`}>
                  {isAdmin && (
                    <button onClick={() => toggleDocket(p.id)} className="text-gray-300 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {owner && (() => {
                    const { emoji, bg } = parseAvatar(owner.avatar);
                    return <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${bg}`} title={`Driver: ${owner.name}`}>{emoji}</span>;
                  })()}
                  <div className="flex-1 min-w-0">
                    <Link to={`/labs/fieldofviews/library/${p.id}`} className="text-sm font-medium text-gray-700 hover:text-teal-600 truncate block">
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                      <PriorityDots priority={p.priority ?? 3} />
                      <span>· {daysCreated}d old</span>
                      {p.last_discussed_at && <span>· last discussed {daysSince(p.last_discussed_at)}d ago</span>}
                      {stale && <span className="text-amber-600 font-semibold">· STALE</span>}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600" title="Heat score">
                    🔥 {heat}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'passed' ? 'bg-emerald-100 text-emerald-700' :
                    p.status === 'voting' ? 'bg-indigo-100 text-indigo-700' :
                    p.status === 'commenting' ? 'bg-blue-100 text-blue-700' :
                    p.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                    'bg-red-100 text-red-500'
                  }`}>{p.status}</span>
                </div>
              );
            })())}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Topics</h3>
          {activePolicies.length === 0 ? (
            <p className="text-sm text-gray-400">No topics yet. Upload a transcript to get started.</p>
          ) : (
            <div className="space-y-3">
              {activePolicies.slice(0, 4).map((p) => {
                const stale = isStale(p.priority, p.last_discussed_at, p.created_at);
                return (
                  <Link
                    key={p.id}
                    to={`/labs/fieldofviews/library/${p.id}`}
                    className={`block p-3 rounded-lg border transition-colors ${stale ? 'border-amber-300 bg-amber-50/30 animate-pulse-slow' : 'border-gray-100 hover:border-teal-200 hover:bg-teal-50/30'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700 truncate">{p.title}</span>
                      <PriorityDots priority={p.priority ?? 3} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{daysSince(p.created_at)} days old</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/labs/fieldofviews/upload" className="block w-full text-left p-4 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors">
              <span className="font-medium">Process New Transcript</span>
              <p className="text-xs text-teal-100 mt-1">AI matches insights to topics + auto-creates action items</p>
            </Link>
            <Link to="/labs/fieldofviews/library" className="block w-full text-left p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600 transition-colors">
              <span className="font-medium">Browse Topic Library</span>
              <p className="text-xs mt-1">View and discuss collaboration topics</p>
            </Link>
          </div>
        </div>
      </div>

      {showPresentation && <DocketPresentation onClose={() => setShowPresentation(false)} />}
    </div>
  );
};

export default GovernanceDashboard;
