import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSponsors, useSaveSponsor, useAllActions } from '../lib/api';
import { STAGES, stageColor, stageLabel } from '../lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Building2 } from 'lucide-react';
import { healthScore, healthColor } from '../lib/health';
import { toast } from 'sonner';

export default function Sponsors() {
  const { data: sponsors = [] } = useSponsors();
  const { data: actions = [] } = useAllActions();
  const save = useSaveSponsor();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company_name: '', industry: '', website: '', tier_target: '', estimated_value: 0 });

  const filtered = useMemo(() => sponsors.filter(s => s.company_name.toLowerCase().includes(q.toLowerCase())), [sponsors, q]);

  const create = async () => {
    if (!form.company_name.trim()) return toast.error('Company name required');
    try {
      const res = await save.mutateAsync({ ...form } as any);
      toast.success('Sponsor created');
      setOpen(false); setForm({ company_name: '', industry: '', website: '', tier_target: '', estimated_value: 0 });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sponsors</h1>
          <p className="text-sm text-slate-500 mt-1">{sponsors.length} sponsor accounts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800"><Plus className="w-4 h-4 mr-1" /> New sponsor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New sponsor</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Company name</Label><Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Industry</Label><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
                <div><Label>Website</Label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tier target</Label>
                  <Select value={form.tier_target} onValueChange={v => setForm({ ...form, tier_target: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{['Presenting','Platinum','Gold','Silver','Bronze','Community'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Estimated value ($)</Label><Input type="number" value={form.estimated_value} onChange={e => setForm({ ...form, estimated_value: Number(e.target.value) })} /></div>
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={create}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search sponsors" className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Company</th>
              <th className="text-left px-4 py-3">Stage</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-right px-4 py-3">Value</th>
              <th className="text-center px-4 py-3">Health</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const score = healthScore(s, [], actions.filter(a => a.sponsor_id === s.id));
              const color = healthColor(score);
              const dot = color === 'green' ? 'bg-emerald-500' : color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/labs/sponsorcrm/sponsors/${s.id}`} className="flex items-center gap-2 font-medium text-slate-900 hover:underline">
                      <Building2 className="w-4 h-4 text-slate-400" /> {s.company_name}
                    </Link>
                    {s.industry && <div className="text-xs text-slate-500 mt-0.5 ml-6">{s.industry}</div>}
                  </td>
                  <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded ${stageColor(s.stage)}`}>{stageLabel(s.stage)}</span></td>
                  <td className="px-4 py-3 text-slate-600">{s.tier_target ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-900">{s.estimated_value ? `$${(s.estimated_value/1000).toFixed(0)}k` : '—'}</td>
                  <td className="px-4 py-3 text-center"><span className={`inline-block w-2 h-2 rounded-full ${dot}`} /> <span className="text-xs text-slate-500 ml-1">{score}</span></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">No sponsors yet. Create your first one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
