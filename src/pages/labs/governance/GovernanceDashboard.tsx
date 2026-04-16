import { useState } from 'react';
import { usePolicies, useMembers, useDrafts, usePhase, useDocket } from '@/hooks/useGovernance';
import { FileText, Users, Vote, TrendingUp, Presentation, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from '@/components/ui/checkbox';
import DocketPresentation from './DocketPresentation';

const GovernanceDashboard = () => {
  const { data: policies = [] } = usePolicies();
  const { data: members = [] } = useMembers();
  const { drafts } = useDrafts();
  const { phase } = usePhase();
  const { isAdmin } = useAuth();
  const { docketItems, isOnDocket, toggleDocket } = useDocket();
  const [showPresentation, setShowPresentation] = useState(false);

  const activePolicies = policies.filter((p) => p.status !== 'archived');
  const docketPolicies = docketItems
    .map(d => policies.find(p => p.id === d.policy_id))
    .filter(Boolean);

  const stats = [
    { label: 'Active Policies', value: activePolicies.length, icon: FileText, color: 'bg-teal-50 text-teal-600' },
    { label: 'Task Force Members', value: members.length, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Policies', value: policies.length, icon: Vote, color: 'bg-amber-50 text-amber-600' },
    { label: 'Pending Drafts', value: drafts.length, icon: TrendingUp, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Current phase: <span className="font-medium text-teal-600 capitalize">{phase.replace('-', ' ')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Docket Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Meeting Docket</h3>
            <p className="text-xs text-gray-400 mt-0.5">{docketPolicies.length} {docketPolicies.length === 1 ? 'policy' : 'policies'} on the agenda</p>
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
          <p className="text-sm text-gray-400">No policies on the docket. Use the checkboxes in the Policy Library to add items.</p>
        ) : (
          <div className="space-y-2">
            {docketPolicies.map((p) => p && (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 group">
                {isAdmin && (
                  <button onClick={() => toggleDocket(p.id)} className="text-gray-300 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/labs/fieldofviews/library/${p.id}`} className="text-sm font-medium text-gray-700 hover:text-teal-600 truncate block">
                    {p.title}
                  </Link>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  p.status === 'passed' ? 'bg-emerald-100 text-emerald-700' :
                  p.status === 'voting' ? 'bg-indigo-100 text-indigo-700' :
                  p.status === 'commenting' ? 'bg-blue-100 text-blue-700' :
                  p.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                  'bg-red-100 text-red-500'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Policies</h3>
          {activePolicies.length === 0 ? (
            <p className="text-sm text-gray-400">No policies yet. Upload a transcript to get started.</p>
          ) : (
            <div className="space-y-3">
              {activePolicies.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  <Link to={`/labs/fieldofviews/library/${p.id}`} className="text-sm font-medium text-gray-700 hover:text-teal-600 truncate block">
                  className="block p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{p.title}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'passed' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'voting' ? 'bg-indigo-100 text-indigo-700' :
                      p.status === 'commenting' ? 'bg-blue-100 text-blue-700' :
                      p.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                      'bg-red-100 text-red-500'
                    }`}>{p.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/labs/fieldofviews/upload" className="block w-full text-left p-4 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors"> className="block w-full text-left p-4 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors"> className="block w-full text-left p-4 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors">
              <span className="font-medium">Upload Transcript</span>
              <p className="text-xs text-teal-100 mt-1">Process meeting notes with AI</p>
            </Link>
            <Link to="/labs/fieldofviews/library" className="block w-full text-left p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600 transition-colors"> className="block w-full text-left p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600 transition-colors"> className="block w-full text-left p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600 transition-colors">
              <span className="font-medium">Browse Policy Library</span>
              <p className="text-xs mt-1">View and discuss operating model</p>
            </Link>
          </div>
        </div>
      </div>

      {showPresentation && <DocketPresentation onClose={() => setShowPresentation(false)} />}
    </div>
  );
};

export default GovernanceDashboard;
