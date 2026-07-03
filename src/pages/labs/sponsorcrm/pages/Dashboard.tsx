import { Link } from 'react-router-dom';
import { useAllActions, useSponsors } from '../lib/api';
import { STAGES, stageColor, stageLabel } from '../lib/constants';
import { daysUntil, healthScore, healthColor } from '../lib/health';
import { AlertTriangle, Clock, ArrowRightLeft, Building2, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { data: sponsors = [] } = useSponsors();
  const { data: actions = [] } = useAllActions();

  const today = new Date(); today.setHours(0,0,0,0);
  const isToday = (d: string | null) => d && new Date(d).toDateString() === today.toDateString();
  const isOverdue = (d: string | null) => d && new Date(d) < today;

  const open = actions.filter(a => a.status === 'open');
  const dueToday = open.filter(a => isToday(a.due_date));
  const overdue = open.filter(a => isOverdue(a.due_date));

  const waitingMit = sponsors.filter(s => open.some(a => a.sponsor_id === s.id && a.waiting_on === 'mit'));
  const waitingSponsor = sponsors.filter(s => open.some(a => a.sponsor_id === s.id && a.waiting_on === 'sponsor'));

  const activeStages: string[] = STAGES.filter(s => s.key !== 'closed_lost').map(s => s.key);
  const noAction = sponsors.filter(s => activeStages.includes(s.stage) && !open.some(a => a.sponsor_id === s.id));

  const sponsorName = (id: string) => sponsors.find(s => s.id === id)?.company_name ?? '';

  const stageCounts = STAGES.map(s => ({ ...s, count: sponsors.filter(x => x.stage === s.key).length }));

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider">Today · {today.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>
        <h1 className="text-3xl font-semibold text-slate-900 mt-1">Mission control</h1>
        <p className="text-slate-500 mt-1">What needs to happen next, who owns it, and when.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Open actions" value={open.length} />
        <Kpi label="Overdue" value={overdue.length} tone={overdue.length > 0 ? 'red' : 'default'} />
        <Kpi label="Sponsors at risk" value={noAction.length} tone={noAction.length > 0 ? 'amber' : 'default'} />
      </div>

      <Section title="Due today" icon={<Clock className="w-4 h-4" />} empty={dueToday.length === 0 ? 'Nothing due today. Ship something proactive.' : undefined}>
        {dueToday.map(a => <ActionRow key={a.id} sponsor={sponsorName(a.sponsor_id)} title={a.title} sponsorId={a.sponsor_id} priority={a.priority} due={a.due_date} owner={a.owner_name} />)}
      </Section>

      <Section title="Overdue" icon={<AlertTriangle className="w-4 h-4 text-rose-500" />} empty={overdue.length === 0 ? 'No overdue actions. Nice.' : undefined}>
        {overdue.map(a => <ActionRow key={a.id} sponsor={sponsorName(a.sponsor_id)} sponsorId={a.sponsor_id} title={a.title} priority={a.priority} due={a.due_date} owner={a.owner_name} overdue />)}
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Waiting on MIT" icon={<ArrowRightLeft className="w-4 h-4" />} empty={waitingMit.length === 0 ? 'No sponsors blocked on us.' : undefined}>
          {waitingMit.map(s => <SponsorRow key={s.id} s={s} sponsors={sponsors} actions={actions} />)}
        </Section>
        <Section title="Waiting on sponsor" icon={<ArrowRightLeft className="w-4 h-4" />} empty={waitingSponsor.length === 0 ? 'No sponsors we\'re waiting on.' : undefined}>
          {waitingSponsor.map(s => <SponsorRow key={s.id} s={s} sponsors={sponsors} actions={actions} />)}
        </Section>
      </div>

      <Section title="Needs attention · no next action" icon={<Sparkles className="w-4 h-4 text-amber-500" />} empty={noAction.length === 0 ? 'Every sponsor has a next action. Excellent.' : undefined}>
        {noAction.map(s => (
          <Link key={s.id} to={`/labs/sponsorcrm/sponsors/${s.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-900">{s.company_name}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded ${stageColor(s.stage)}`}>{stageLabel(s.stage)}</span>
            </div>
            <span className="text-xs text-rose-600">Add next action →</span>
          </Link>
        ))}
      </Section>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Pipeline summary</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {stageCounts.map(s => (
            <Link key={s.key} to="/labs/sponsorcrm/pipeline" className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white">
              <div className="text-2xl font-semibold text-slate-900">{s.count}</div>
              <div className="text-[11px] text-slate-500 mt-1">{s.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone='default' }: { label: string; value: number; tone?: 'default'|'red'|'amber' }) {
  const cls = tone === 'red' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : 'text-slate-900';
  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white">
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`text-3xl font-semibold mt-2 ${cls}`}>{value}</div>
    </div>
  );
}

function Section({ title, icon, children, empty }: { title: string; icon: React.ReactNode; children: React.ReactNode; empty?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900">{icon} {title}</div>
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        {empty ? <div className="p-6 text-sm text-slate-400 text-center">{empty}</div> : children}
      </div>
    </div>
  );
}

function ActionRow({ sponsor, sponsorId, title, priority, due, owner, overdue }: { sponsor: string; sponsorId: string; title: string; priority: string; due: string | null; owner: string | null; overdue?: boolean }) {
  const d = due ? daysUntil(due) : null;
  return (
    <Link to={`/labs/sponsorcrm/sponsors/${sponsorId}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {priority === 'high' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
          <span className="text-sm font-medium text-slate-900 truncate">{title}</span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{sponsor} · {owner ?? 'unassigned'}</div>
      </div>
      <div className={`text-xs whitespace-nowrap ${overdue ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
        {due ? (overdue ? `${Math.abs(d ?? 0)}d overdue` : d === 0 ? 'today' : `in ${d}d`) : 'no date'}
      </div>
    </Link>
  );
}

function SponsorRow({ s, sponsors, actions }: any) {
  const contacts: any[] = [];
  const score = healthScore(s, contacts, actions.filter((a: any) => a.sponsor_id === s.id));
  const color = healthColor(score);
  const dot = color === 'green' ? 'bg-emerald-500' : color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <Link to={`/labs/sponsorcrm/sponsors/${s.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="font-medium text-slate-900 truncate">{s.company_name}</span>
      </div>
      <span className={`text-[11px] px-2 py-0.5 rounded ${stageColor(s.stage)}`}>{stageLabel(s.stage)}</span>
    </Link>
  );
}
