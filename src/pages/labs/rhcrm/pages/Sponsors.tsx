import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSponsors, useSaveSponsor, useAllActions, useTeam } from '../lib/api';
import { STAGES, stageColor, stageLabel } from '../lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Building2, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { healthScore, healthColor } from '../lib/health';
import { toast } from 'sonner';
import SponsorImportExport from '../components/SponsorImportExport';


export default function Sponsors() {
  const { data: sponsors = [] } = useSponsors();
  const { data: actions = [] } = useAllActions();
  const { data: team = [] } = useTeam();
  const ownerName = (ownerId: string | null) => {
    const m = team.find(t => t.id === ownerId);
    return m ? (m.name || m.email || 'Unnamed') : '—';
  };
  const save = useSaveSponsor();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company_name: '', industry: '', website: '', tier_target: '' });

  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'company_name', dir: 'asc' });

  const scoreFor = (s: any) => healthScore(s, [], actions.filter(a => a.sponsor_id === s.id));

  const filtered = useMemo(() => {
    const rows = sponsors.filter(s => s.company_name.toLowerCase().includes(q.toLowerCase()));
    const val = (s: any) => {
      switch (sort.key) {
        case 'stage': return stageLabel(s.stage) ?? '';
        case 'tier': return s.tier_target ?? '';
        case 'owner': return ownerName(s.owner_id);
        case 'health': return scoreFor(s);
        default: return s.company_name ?? '';
      }
    };
    return [...rows].sort((a, b) => {
      const av = val(a), bv = val(b);
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [sponsors, q, sort, actions, team]);

  const toggleSort = (key: string) =>
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });

  const create = async () => {
    if (!form.company_name.trim()) return toast.error('Company name required');
    try {
      const res = await save.mutateAsync({ ...form } as any);
      toast.success('Sponsor created');
      setOpen(false); setForm({ company_name: '', industry: '', website: '', tier_target: '' });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sponsors</h1>
          <p className="text-sm text-slate-500 mt-1">{sponsors.length} sponsor accounts</p>
        </div>
        <div className="flex items-center gap-2">
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
              <div>
                <Label>Tier target</Label>
                <Select value={form.tier_target} onValueChange={v => setForm({ ...form, tier_target: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{['Presenting','Platinum','Gold','Silver','Bronze','Community'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={create}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
        <SponsorImportExport sponsors={sponsors} />
        </div>

      </div>


      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search sponsors" className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <SortTh label="Company" k="company_name" sort={sort} onSort={toggleSort} />
              <SortTh label="Stage" k="stage" sort={sort} onSort={toggleSort} />
              <SortTh label="Tier" k="tier" sort={sort} onSort={toggleSort} />
              <SortTh label="Owner" k="owner" sort={sort} onSort={toggleSort} />
              <SortTh label="Health" k="health" sort={sort} onSort={toggleSort} align="center" />
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
                    <Link to={`/labs/rhcrm/sponsors/${s.id}`} className="flex items-center gap-2 font-medium text-slate-900 hover:underline">
                      <Building2 className="w-4 h-4 text-slate-400" /> {s.company_name}
                    </Link>
                    {s.industry && <div className="text-xs text-slate-500 mt-0.5 ml-6">{s.industry}</div>}
                  </td>
                  <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded ${stageColor(s.stage)}`}>{stageLabel(s.stage)}</span></td>
                  <td className="px-4 py-3 text-slate-600">{s.tier_target ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{ownerName(s.owner_id)}</td>
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

function SortTh({ label, k, sort, onSort, align = 'left' }: { label: string; k: string; sort: { key: string; dir: 'asc' | 'desc' }; onSort: (k: string) => void; align?: 'left' | 'center' }) {
  const active = sort.key === k;
  return (
    <th className={`px-4 py-3 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <button
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 uppercase tracking-wider hover:text-slate-900 ${active ? 'text-slate-900' : ''}`}
      >
        {label}
        {active
          ? (sort.dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)
          : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
      </button>
    </th>
  );
}
