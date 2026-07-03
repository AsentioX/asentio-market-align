import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useSponsor, useSaveSponsor, useContacts, useSaveContact, useDeleteContact,
  useSponsorActions, useSaveAction, useDeleteAction, useMeetings, useSaveMeeting,
  useDeliverables, useSaveDeliverable, analyzeMeeting } from '../lib/api';
import { STAGES, stageColor, stageLabel, MOTIVATIONS, MOTIVATION_LABEL, ACTION_LIBRARY, STAGE_SUGGESTIONS, DELIVERABLE_CATEGORIES } from '../lib/constants';
import { healthScore, healthColor, daysSince, daysUntil } from '../lib/health';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Plus, Sparkles, Check, Trash2, User, Calendar, Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SponsorDetail() {
  const { id } = useParams();
  const { data: sponsor } = useSponsor(id);
  const { data: contacts = [] } = useContacts(id);
  const { data: actions = [] } = useSponsorActions(id);
  const { data: meetings = [] } = useMeetings(id);
  const { data: deliverables = [] } = useDeliverables(id);
  const save = useSaveSponsor();

  if (!sponsor) return <div className="p-8 text-slate-500">Loading…</div>;

  const score = healthScore(sponsor, contacts, actions);
  const color = healthColor(score);
  const dot = color === 'green' ? 'bg-emerald-500' : color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500';
  const openActions = actions.filter(a => a.status === 'open');
  const nextAction = openActions.sort((a,b) => (a.due_date ?? '9999') > (b.due_date ?? '9999') ? 1 : -1)[0];
  const lastContactDays = daysSince(sponsor.last_contact_at);

  const updateField = async (patch: any) => {
    try { await save.mutateAsync({ id: sponsor.id, company_name: sponsor.company_name, ...patch }); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-8 max-w-5xl">
      <Link to="/labs/rhcrm/sponsors" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> All sponsors</Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold text-slate-900">{sponsor.company_name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-500">
            {sponsor.industry && <span>{sponsor.industry}</span>}
            {sponsor.website && <><span>·</span><a href={sponsor.website.startsWith('http') ? sponsor.website : `https://${sponsor.website}`} target="_blank" className="hover:text-slate-900 underline underline-offset-2">{sponsor.website}</a></>}
            {sponsor.headquarters && <><span>·</span><span>{sponsor.headquarters}</span></>}
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border ${color === 'green' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : color === 'yellow' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            <span className={`w-2 h-2 rounded-full ${dot}`} /> Health {score}
          </div>
          {lastContactDays !== null && <div className="text-xs text-slate-500 mt-2">Last contact {lastContactDays}d ago</div>}
        </div>
      </div>

      {/* At-a-glance next action strip */}
      <div className={`p-4 rounded-lg border mb-6 ${nextAction ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50'}`}>
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Next action</div>
        {nextAction ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-medium text-slate-900">{nextAction.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {nextAction.owner_name ?? 'unassigned'} · {nextAction.due_date ? `due ${new Date(nextAction.due_date).toLocaleDateString()}` : 'no due date'} · waiting on {nextAction.waiting_on}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-rose-700">No next action. Add one below — a sponsor without a next action is at risk.</div>
        )}
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetaField label="Stage">
          <Select value={sponsor.stage} onValueChange={v => updateField({ stage: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </MetaField>
        <MetaField label="Priority">
          <Select value={sponsor.priority} onValueChange={v => updateField({ priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['low','medium','high','critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </MetaField>
        <MetaField label="Tier target">
          <Select value={sponsor.tier_target ?? ''} onValueChange={v => updateField({ tier_target: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{['Presenting','Platinum','Gold','Silver','Bronze','Community'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </MetaField>
        <MetaField label="Probability">
          <Input type="number" min={0} max={100} value={sponsor.probability ?? 0}
            onChange={e => updateField({ probability: Number(e.target.value) })} />
        </MetaField>
        <MetaField label="Estimated value ($)">
          <Input type="number" value={sponsor.estimated_value ?? 0}
            onChange={e => updateField({ estimated_value: Number(e.target.value) })} />
        </MetaField>
        <MetaField label="Relationship strength (0-10)">
          <Input type="number" min={0} max={10} value={sponsor.relationship_strength ?? 0}
            onChange={e => updateField({ relationship_strength: Number(e.target.value) })} />
        </MetaField>
      </div>

      <Tabs defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions">Actions ({actions.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="meetings">Meetings ({meetings.length})</TabsTrigger>
          <TabsTrigger value="motivations">Motivations</TabsTrigger>
          <TabsTrigger value="delivery">Delivery ({deliverables.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="mt-4"><ActionsTab sponsorId={sponsor.id} stage={sponsor.stage} actions={actions} /></TabsContent>
        <TabsContent value="contacts" className="mt-4"><ContactsTab sponsorId={sponsor.id} contacts={contacts} /></TabsContent>
        <TabsContent value="meetings" className="mt-4"><MeetingsTab sponsor={sponsor} meetings={meetings} /></TabsContent>
        <TabsContent value="motivations" className="mt-4"><MotivationsTab sponsor={sponsor} onSave={updateField} /></TabsContent>
        <TabsContent value="delivery" className="mt-4"><DeliveryTab sponsorId={sponsor.id} deliverables={deliverables} /></TabsContent>
        <TabsContent value="notes" className="mt-4">
          <Textarea rows={10} value={sponsor.notes ?? ''} onChange={e => updateField({ notes: e.target.value })} placeholder="Freeform notes..." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs text-slate-500 uppercase tracking-wider">{label}</Label><div className="mt-1">{children}</div></div>;
}

/* -------- Actions Tab -------- */
function ActionsTab({ sponsorId, stage, actions }: any) {
  const save = useSaveAction();
  const del = useDeleteAction();
  const suggestions = (STAGE_SUGGESTIONS[stage] ?? [])
    .map(k => ACTION_LIBRARY.find(a => a.key === k))
    .filter(Boolean) as any[];

  const addFromTemplate = async (tpl: any) => {
    const due = new Date(); due.setDate(due.getDate() + tpl.days);
    try { await save.mutateAsync({ sponsor_id: sponsorId, title: tpl.title, template_key: tpl.key, category: tpl.category, due_date: due.toISOString().slice(0,10), waiting_on: 'mit', status: 'open', priority: 'medium' }); toast.success('Action added'); }
    catch (e: any) { toast.error(e.message); }
  };

  const [customOpen, setCustomOpen] = useState(false);
  const [form, setForm] = useState({ title: '', due_date: '', owner_name: '', waiting_on: 'mit', priority: 'medium', category: 'outreach' });
  const addCustom = async () => {
    if (!form.title) return;
    try { await save.mutateAsync({ sponsor_id: sponsorId, status: 'open', ...form } as any); setCustomOpen(false); setForm({ title: '', due_date: '', owner_name: '', waiting_on: 'mit', priority: 'medium', category: 'outreach' }); toast.success('Added'); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      {suggestions.length > 0 && (
        <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/50">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-900 mb-2"><Lightbulb className="w-4 h-4" /> Suggested for "{stageLabel(stage)}"</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s.key} onClick={() => addFromTemplate(s)} className="text-xs px-3 py-1.5 rounded-md bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-100">
                <Plus className="w-3 h-3 inline mr-1" />{s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-900">All actions</h3>
        <Dialog open={customOpen} onOpenChange={setCustomOpen}>
          <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-3 h-3 mr-1" /> Custom action</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New action</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
                <div><Label>Owner</Label><Input value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({...form, category: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['outreach','meeting','commercial','activation','delivery','renewal'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Priority</Label><Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['low','medium','high'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Waiting on</Label><Select value={form.waiting_on} onValueChange={v => setForm({...form, waiting_on: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mit">MIT</SelectItem><SelectItem value="sponsor">Sponsor</SelectItem></SelectContent></Select></div>
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={addCustom}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
        {actions.map((a: any) => {
          const d = a.due_date ? daysUntil(a.due_date) : null;
          const overdue = d !== null && d < 0 && a.status === 'open';
          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
              <button onClick={() => save.mutate({ ...a, status: a.status === 'done' ? 'open' : 'done' })}
                className={`w-4 h-4 rounded border flex items-center justify-center ${a.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {a.status === 'done' && <Check className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${a.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{a.title}</div>
                <div className="text-xs text-slate-500">{a.owner_name ?? 'unassigned'} · wait: {a.waiting_on}{a.category ? ` · ${a.category}` : ''}</div>
              </div>
              <div className={`text-xs w-24 text-right ${overdue ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                {a.due_date ? (overdue ? `${Math.abs(d)}d late` : d === 0 ? 'today' : `in ${d}d`) : '—'}
              </div>
              <button onClick={() => del.mutate({ id: a.id, sponsor_id: sponsorId })} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          );
        })}
        {actions.length === 0 && <div className="p-6 text-center text-sm text-slate-400">No actions. Use the suggestions above.</div>}
      </div>
    </div>
  );
}

/* -------- Contacts Tab -------- */
function ContactsTab({ sponsorId, contacts }: any) {
  const save = useSaveContact();
  const del = useDeleteContact();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', email: '', linkedin: '', influence: 'medium', is_decision_maker: false });
  const add = async () => {
    if (!form.name) return;
    try { await save.mutateAsync({ sponsor_id: sponsorId, ...form } as any); setOpen(false); setForm({ name: '', role: '', email: '', linkedin: '', influence: 'medium', is_decision_maker: false }); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-3 h-3 mr-1" /> Contact</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New contact</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Role</Label><Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div><Label>LinkedIn</Label><Input value={form.linkedin} onChange={e => setForm({...form, linkedin: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Influence</Label><Select value={form.influence} onValueChange={v => setForm({...form, influence: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['low','medium','high'].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_decision_maker} onChange={e => setForm({...form, is_decision_maker: e.target.checked})} /> Decision maker</label></div>
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={add}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
        {contacts.map((c: any) => (
          <div key={c.id} className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><User className="w-4 h-4 text-slate-500" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900">{c.name} {c.is_decision_maker && <Badge variant="secondary" className="ml-1 text-[10px]">DM</Badge>}</div>
              <div className="text-xs text-slate-500">{c.role} {c.email && `· ${c.email}`}</div>
            </div>
            {c.linkedin && <a href={c.linkedin} target="_blank" className="text-xs text-slate-500 hover:text-slate-900">LinkedIn</a>}
            <button onClick={() => del.mutate({ id: c.id, sponsor_id: sponsorId })} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {contacts.length === 0 && <div className="p-6 text-center text-sm text-slate-400">No contacts yet.</div>}
      </div>
    </div>
  );
}

/* -------- Meetings Tab -------- */
function MeetingsTab({ sponsor, meetings }: any) {
  const save = useSaveMeeting();
  const saveAction = useSaveAction();
  const [open, setOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({ title: '', meeting_date: new Date().toISOString().slice(0,10), attendees: '', transcript: '', source: 'zoom' });

  const submit = async () => {
    if (!form.title) return;
    setAnalyzing(true);
    try {
      let summary = null, minutes = null, extracted = null;
      if (form.transcript && form.transcript.length > 50) {
        const ai = await analyzeMeeting(form.transcript, sponsor.company_name, sponsor.stage);
        summary = { objectives: ai.objectives, topics: ai.topics, decisions: ai.decisions, risks: ai.risks, questions: ai.questions };
        minutes = ai.minutes;
        extracted = ai.actions;
      }
      await save.mutateAsync({ sponsor_id: sponsor.id, ...form, summary, minutes, extracted_actions: extracted } as any);
      toast.success(extracted ? `Meeting saved · ${extracted.length} actions extracted` : 'Meeting saved');
      setOpen(false);
      setForm({ title: '', meeting_date: new Date().toISOString().slice(0,10), attendees: '', transcript: '', source: 'zoom' });
    } catch (e: any) { toast.error(e.message); }
    finally { setAnalyzing(false); }
  };

  const convertAction = async (m: any, a: any) => {
    const due = new Date(); due.setDate(due.getDate() + (a.due_in_days ?? 3));
    try {
      await saveAction.mutateAsync({ sponsor_id: sponsor.id, title: a.title, category: a.category, waiting_on: a.waiting_on, priority: a.priority, due_date: due.toISOString().slice(0,10), status: 'open' } as any);
      toast.success('Added to actions');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-slate-900 hover:bg-slate-800"><Sparkles className="w-3 h-3 mr-1" /> Add meeting</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New meeting</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                <div><Label>Date</Label><Input type="date" value={form.meeting_date} onChange={e => setForm({...form, meeting_date: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Attendees</Label><Input value={form.attendees} onChange={e => setForm({...form, attendees: e.target.value})} /></div>
                <div><Label>Source</Label><Select value={form.source} onValueChange={v => setForm({...form, source: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['zoom','google_meet','otter','fireflies','manual'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div>
                <Label>Transcript (paste from Zoom / Google Meet / Otter / Fireflies)</Label>
                <Textarea rows={10} value={form.transcript} onChange={e => setForm({...form, transcript: e.target.value})} placeholder="Paste the meeting transcript here. AI will summarize and extract action items." />
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800" disabled={analyzing} onClick={submit}>
                {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing with AI…</> : 'Save & analyze'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {meetings.map((m: any) => (
        <div key={m.id} className="border border-slate-200 rounded-lg bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-base font-semibold text-slate-900">{m.title}</div>
              <div className="text-xs text-slate-500">{m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : '—'} · {m.attendees}</div>
            </div>
            {m.source && <Badge variant="outline" className="text-[10px] capitalize">{m.source}</Badge>}
          </div>
          {m.summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
              <SumBlock label="Objectives" items={m.summary.objectives} />
              <SumBlock label="Decisions" items={m.summary.decisions} />
              <SumBlock label="Risks" items={m.summary.risks} />
              <SumBlock label="Open questions" items={m.summary.questions} />
            </div>
          )}
          {m.extracted_actions && m.extracted_actions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Extracted actions</div>
              <div className="space-y-1">
                {m.extracted_actions.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-slate-50 rounded px-3 py-2">
                    <div>
                      <span className="text-slate-900">{a.title}</span>
                      <span className="text-xs text-slate-500 ml-2">{a.category} · wait: {a.waiting_on} · in {a.due_in_days}d</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => convertAction(m, a)}><Plus className="w-3 h-3 mr-1" />Add</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {m.minutes && <details className="mt-3"><summary className="text-xs text-slate-500 cursor-pointer">Full minutes</summary><pre className="text-xs text-slate-700 whitespace-pre-wrap mt-2 bg-slate-50 p-3 rounded">{m.minutes}</pre></details>}
        </div>
      ))}
      {meetings.length === 0 && <div className="p-10 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg">No meetings logged. Paste a transcript to generate AI minutes and extract actions.</div>}
    </div>
  );
}
function SumBlock({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <ul className="list-disc pl-4 space-y-1 text-slate-700">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

/* -------- Motivations Tab -------- */
function MotivationsTab({ sponsor, onSave }: any) {
  const [vals, setVals] = useState<Record<string, number>>({ ...(sponsor.motivations ?? {}) });
  const save = async () => { await onSave({ motivations: vals }); toast.success('Saved'); };
  return (
    <div className="space-y-4 max-w-xl">
      <p className="text-sm text-slate-500">Rank what motivates this sponsor. These guide action recommendations.</p>
      {MOTIVATIONS.map(k => (
        <div key={k} className="space-y-1">
          <div className="flex items-center justify-between text-sm"><span>{MOTIVATION_LABEL[k]}</span><span className="text-slate-500 tabular-nums">{vals[k] ?? 0}</span></div>
          <Slider min={0} max={10} step={1} value={[vals[k] ?? 0]} onValueChange={(v) => setVals({ ...vals, [k]: v[0] })} />
        </div>
      ))}
      <Button className="bg-slate-900 hover:bg-slate-800" onClick={save}>Save motivations</Button>
    </div>
  );
}

/* -------- Delivery Tab -------- */
function DeliveryTab({ sponsorId, deliverables }: any) {
  const save = useSaveDeliverable();
  const [form, setForm] = useState({ category: 'Workshop', title: '' });
  const add = async () => {
    if (!form.title) return;
    try { await save.mutateAsync({ sponsor_id: sponsorId, ...form } as any); setForm({ category: form.category, title: '' }); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{DELIVERABLE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Deliverable e.g. 'Reality of AI workshop'" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <Button variant="outline" onClick={add}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>
      <div className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
        {deliverables.map((d: any) => (
          <div key={d.id} className="px-4 py-3 flex items-center gap-3">
            <Badge variant="secondary" className="text-[10px]">{d.category}</Badge>
            <div className="flex-1 text-sm text-slate-900">{d.title}</div>
            <Select value={d.status} onValueChange={(v) => save.mutate({ ...d, status: v })}>
              <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{['pending','in_progress','confirmed','delivered'].map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
        {deliverables.length === 0 && <div className="p-6 text-center text-sm text-slate-400">Add sponsor benefits to track fulfillment.</div>}
      </div>
    </div>
  );
}
