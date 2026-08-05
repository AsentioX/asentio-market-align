import { useState } from 'react';
import { usePastSponsorships, useSavePastSponsorship, useDeletePastSponsorship } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = { year: String(new Date().getFullYear() - 1), amount: '', tier: '', feedback: '' };

export default function PastSponsorships({ sponsorId }: { sponsorId: string }) {
  const { data: rows = [] } = usePastSponsorships(sponsorId);
  const save = useSavePastSponsorship();
  const del = useDeletePastSponsorship();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const add = async () => {
    const year = Number(form.year);
    if (!year) return toast.error('Year is required');
    try {
      await save.mutateAsync({
        sponsor_id: sponsorId,
        year,
        amount: form.amount ? Number(form.amount) : null,
        tier: form.tier || null,
        feedback: form.feedback || null,
      });
      setForm(emptyForm); setOpen(false);
      toast.success('Past sponsorship added');
    } catch (e: any) { toast.error(e.message); }
  };

  const total = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {rows.length ? `${rows.length} prior year${rows.length > 1 ? 's' : ''} · $${total.toLocaleString()} total` : 'No prior sponsorships recorded.'}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800"><Plus className="w-4 h-4 mr-1" /> Add past sponsorship</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Past sponsorship</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></div>
                <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
                <div><Label>Tier</Label><Input value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} placeholder="Gold" /></div>
              </div>
              <div><Label>Feedback</Label><Textarea rows={4} value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} placeholder="What worked, what they asked for next time…" /></div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={add}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.id} className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  {r.year}{r.tier ? ` · ${r.tier}` : ''}{r.amount != null ? ` · $${Number(r.amount).toLocaleString()}` : ''}
                </div>
                {r.feedback && <div className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{r.feedback}</div>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate({ id: r.id, sponsor_id: sponsorId })}>
                <Trash2 className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
