import { useState } from 'react';
import { useSponsors, useSaveSponsor } from '../lib/api';
import { STAGES, stageColor, stageLabel } from '../lib/constants';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

export default function Pipeline() {
  const { data: sponsors = [] } = useSponsors();
  const save = useSaveSponsor();
  const [dragId, setDragId] = useState<string | null>(null);

  const move = async (id: string, stage: string) => {
    try { await save.mutateAsync({ id, stage, company_name: sponsors.find(s => s.id === id)?.company_name ?? '' }); toast.success('Stage updated'); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Pipeline</h1>
        <p className="text-sm text-slate-500 mt-1">Drag sponsors across stages. {sponsors.length} total.</p>
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 h-full min-w-max pb-4">
          {STAGES.map(stage => {
            const items = sponsors.filter(s => s.stage === stage.key);
            return (
              <div key={stage.key} className="w-64 flex flex-col bg-slate-50 rounded-lg border border-slate-200"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragId) move(dragId, stage.key); setDragId(null); }}>
                <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{stage.label}</span>
                  <span className="text-xs text-slate-500">{items.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {items.map(s => (
                    <Link key={s.id} to={`/labs/rhcrm/sponsors/${s.id}`}
                      draggable
                      onDragStart={() => setDragId(s.id)}
                      className="block bg-white border border-slate-200 rounded-md p-3 shadow-sm hover:shadow cursor-grab active:cursor-grabbing">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <div className="text-sm font-medium text-slate-900 truncate">{s.company_name}</div>
                      </div>
                      {s.tier_target && <div className="text-[11px] text-slate-500 mt-1">{s.tier_target}</div>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-slate-400">{s.probability ?? 0}%</span>
                        {s.estimated_value ? <span className="text-[11px] font-medium text-emerald-700">${(s.estimated_value/1000).toFixed(0)}k</span> : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
