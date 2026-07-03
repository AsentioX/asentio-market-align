import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllActions, useSponsors, useSaveAction } from '../lib/api';
import { daysUntil } from '../lib/health';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Actions() {
  const { data: sponsors = [] } = useSponsors();
  const { data: actions = [] } = useAllActions();
  const save = useSaveAction();
  const [filter, setFilter] = useState<'all'|'open'|'done'|'overdue'|'mine'>('open');

  const today = new Date(); today.setHours(0,0,0,0);
  const shown = actions.filter(a => {
    if (filter === 'open') return a.status === 'open';
    if (filter === 'done') return a.status === 'done';
    if (filter === 'overdue') return a.status === 'open' && a.due_date && new Date(a.due_date) < today;
    return true;
  });

  const sponsorName = (id: string) => sponsors.find(s => s.id === id)?.company_name ?? '';

  const complete = async (a: any) => {
    try { await save.mutateAsync({ ...a, status: 'done' }); toast.success('Marked done'); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold text-slate-900">Actions</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Every open action across every sponsor.</p>

      <div className="flex gap-1 mb-4">
        {(['open','overdue','done','all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
        ))}
      </div>

      <div className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
        {shown.map(a => {
          const d = a.due_date ? daysUntil(a.due_date) : null;
          const overdue = d !== null && d < 0 && a.status === 'open';
          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
              <button onClick={() => complete(a)} disabled={a.status === 'done'}
                className={`w-4 h-4 rounded border ${a.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-slate-500'} flex items-center justify-center`}>
                {a.status === 'done' && <Check className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${a.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{a.title}</div>
                <Link to={`/labs/sponsorcrm/sponsors/${a.sponsor_id}`} className="text-xs text-slate-500 hover:underline">{sponsorName(a.sponsor_id)}</Link>
              </div>
              <div className="text-xs text-slate-500 hidden sm:block">{a.owner_name ?? '—'}</div>
              <div className={`text-xs w-20 text-right ${overdue ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                {a.due_date ? (overdue ? `${Math.abs(d)}d late` : d === 0 ? 'today' : `${d}d`) : '—'}
              </div>
              <div className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize w-24 text-center">wait: {a.waiting_on}</div>
            </div>
          );
        })}
        {shown.length === 0 && <div className="p-10 text-center text-sm text-slate-400">Nothing here.</div>}
      </div>
    </div>
  );
}
