import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard, GitBranch, FileText, Receipt, TrendingUp, Wallet,
  LineChart as LineChartIcon, Users, BarChart3, Settings, Search, Bell,
  Sparkles, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter,
  Download, Calendar, CheckCircle2, AlertCircle, Clock, Sun, Moon,
  ChevronRight, Send, X, Zap, DollarSign, Briefcase, FileSignature,
  Upload, Trash2, FileSpreadsheet, Pencil, Loader2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from 'recharts';

/* =========================================================================
   THEME
   ========================================================================= */
const useDark = () => {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }, [dark]);
  return [dark, setDark] as const;
};

/* =========================================================================
   MOCK DATA
   ========================================================================= */
const KPIS = [
  { label: 'Revenue YTD',      value: '$2.84M', delta: '+18.2%', up: true,  hint: 'vs. last year' },
  { label: 'Signed Revenue',   value: '$1.92M', delta: '+12.4%', up: true,  hint: 'contracts in force' },
  { label: 'Forecast Revenue', value: '$3.61M', delta: '+9.1%',  up: true,  hint: 'weighted Q4 + 2026' },
  { label: 'Accounts Receivable', value: '$412K', delta: '-6.2%', up: false, hint: 'net of >90d' },
  { label: 'Cash Balance',     value: '$1.18M', delta: '+3.4%',  up: true,  hint: 'across operating' },
  { label: 'Monthly Burn',     value: '$184K',  delta: '+2.1%',  up: false, hint: 'fixed + variable' },
  { label: 'Net Profit',       value: '$612K',  delta: '+22.0%', up: true,  hint: 'YTD margin 21.5%' },
  { label: 'Runway',           value: '14.3 mo', delta: '+1.8mo', up: true,  hint: 'at current burn' },
  { label: 'Active Clients',   value: '38',     delta: '+5',     up: true,  hint: '12 retainers' },
  { label: 'Proposal Win Rate',value: '47%',    delta: '+6 pts', up: true,  hint: 'L90 cohort' },
];

const REVENUE_TREND = [
  { m: 'Jan', revenue: 184, expense: 142 }, { m: 'Feb', revenue: 212, expense: 148 },
  { m: 'Mar', revenue: 246, expense: 156 }, { m: 'Apr', revenue: 228, expense: 161 },
  { m: 'May', revenue: 271, expense: 168 }, { m: 'Jun', revenue: 298, expense: 172 },
  { m: 'Jul', revenue: 312, expense: 179 }, { m: 'Aug', revenue: 334, expense: 184 },
  { m: 'Sep', revenue: 358, expense: 187 }, { m: 'Oct', revenue: 381, expense: 191 },
  { m: 'Nov', revenue: 402, expense: 196 }, { m: 'Dec', revenue: 428, expense: 201 },
];

const REVENUE_BY_CLIENT = [
  { name: 'Northwind XR',  value: 412 },
  { name: 'Helix Capital', value: 318 },
  { name: 'Atlas Robotics',value: 264 },
  { name: 'Meridian Labs', value: 198 },
  { name: 'Verge Studios', value: 162 },
  { name: 'Other (24)',    value: 487 },
];

const EXPENSE_CATS = [
  { name: 'Contractors', value: 312, color: '#6366F1' },
  { name: 'Software',    value: 86,  color: '#22D3EE' },
  { name: 'Travel',      value: 64,  color: '#F59E0B' },
  { name: 'Events',      value: 48,  color: '#EC4899' },
  { name: 'Marketing',   value: 41,  color: '#10B981' },
  { name: 'Legal',       value: 22,  color: '#A78BFA' },
  { name: 'Operations',  value: 38,  color: '#EF4444' },
  { name: 'Equipment',   value: 18,  color: '#94A3B8' },
];

const FUNNEL = [
  { stage: 'Lead',          count: 84 },
  { stage: 'Discovery',     count: 41 },
  { stage: 'Proposal Sent', count: 23 },
  { stage: 'Negotiation',   count: 12 },
  { stage: 'Signed',        count: 7  },
];

const ACTIVITY = [
  { type: 'contract',  text: 'Contract signed — Northwind XR · $180K', when: '2h ago', icon: FileSignature, tone: 'emerald' },
  { type: 'invoice',   text: 'Invoice INV-0421 paid — Helix Capital · $42K', when: '5h ago', icon: CheckCircle2, tone: 'sky' },
  { type: 'expense',   text: 'Expense added — AWS · $4,820', when: 'Yesterday', icon: Receipt, tone: 'amber' },
  { type: 'renewal',   text: 'Upcoming renewal — Atlas Robotics in 12 days', when: 'Yesterday', icon: Clock, tone: 'violet' },
  { type: 'proposal',  text: 'Proposal moved to Negotiation — Meridian Labs', when: '2d ago', icon: TrendingUp, tone: 'fuchsia' },
  { type: 'invoice',   text: 'Invoice INV-0418 overdue — Verge Studios · $18K', when: '3d ago', icon: AlertCircle, tone: 'rose' },
];

type Stage = 'Lead' | 'Discovery' | 'Proposal Sent' | 'Negotiation' | 'Contract Signed' | 'Lost';
const STAGES: Stage[] = ['Lead','Discovery','Proposal Sent','Negotiation','Contract Signed','Lost'];

interface Opp {
  id: string; company: string; contact: string; value: number; prob: number;
  close: string; stage: Stage; tag: string; next: string;
}
const OPPS: Opp[] = [
  { id:'O-001', company:'Northwind XR',   contact:'M. Aoki',      value:180000, prob:0.95, close:'2026-05-30', stage:'Contract Signed', tag:'Strategy',     next:'Kickoff scheduled'   },
  { id:'O-002', company:'Helix Capital',  contact:'J. Reyes',     value:240000, prob:0.70, close:'2026-06-15', stage:'Negotiation',     tag:'GTM',          next:'Send redlines'       },
  { id:'O-003', company:'Atlas Robotics', contact:'S. Patel',     value:96000,  prob:0.55, close:'2026-06-30', stage:'Proposal Sent',   tag:'Advisory',     next:'Follow up Friday'    },
  { id:'O-004', company:'Meridian Labs',  contact:'L. Chen',      value:128000, prob:0.45, close:'2026-07-12', stage:'Proposal Sent',   tag:'Strategy',     next:'Schedule deep dive'  },
  { id:'O-005', company:'Verge Studios',  contact:'D. Kim',       value:54000,  prob:0.30, close:'2026-07-22', stage:'Discovery',       tag:'Workshop',     next:'Discovery call'      },
  { id:'O-006', company:'Cobalt Health',  contact:'N. Hassan',    value:312000, prob:0.20, close:'2026-08-10', stage:'Discovery',       tag:'Transformation', next:'Send teaser deck'  },
  { id:'O-007', company:'Rivet AI',       contact:'P. Okonkwo',   value:72000,  prob:0.10, close:'2026-08-30', stage:'Lead',            tag:'Inbound',      next:'Qualification call'  },
  { id:'O-008', company:'Polaris Energy', contact:'R. Müller',    value:184000, prob:0.10, close:'2026-09-05', stage:'Lead',            tag:'Outbound',     next:'Intro email'         },
  { id:'O-009', company:'Foundry Foods',  contact:'A. Garcia',    value:42000,  prob:0,    close:'2026-04-20', stage:'Lost',            tag:'Workshop',     next:'Re-engage Q3'        },
];

const CONTRACTS = [
  { id:'C-2041', client:'Northwind XR',   project:'GTM Strategy',          value:180000, start:'2026-06-01', end:'2026-09-30', status:'Signed', sched:'3 milestones' },
  { id:'C-2040', client:'Helix Capital',  project:'Investor Narrative',    value:240000, start:'2026-05-15', end:'2026-11-15', status:'Awaiting Signature', sched:'Monthly' },
  { id:'C-2039', client:'Atlas Robotics', project:'Channel Build-out',     value:96000,  start:'2026-04-01', end:'2026-07-31', status:'Signed',  sched:'2 milestones' },
  { id:'C-2038', client:'Meridian Labs',  project:'Org Design',            value:128000, start:'2026-03-10', end:'2026-06-10', status:'Completed', sched:'Lump sum' },
  { id:'C-2037', client:'Verge Studios',  project:'Brand Repositioning',   value:54000,  start:'2026-05-01', end:'2026-06-30', status:'Sent',    sched:'50/50' },
  { id:'C-2036', client:'Cobalt Health',  project:'Discovery Sprint',      value:36000,  start:'2026-05-20', end:'2026-06-20', status:'Draft',   sched:'Lump sum' },
];

const INVOICES = [
  { id:'INV-0421', client:'Helix Capital',  due:'2026-05-08', amount:42000, status:'Paid',     contract:'C-2040' },
  { id:'INV-0420', client:'Northwind XR',   due:'2026-05-30', amount:60000, status:'Sent',     contract:'C-2041' },
  { id:'INV-0419', client:'Atlas Robotics', due:'2026-06-15', amount:48000, status:'Scheduled',contract:'C-2039' },
  { id:'INV-0418', client:'Verge Studios',  due:'2026-04-30', amount:18000, status:'Overdue',  contract:'C-2037' },
  { id:'INV-0417', client:'Meridian Labs',  due:'2026-04-10', amount:64000, status:'Paid',     contract:'C-2038' },
  { id:'INV-0416', client:'Cobalt Health',  due:'2026-06-20', amount:36000, status:'Draft',    contract:'C-2036' },
  { id:'INV-0415', client:'Northwind XR',   due:'2026-07-30', amount:60000, status:'Scheduled',contract:'C-2041' },
];

const EXPENSES = [
  { id:'E-882', vendor:'AWS',           cat:'Software',    amount:4820, date:'2026-05-12', recurring:true,  notes:'Production' },
  { id:'E-881', vendor:'United Airlines',cat:'Travel',     amount:1240, date:'2026-05-10', recurring:false, notes:'NYC client' },
  { id:'E-880', vendor:'AWE 2026',      cat:'Events',      amount:8500, date:'2026-05-08', recurring:false, notes:'Booth + travel' },
  { id:'E-879', vendor:'Outside Counsel',cat:'Legal',      amount:6200, date:'2026-05-05', recurring:false, notes:'NDA review' },
  { id:'E-878', vendor:'M. Aoki (1099)', cat:'Contractors',amount:14400,date:'2026-05-01', recurring:true,  notes:'Strategy IC' },
  { id:'E-877', vendor:'Notion',         cat:'Software',   amount:480,  date:'2026-05-01', recurring:true,  notes:'Team plan' },
  { id:'E-876', vendor:'LinkedIn Ads',   cat:'Marketing',  amount:3200, date:'2026-04-29', recurring:false, notes:'XR campaign' },
];

const CLIENTS = [
  { name:'Northwind XR',  revenue:412000, margin:0.34, status:'Healthy', tenure:'2.1y' },
  { name:'Helix Capital', revenue:318000, margin:0.41, status:'Healthy', tenure:'1.4y' },
  { name:'Atlas Robotics',revenue:264000, margin:0.28, status:'Healthy', tenure:'3.0y' },
  { name:'Meridian Labs', revenue:198000, margin:0.22, status:'At Risk', tenure:'0.8y' },
  { name:'Verge Studios', revenue:162000, margin:0.18, status:'At Risk', tenure:'1.1y' },
  { name:'Cobalt Health', revenue:98000,  margin:0.31, status:'Healthy', tenure:'0.4y' },
  { name:'Rivet AI',      revenue:42000,  margin:0.12, status:'Inactive',tenure:'2.3y' },
];

const FORECAST = [
  { m:'Q1', conservative:540, expected:620, aggressive:710 },
  { m:'Q2', conservative:610, expected:740, aggressive:880 },
  { m:'Q3', conservative:680, expected:840, aggressive:1020 },
  { m:'Q4', conservative:720, expected:920, aggressive:1180 },
];

/* =========================================================================
   PRIMITIVES
   ========================================================================= */
const cn = (...c:(string|false|undefined)[]) => c.filter(Boolean).join(' ');

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...p }) => (
  <div
    className={cn(
      'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
      'dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur',
      className
    )}
    {...p}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, sub, children }:{title:string; sub?:string; children?:React.ReactNode}) => (
  <div className="flex items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {sub && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sub}</p>}
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

const Pill = ({ tone='slate', children }:{tone?:string; children:React.ReactNode}) => {
  const tones: Record<string,string> = {
    slate:    'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300',
    emerald:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    sky:      'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    amber:    'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    violet:   'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    fuchsia:  'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
    rose:     'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    indigo:   'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  };
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', tones[tone])}>{children}</span>;
};

const Btn = ({ variant='ghost', className, ...p }:any) => (
  <button
    className={cn(
      'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-all',
      variant === 'primary' && 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
      variant === 'ghost'   && 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
      variant === 'outline' && 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5',
      className,
    )}
    {...p}
  />
);

/* =========================================================================
   NAV
   ========================================================================= */
type Section =
  | 'overview' | 'pipeline' | 'contracts' | 'invoices' | 'revenue'
  | 'expenses' | 'forecasting' | 'clients' | 'reports' | 'settings';

const NAV: { id: Section; label: string; icon: any }[] = [
  { id:'overview',    label:'Overview',    icon: LayoutDashboard },
  { id:'pipeline',    label:'Pipeline',    icon: GitBranch },
  { id:'contracts',   label:'Contracts',   icon: FileText },
  { id:'invoices',    label:'Invoices',    icon: Receipt },
  { id:'revenue',     label:'Revenue',     icon: TrendingUp },
  { id:'expenses',    label:'Expenses',    icon: Wallet },
  { id:'forecasting', label:'Forecasting', icon: LineChartIcon },
  { id:'clients',     label:'Clients',     icon: Users },
  { id:'reports',     label:'Reports',     icon: BarChart3 },
  { id:'settings',    label:'Settings',    icon: Settings },
];

/* =========================================================================
   CHART HELPERS
   ========================================================================= */
const chartTickColor = (dark:boolean) => (dark ? '#94A3B8' : '#64748B');
const chartGrid      = (dark:boolean) => (dark ? '#1E293B' : '#E2E8F0');

const chartTooltipStyle = (dark:boolean) => ({
  contentStyle: {
    background: dark ? 'rgba(15,23,42,0.95)' : '#fff',
    border: `1px solid ${dark ? '#1E293B' : '#E2E8F0'}`,
    borderRadius: 10,
    color: dark ? '#E2E8F0' : '#0F172A',
    fontSize: 12,
  },
  cursor: { fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' },
});

/* =========================================================================
   SECTIONS
   ========================================================================= */
const Overview = ({ dark }:{dark:boolean}) => (
  <div className="space-y-6">
    <SectionHeader title="Overview" sub="Today, May 13 — your business at a glance.">
      <Btn variant="outline"><Calendar className="w-4 h-4" /> May 2026</Btn>
      <Btn variant="primary"><Plus className="w-4 h-4" /> New</Btn>
    </SectionHeader>

    {/* KPI grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {KPIS.map(k => (
        <Card key={k.label} className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{k.label}</div>
          <div className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-white">{k.value}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={cn('inline-flex items-center text-xs font-medium', k.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
              {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {k.delta}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{k.hint}</span>
          </div>
        </Card>
      ))}
    </div>

    {/* Charts row 1 */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">Monthly revenue trend</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Revenue vs. operating expense, $K</div>
          </div>
          <Pill tone="emerald">+18.2% YoY</Pill>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_TREND} margin={{ top:5, right:8, bottom:0, left:-20 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#6366F1" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#94A3B8" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartGrid(dark)} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <YAxis stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip {...chartTooltipStyle(dark)} />
              <Area type="monotone" dataKey="expense" stroke="#94A3B8" strokeWidth={1.5} fill="url(#gExp)" />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2}   fill="url(#gRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-slate-900 dark:text-white">Expense categories</div>
          <Pill>L30D</Pill>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={EXPENSE_CATS} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={2}>
                {EXPENSE_CATS.map(c => <Cell key={c.name} fill={c.color} stroke="none" />)}
              </Pie>
              <Tooltip {...chartTooltipStyle(dark)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {EXPENSE_CATS.map(c => (
            <div key={c.name} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ background:c.color }} />
              <span className="flex-1 truncate">{c.name}</span>
              <span className="tabular-nums text-slate-900 dark:text-slate-200">${c.value}K</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Charts row 2 */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Revenue by client</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_BY_CLIENT} layout="vertical" margin={{ left:10, right:10 }}>
              <CartesianGrid stroke={chartGrid(dark)} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <YAxis dataKey="name" type="category" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} width={100} />
              <Tooltip {...chartTooltipStyle(dark)} />
              <Bar dataKey="value" fill="#6366F1" radius={[0,4,4,0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Sales funnel</div>
        <div className="space-y-2.5">
          {FUNNEL.map((s, i) => {
            const max = FUNNEL[0].count;
            const pct = (s.count / max) * 100;
            return (
              <div key={s.stage}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{s.stage}</span>
                  <span className="tabular-nums text-slate-900 dark:text-white font-medium">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width:`${pct}%`, background:`linear-gradient(90deg, #6366F1 ${100-i*15}%, #22D3EE)` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Cash flow forecast</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REVENUE_TREND.map(d => ({ m:d.m, cash: d.revenue - d.expense + 80 }))} margin={{ left:-20 }}>
              <CartesianGrid stroke={chartGrid(dark)} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <YAxis stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip {...chartTooltipStyle(dark)} />
              <Line type="monotone" dataKey="cash" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>

    {/* Activity */}
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-slate-900 dark:text-white">Recent activity</div>
        <Btn variant="ghost" className="!h-7 !px-2 text-xs">View all <ChevronRight className="w-3 h-3" /></Btn>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {ACTIVITY.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                a.tone === 'emerald' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
                a.tone === 'sky'     && 'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
                a.tone === 'amber'   && 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
                a.tone === 'violet'  && 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
                a.tone === 'fuchsia' && 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
                a.tone === 'rose'    && 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 text-sm text-slate-800 dark:text-slate-200">{a.text}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">{a.when}</div>
            </div>
          );
        })}
      </div>
    </Card>
  </div>
);

/* ---------- Pipeline ---------- */
const Pipeline = () => {
  const [view, setView] = useState<'kanban'|'table'|'forecast'>('kanban');
  const weighted = useMemo(() => OPPS.reduce((s,o) => s + o.value*o.prob, 0), []);
  const total    = useMemo(() => OPPS.filter(o => o.stage !== 'Lost').reduce((s,o) => s + o.value, 0), []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Pipeline" sub={`$${(total/1000).toFixed(0)}K open · $${(weighted/1000).toFixed(0)}K weighted`}>
        <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-white/5">
          {(['kanban','table','forecast'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-3 h-7 text-xs font-medium rounded-md capitalize transition-colors',
                view===v ? 'bg-white shadow-sm text-slate-900 dark:bg-white/10 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>
              {v}
            </button>
          ))}
        </div>
        <Btn variant="primary"><Plus className="w-4 h-4" /> New deal</Btn>
      </SectionHeader>

      {view==='kanban' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {STAGES.map(stage => {
            const items = OPPS.filter(o => o.stage === stage);
            const sum = items.reduce((s,o) => s + o.value, 0);
            return (
              <div key={stage} className="rounded-xl bg-slate-50/70 dark:bg-white/[0.02] p-2.5">
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{stage}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">${(sum/1000).toFixed(0)}K · {items.length}</div>
                </div>
                <div className="space-y-2">
                  {items.map(o => (
                    <div key={o.id} className="rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 p-3 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{o.company}</div>
                        <Pill tone="indigo">{Math.round(o.prob*100)}%</Pill>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{o.contact}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm tabular-nums font-semibold text-slate-900 dark:text-white">${(o.value/1000).toFixed(0)}K</div>
                        <Pill>{o.tag}</Pill>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {o.next}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view==='table' && <DataTable
        head={['Deal','Stage','Value','Prob','Weighted','Close','Next']}
        rows={OPPS.map(o => [
          <div key="c"><div className="font-medium text-slate-900 dark:text-white">{o.company}</div><div className="text-xs text-slate-500">{o.contact}</div></div>,
          <Pill tone={o.stage==='Contract Signed'?'emerald':o.stage==='Lost'?'rose':'indigo'}>{o.stage}</Pill>,
          <span className="tabular-nums">${o.value.toLocaleString()}</span>,
          <span className="tabular-nums">{Math.round(o.prob*100)}%</span>,
          <span className="tabular-nums font-medium">${Math.round(o.value*o.prob).toLocaleString()}</span>,
          o.close,
          <span className="text-slate-500">{o.next}</span>,
        ])}
      />}

      {view==='forecast' && (
        <Card className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Open</div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">${(total/1000).toFixed(0)}K</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Weighted</div>
              <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mt-1">${(weighted/1000).toFixed(0)}K</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Avg deal size</div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">${(total/OPPS.filter(o=>o.stage!=='Lost').length/1000).toFixed(0)}K</div>
            </div>
          </div>
          <div className="mt-6 space-y-2.5">
            {STAGES.filter(s => s!=='Lost').map(s => {
              const items = OPPS.filter(o => o.stage===s);
              const sum = items.reduce((a,o)=>a+o.value,0);
              const w   = items.reduce((a,o)=>a+o.value*o.prob,0);
              return (
                <div key={s} className="grid grid-cols-12 items-center gap-3 text-sm">
                  <div className="col-span-3 text-slate-600 dark:text-slate-300">{s}</div>
                  <div className="col-span-7 h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width:`${Math.min(100,(sum/300000)*100)}%` }} />
                  </div>
                  <div className="col-span-2 text-right tabular-nums text-slate-900 dark:text-white">${(w/1000).toFixed(0)}K</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ---------- shared table ---------- */
const DataTable = ({ head, rows }:{head:string[]; rows:React.ReactNode[][]}) => (
  <Card className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/[0.02]">
            {head.map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {rows.map((r,i) => (
            <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              {r.map((c,j) => <td key={j} className="px-4 py-3 text-slate-700 dark:text-slate-300">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

/* ---------- Contracts ---------- */
const Contracts = () => (
  <div className="space-y-6">
    <SectionHeader title="Contracts" sub="6 active · $734K under management">
      <Btn variant="outline"><Filter className="w-4 h-4" /> Filter</Btn>
      <Btn variant="primary"><Plus className="w-4 h-4" /> New contract</Btn>
    </SectionHeader>
    <DataTable
      head={['Contract','Client','Project','Value','Term','Schedule','Status']}
      rows={CONTRACTS.map(c => [
        <span className="font-mono text-xs text-slate-500">{c.id}</span>,
        <span className="font-medium text-slate-900 dark:text-white">{c.client}</span>,
        c.project,
        <span className="tabular-nums">${c.value.toLocaleString()}</span>,
        <span className="text-xs text-slate-500">{c.start} → {c.end}</span>,
        c.sched,
        <Pill tone={
          c.status==='Signed'?'emerald':
          c.status==='Awaiting Signature'?'amber':
          c.status==='Sent'?'sky':
          c.status==='Completed'?'indigo':'slate'
        }>{c.status}</Pill>,
      ])}
    />
  </div>
);

/* ---------- Invoices ---------- */
const Invoices = ({ dark }:{dark:boolean}) => {
  const totals = useMemo(() => {
    const paid     = INVOICES.filter(i => i.status==='Paid').reduce((s,i)=>s+i.amount,0);
    const overdue  = INVOICES.filter(i => i.status==='Overdue').reduce((s,i)=>s+i.amount,0);
    const out      = INVOICES.filter(i => ['Sent','Overdue'].includes(i.status)).reduce((s,i)=>s+i.amount,0);
    const sched    = INVOICES.filter(i => i.status==='Scheduled').reduce((s,i)=>s+i.amount,0);
    return { paid, overdue, out, sched };
  }, []);

  const aging = [
    { bucket:'0-30',  amount: 60000, color:'#10B981' },
    { bucket:'30-60', amount: 0,     color:'#F59E0B' },
    { bucket:'60-90', amount: 18000, color:'#F97316' },
    { bucket:'90+',   amount: 0,     color:'#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Invoices" sub="Receivables, scheduling, and aging">
        <Btn variant="outline"><Download className="w-4 h-4" /> Export</Btn>
        <Btn variant="primary"><Plus className="w-4 h-4" /> New invoice</Btn>
      </SectionHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l:'Paid (MTD)',     v:totals.paid,    tone:'emerald' },
          { l:'Outstanding',    v:totals.out,     tone:'amber' },
          { l:'Overdue',        v:totals.overdue, tone:'rose' },
          { l:'Scheduled',      v:totals.sched,   tone:'sky' },
        ].map(s => (
          <Card key={s.l} className="p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">{s.l}</div>
            <div className="mt-1 text-xl font-semibold text-slate-900 dark:text-white tabular-nums">${s.v.toLocaleString()}</div>
            <Pill tone={s.tone as any}>{s.l==='Overdue' ? '1 invoice' : `${INVOICES.filter(i => (s.l.startsWith('Paid') && i.status==='Paid') || (s.l==='Outstanding' && ['Sent','Overdue'].includes(i.status)) || (s.l==='Overdue' && i.status==='Overdue') || (s.l==='Scheduled' && i.status==='Scheduled')).length} items`}</Pill>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Monthly collections</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_TREND.slice(-6)} margin={{ left:-20 }}>
                <CartesianGrid stroke={chartGrid(dark)} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip {...chartTooltipStyle(dark)} />
                <Bar dataKey="revenue" fill="#10B981" radius={[6,6,0,0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Aging analysis</div>
          <div className="space-y-3">
            {aging.map(a => (
              <div key={a.bucket}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{a.bucket} days</span>
                  <span className="tabular-nums font-medium text-slate-900 dark:text-white">${a.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width:`${Math.min(100,(a.amount/60000)*100)}%`, background:a.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <DataTable
        head={['Invoice','Client','Due','Amount','Contract','Status']}
        rows={INVOICES.map(i => [
          <span className="font-mono text-xs text-slate-500">{i.id}</span>,
          <span className="font-medium text-slate-900 dark:text-white">{i.client}</span>,
          i.due,
          <span className="tabular-nums">${i.amount.toLocaleString()}</span>,
          <span className="font-mono text-xs text-slate-500">{i.contract}</span>,
          <Pill tone={
            i.status==='Paid'?'emerald':
            i.status==='Overdue'?'rose':
            i.status==='Sent'?'sky':
            i.status==='Scheduled'?'amber':'slate'
          }>{i.status}</Pill>,
        ])}
      />
    </div>
  );
};

/* ---------- Revenue ---------- */
const Revenue = ({ dark }:{dark:boolean}) => {
  const { statements, add, remove } = useBankStatements();
  const [error, setError] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const agg = aggregateByMonth(statements);
    if (agg.length === 0) return REVENUE_TREND.map(d => ({...d, projected: d.revenue * 1.15}));
    return agg.map(d => ({ m: d.m, revenue: d.revenue, projected: Math.round(d.revenue * 1.15) }));
  }, [statements]);

  const totalTxns = useMemo(
    () => statements.reduce((sum, s) => sum + s.transactions.length, 0),
    [statements]
  );
  const totalRevenue = useMemo(() => {
    let sum = 0;
    for (const s of statements) for (const t of s.transactions) if (t.amount > 0) sum += t.amount;
    return sum;
  }, [statements]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setError(null);
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const txns = parseCSV(text);
        if (txns.length === 0) {
          setError(`${file.name}: no transactions found. Expected CSV with date and amount columns.`);
          continue;
        }
        add({
          id: crypto.randomUUID(),
          name: file.name,
          uploadedAt: new Date().toISOString(),
          transactions: txns,
        });
      } catch (e:any) {
        setError(`${file.name}: ${e?.message || 'failed to parse'}`);
      }
    }
  };

  return (
  <div className="space-y-6">
    <SectionHeader title="Revenue" sub="Recognized vs projected, by source and client">
      <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer transition-all">
        <Upload className="w-4 h-4" /> Upload bank statement
        <input
          type="file"
          accept=".csv,text/csv"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.currentTarget.value = ''; }}
        />
      </label>
    </SectionHeader>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-5 lg:col-span-2">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">
          Realized vs projected
          {statements.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
              · from {statements.length} uploaded statement{statements.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left:-20 }}>
              <defs>
                <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartGrid(dark)} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <YAxis stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip {...chartTooltipStyle(dark)} />
              <Area type="monotone" dataKey="revenue" stroke="#22D3EE" strokeWidth={2} fill="url(#gReal)" />
              <Line type="monotone" dataKey="projected" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Revenue by source</div>
        <div className="space-y-3">
          {[
            { l:'Signed contracts', v:1920, c:'#6366F1' },
            { l:'Weighted pipeline',v:921,  c:'#22D3EE' },
            { l:'Retainers',        v:480,  c:'#10B981' },
            { l:'One-time',         v:286,  c:'#F59E0B' },
          ].map(s => (
            <div key={s.l}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">{s.l}</span>
                <span className="tabular-nums font-medium text-slate-900 dark:text-white">${s.v}K</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${(s.v/2000)*100}%`, background:s.c }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">Bank statements</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {statements.length} file{statements.length === 1 ? '' : 's'} · {totalTxns} transactions · ${totalRevenue.toLocaleString(undefined,{maximumFractionDigits:0})} revenue extracted
          </div>
        </div>
      </div>
      {error && (
        <div className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}
      {statements.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
          No statements yet. Upload a CSV with <span className="font-mono">date, description, amount</span> columns to populate the revenue chart.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {statements.map(s => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {s.transactions.length} transactions · uploaded {new Date(s.uploadedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => remove(s.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                aria-label="Delete statement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  </div>
  );
};

/* ---------- Bank statement parsing ---------- */
type BankTxn = { date: string; description: string; amount: number };
type BankStatement = {
  id: string;
  name: string;
  uploadedAt: string;
  transactions: BankTxn[];
};

const BANK_STORAGE_KEY = 'asentio-os.bankStatements.v1';

const parseCSV = (text: string): BankTxn[] => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const splitRow = (l: string) => {
    const out: string[] = []; let cur = ''; let q = false;
    for (const ch of l) {
      if (ch === '"') q = !q;
      else if (ch === ',' && !q) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map(s => s.trim().replace(/^"|"$/g, ''));
  };
  const header = splitRow(lines[0]).map(h => h.toLowerCase());
  const findIdx = (keys: string[]) => header.findIndex(h => keys.some(k => h.includes(k)));
  const dIdx = findIdx(['date','posted']);
  const aIdx = findIdx(['amount','debit','withdraw','value']);
  const descIdx = findIdx(['desc','memo','detail','payee','merchant','narrative']);
  if (dIdx < 0 || aIdx < 0) return [];
  const txns: BankTxn[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitRow(lines[i]);
    if (cols.length <= Math.max(dIdx, aIdx)) continue;
    const rawDate = cols[dIdx];
    let rawAmt = cols[aIdx].replace(/[$,\s]/g, '');
    if (/^\(.*\)$/.test(rawAmt)) rawAmt = '-' + rawAmt.slice(1, -1);
    const amt = parseFloat(rawAmt);
    if (!rawDate || Number.isNaN(amt)) continue;
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) continue;
    txns.push({
      date: d.toISOString().slice(0, 10),
      description: descIdx >= 0 ? (cols[descIdx] || '') : '',
      amount: amt,
    });
  }
  return txns;
};

const useBankStatements = () => {
  const [statements, setStatements] = useState<BankStatement[]>(() => {
    try { return JSON.parse(localStorage.getItem(BANK_STORAGE_KEY) || '[]'); }
    catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(statements));
  }, [statements]);
  const add = (s: BankStatement) => setStatements(prev => [s, ...prev]);
  const remove = (id: string) => setStatements(prev => prev.filter(s => s.id !== id));
  return { statements, add, remove };
};

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const aggregateByMonth = (statements: BankStatement[]) => {
  const buckets = new Map<string, { revenue: number; expense: number }>();
  for (const s of statements) {
    for (const t of s.transactions) {
      const key = t.date.slice(0, 7);
      const b = buckets.get(key) || { revenue: 0, expense: 0 };
      if (t.amount < 0) b.expense += -t.amount;
      else b.revenue += t.amount;
      buckets.set(key, b);
    }
  }
  return Array.from(buckets.entries())
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k, v]) => ({
      m: MONTH_LABELS[parseInt(k.slice(5,7), 10) - 1] + ' ' + k.slice(2,4),
      revenue: Math.round(v.revenue / 1000),
      expense: Math.round(v.expense / 1000),
    }));
};

/* ---------- Expenses ---------- */
const Expenses = ({ dark }:{dark:boolean}) => {
  const { statements, add, remove } = useBankStatements();
  const [error, setError] = useState<string | null>(null);

  const trendData = useMemo(() => {
    const agg = aggregateByMonth(statements);
    return agg.length > 0 ? agg : REVENUE_TREND;
  }, [statements]);

  const totalTxns = useMemo(
    () => statements.reduce((sum, s) => sum + s.transactions.length, 0),
    [statements]
  );
  const totalExpense = useMemo(() => {
    let sum = 0;
    for (const s of statements) for (const t of s.transactions) if (t.amount < 0) sum += -t.amount;
    return sum;
  }, [statements]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setError(null);
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const txns = parseCSV(text);
        if (txns.length === 0) {
          setError(`${file.name}: no transactions found. Expected CSV with date and amount columns.`);
          continue;
        }
        add({
          id: crypto.randomUUID(),
          name: file.name,
          uploadedAt: new Date().toISOString(),
          transactions: txns,
        });
      } catch (e:any) {
        setError(`${file.name}: ${e?.message || 'failed to parse'}`);
      }
    }
  };

  return (
  <div className="space-y-6">
    <SectionHeader title="Expenses" sub="Burn, categories, and margin">
      <Btn variant="outline"><Download className="w-4 h-4" /> Export</Btn>
      <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer transition-all">
        <Upload className="w-4 h-4" /> Upload bank statement
        <input
          type="file"
          accept=".csv,text/csv"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.currentTarget.value = ''; }}
        />
      </label>
    </SectionHeader>

    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">Bank statements</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {statements.length} file{statements.length === 1 ? '' : 's'} · {totalTxns} transactions · ${totalExpense.toLocaleString(undefined,{maximumFractionDigits:0})} expenses extracted
          </div>
        </div>
      </div>
      {error && (
        <div className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}
      {statements.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
          No statements yet. Upload a CSV with <span className="font-mono">date, description, amount</span> columns to populate the burn chart.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {statements.map(s => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {s.transactions.length} transactions · uploaded {new Date(s.uploadedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => remove(s.id)}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-slate-900 dark:text-white">Burn rate trend</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {statements.length > 0 ? 'From uploaded statements' : 'Sample data — upload a statement to replace'}
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ left:-20 }}>
              <CartesianGrid stroke={chartGrid(dark)} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <YAxis stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip {...chartTooltipStyle(dark)} />
              <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Profit margin</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{name:'margin', value:21.5, fill:'#10B981'}]} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center -mt-32 mb-4 pointer-events-none">
          <div className="text-3xl font-semibold text-slate-900 dark:text-white">21.5%</div>
          <div className="text-xs text-slate-500">YTD margin</div>
        </div>
      </Card>
    </div>

    <DataTable
      head={['ID','Vendor','Category','Amount','Date','Recurring','Notes']}
      rows={EXPENSES.map(e => [
        <span className="font-mono text-xs text-slate-500">{e.id}</span>,
        <span className="font-medium text-slate-900 dark:text-white">{e.vendor}</span>,
        <Pill>{e.cat}</Pill>,
        <span className="tabular-nums">${e.amount.toLocaleString()}</span>,
        e.date,
        e.recurring ? <Pill tone="violet">Recurring</Pill> : <span className="text-slate-400">—</span>,
        <span className="text-slate-500">{e.notes}</span>,
      ])}
    />
  </div>
  );
};

/* ---------- Forecasting ---------- */
const Forecasting = ({ dark }:{dark:boolean}) => {
  const [closeProb, setCloseProb]   = useState(50);
  const [hiring, setHiring]         = useState(40);
  const [marketing, setMarketing]   = useState(30);
  const [growth, setGrowth]         = useState(20);

  const adjusted = useMemo(() => FORECAST.map(q => ({
    ...q,
    expected: Math.round(q.expected * (1 + (closeProb-50)/200) * (1 + (growth-20)/200)),
  })), [closeProb, growth]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Forecasting" sub="Adjust drivers to model scenarios" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Quarterly forecast — 3 scenarios</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adjusted} margin={{ left:-20 }}>
                <CartesianGrid stroke={chartGrid(dark)} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip {...chartTooltipStyle(dark)} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="conservative" fill="#94A3B8" radius={[4,4,0,0]} />
                <Bar dataKey="expected"     fill="#6366F1" radius={[4,4,0,0]} />
                <Bar dataKey="aggressive"   fill="#10B981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 space-y-5">
          <div className="text-sm font-medium text-slate-900 dark:text-white">Drivers</div>
          {[
            { l:'Avg deal close prob', v:closeProb,  set:setCloseProb,  suffix:'%' },
            { l:'Hiring spend',        v:hiring,     set:setHiring,     suffix:'K/mo' },
            { l:'Marketing spend',     v:marketing,  set:setMarketing,  suffix:'K/mo' },
            { l:'Growth assumption',   v:growth,     set:setGrowth,     suffix:'% YoY' },
          ].map(s => (
            <div key={s.l}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-600 dark:text-slate-300">{s.l}</span>
                <span className="text-xs font-medium tabular-nums text-slate-900 dark:text-white">{s.v}{s.suffix}</span>
              </div>
              <input type="range" min={0} max={100} value={s.v} onChange={e => s.set(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-slate-100 dark:bg-white/5
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow" />
            </div>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-500">Annual forecast</span><span className="tabular-nums font-medium text-slate-900 dark:text-white">${adjusted.reduce((a,b)=>a+b.expected,0)}K</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Implied runway</span><span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-300">+18.6 mo</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ---------- Clients ---------- */
type Client = {
  id: string;
  name: string;
  revenue: number;
  margin: number;
  status: string;
  tenure: string | null;
  notes: string | null;
};

const STATUS_OPTIONS = ['Healthy', 'At Risk', 'Inactive'];
const emptyClient = { name:'', revenue:0, margin:0, status:'Healthy', tenure:'', notes:'' };

const ClientForm = ({ initial, onSave, onCancel, saving }:{
  initial: typeof emptyClient;
  onSave: (v: typeof emptyClient) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [v, setV] = useState(initial);
  const inputCls = "w-full h-9 px-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40";
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Name</label>
        <input className={inputCls} value={v.name} onChange={e=>setV({...v, name:e.target.value})} placeholder="Acme Corp" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Revenue ($)</label>
          <input type="number" className={inputCls} value={v.revenue} onChange={e=>setV({...v, revenue:Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Margin (0–1)</label>
          <input type="number" step="0.01" min="0" max="1" className={inputCls} value={v.margin} onChange={e=>setV({...v, margin:Number(e.target.value)})} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Status</label>
          <select className={inputCls} value={v.status} onChange={e=>setV({...v, status:e.target.value})}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Tenure</label>
          <input className={inputCls} value={v.tenure} onChange={e=>setV({...v, tenure:e.target.value})} placeholder="1.4y" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Notes</label>
        <textarea rows={2} className={inputCls + ' h-auto py-2'} value={v.notes} onChange={e=>setV({...v, notes:e.target.value})} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Btn>
        <Btn variant="primary" onClick={()=>onSave(v)} disabled={saving || !v.name.trim()}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save
        </Btn>
      </div>
    </div>
  );
};

const Clients = ({ dark }:{dark:boolean}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('asentio_clients').select('*').order('revenue', { ascending: false });
    if (error) setError(error.message);
    else setClients((data || []) as Client[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (v: typeof emptyClient) => {
    setSaving(true); setError(null);
    const payload = {
      name: v.name.trim(), revenue: v.revenue, margin: v.margin,
      status: v.status, tenure: v.tenure || null, notes: v.notes || null,
    };
    const { error } = editing
      ? await supabase.from('asentio_clients').update(payload).eq('id', editing.id)
      : await supabase.from('asentio_clients').insert(payload);
    setSaving(false);
    if (error) { setError(error.message); return; }
    setEditing(null); setCreating(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    const { error } = await supabase.from('asentio_clients').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    load();
  };

  const showForm = creating || !!editing;
  const formInitial = editing
    ? { name: editing.name, revenue: Number(editing.revenue), margin: Number(editing.margin),
        status: editing.status, tenure: editing.tenure || '', notes: editing.notes || '' }
    : emptyClient;

  const totalRev = clients.reduce((s,c)=>s+Number(c.revenue), 0);
  const topShare = clients[0] && totalRev ? (Number(clients[0].revenue)/totalRev)*100 : 0;
  const chartData = clients.map(c => ({ name: c.name, revenue: Number(c.revenue) }));

  return (
  <div className="space-y-6">
    <SectionHeader title="Clients" sub={`${clients.length} accounts${totalRev ? ` · top client = ${topShare.toFixed(0)}% of revenue` : ''}`}>
      <Btn variant="primary" onClick={()=>{ setEditing(null); setCreating(true); }}>
        <Plus className="w-4 h-4" /> New client
      </Btn>
    </SectionHeader>

    {error && (
      <div className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-3 py-2">{error}</div>
    )}

    {showForm && (
      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">
          {editing ? 'Edit client' : 'New client'}
        </div>
        <ClientForm
          initial={formInitial}
          saving={saving}
          onCancel={()=>{ setEditing(null); setCreating(false); setError(null); }}
          onSave={save}
        />
      </Card>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-5 lg:col-span-2">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Revenue by client</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left:-20 }}>
              <CartesianGrid stroke={chartGrid(dark)} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={10} angle={-15} textAnchor="end" height={50} />
              <YAxis stroke={chartTickColor(dark)} tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip {...chartTooltipStyle(dark)} />
              <Bar dataKey="revenue" fill="#6366F1" radius={[6,6,0,0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Health breakdown</div>
        <div className="space-y-2">
          {[
            { l:'Healthy',  c:'emerald', n: clients.filter(c=>c.status==='Healthy').length },
            { l:'At Risk',  c:'amber',   n: clients.filter(c=>c.status==='At Risk').length },
            { l:'Inactive', c:'rose',    n: clients.filter(c=>c.status==='Inactive').length },
          ].map(s => (
            <div key={s.l} className="flex items-center justify-between text-sm">
              <Pill tone={s.c}>{s.l}</Pill>
              <span className="tabular-nums font-medium text-slate-900 dark:text-white">{s.n}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {loading ? (
      <Card className="p-8 text-center text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading clients…</Card>
    ) : (
      <DataTable
        head={['Client','Revenue','Margin','Tenure','Health','']}
        rows={clients.map(c => [
          <span className="font-medium text-slate-900 dark:text-white">{c.name}</span>,
          <span className="tabular-nums">${Number(c.revenue).toLocaleString()}</span>,
          <span className="tabular-nums">{(Number(c.margin)*100).toFixed(0)}%</span>,
          c.tenure || '—',
          <Pill tone={c.status==='Healthy'?'emerald':c.status==='At Risk'?'amber':'rose'}>{c.status}</Pill>,
          <div className="flex items-center justify-end gap-1">
            <button onClick={()=>{ setCreating(false); setEditing(c); }}
              className="p-1.5 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              aria-label="Edit"><Pencil className="w-4 h-4" /></button>
            <button onClick={()=>remove(c.id)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
          </div>,
        ])}
      />
    )}
  </div>
  );
};

/* ---------- Reports ---------- */
const Reports = () => (
  <div className="space-y-6">
    <SectionHeader title="Reports" sub="Generate, download, and share">
      <Btn variant="outline"><Download className="w-4 h-4" /> CSV</Btn>
      <Btn variant="primary"><Download className="w-4 h-4" /> PDF</Btn>
    </SectionHeader>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { t:'Monthly business report', d:'Revenue, expenses, profit, new clients, closed deals.', tag:'Apr 2026', tone:'indigo' },
        { t:'Quarterly summary',       d:'Q1 performance, forecast accuracy, segment analysis.', tag:'Q1 2026',   tone:'emerald' },
        { t:'Annual report',           d:'2025 audited financials and strategic narrative.',     tag:'2025',      tone:'violet' },
      ].map(r => (
        <Card key={r.t} className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
          <Pill tone={r.tone}>{r.tag}</Pill>
          <div className="mt-3 text-base font-medium text-slate-900 dark:text-white">{r.t}</div>
          <p className="text-sm text-slate-500 mt-1">{r.d}</p>
          <div className="mt-4 flex items-center text-sm text-indigo-600 dark:text-indigo-300 group-hover:translate-x-0.5 transition-transform">
            Open report <ChevronRight className="w-4 h-4 ml-0.5" />
          </div>
        </Card>
      ))}
    </div>
    <Card className="p-5">
      <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Extras</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l:'Trade show ROI', v:'3.4x avg', icon: TrendingUp },
          { l:'Consultant utilization', v:'78%', icon: Briefcase },
          { l:'Proposal conversion', v:'47%', icon: FileSignature },
          { l:'Revenue / employee', v:'$284K', icon: DollarSign },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.l} className="rounded-xl border border-slate-200/70 dark:border-white/5 p-4">
              <Icon className="w-4 h-4 text-indigo-500" />
              <div className="mt-2 text-xs text-slate-500">{s.l}</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{s.v}</div>
            </div>
          );
        })}
      </div>
    </Card>
  </div>
);

/* ---------- Settings ---------- */
const SettingsView = () => (
  <div className="space-y-6">
    <SectionHeader title="Settings" sub="Workspace, integrations, and access" />
    <Card className="p-5">
      <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Integrations</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { l:'QuickBooks',        d:'Sync invoices, expenses, ledger', on:true  },
          { l:'HubSpot',           d:'CRM contacts and deal sync',      on:true  },
          { l:'Google Workspace',  d:'Calendar, Gmail, Drive',          on:false },
          { l:'Stripe',            d:'Card and ACH payments',           on:true  },
          { l:'Slack',             d:'Activity notifications',          on:false },
          { l:'AI analytics',      d:'Anomaly detection + insights',    on:true  },
        ].map(i => (
          <div key={i.l} className="flex items-center justify-between rounded-xl border border-slate-200/70 dark:border-white/5 p-4">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{i.l}</div>
              <div className="text-xs text-slate-500">{i.d}</div>
            </div>
            <Pill tone={i.on?'emerald':'slate'}>{i.on?'Connected':'Connect'}</Pill>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

/* =========================================================================
   AI ASSISTANT
   ========================================================================= */
const AI_SUGGESTIONS = [
  'What invoices are overdue?',
  'What is projected Q4 revenue?',
  'Which clients generate the most profit?',
  'How much runway do we have?',
  'Which expenses increased the most this quarter?',
];

const AI_RESPONSES: Record<string,string> = {
  'What invoices are overdue?': '1 invoice is overdue: **INV-0418 — Verge Studios — $18,000**, 13 days past due. Suggested action: send a polite reminder and offer ACH discount.',
  'What is projected Q4 revenue?': 'Expected scenario projects **$920K** in Q4 ($720K conservative / $1.18M aggressive). Driven by Helix Capital and Cobalt Health closing on time.',
  'Which clients generate the most profit?': 'Top 3 by margin × revenue: **Helix Capital (41%, $130K)**, Northwind XR (34%, $140K), Cobalt Health (31%, $30K).',
  'How much runway do we have?': 'At current burn ($184K/mo) and cash balance ($1.18M), runway is **14.3 months**. Adding signed retainers extends to 18.6 mo.',
  'Which expenses increased the most this quarter?': 'Largest QoQ increases: **Events (+$8.5K)**, Contractors (+$4.4K), Software (+$1.2K). Trade show driving the spike — track ROI in Reports.',
};

const AI = ({ open, onClose }:{open:boolean; onClose:()=>void}) => {
  const [q, setQ] = useState('');
  const [log, setLog] = useState<{role:'u'|'a'; text:string}[]>([
    { role:'a', text:"Hi — I'm your operating copilot. Ask about cash, clients, invoices, forecast, or expenses." },
  ]);
  const ask = (text:string) => {
    if (!text.trim()) return;
    const a = AI_RESPONSES[text] ?? `Here's what I found: based on your current data, ${text.toLowerCase().replace('?','')} is trending positively this quarter.`;
    setLog(l => [...l, { role:'u', text }, { role:'a', text: a }]);
    setQ('');
  };
  return (
    <div className={cn('fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] transition-transform duration-300',
      'bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/10 shadow-2xl',
      open ? 'translate-x-0' : 'translate-x-full')}>
      <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">Asentio Copilot</div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X className="w-4 h-4"/></button>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-180px)]">
        {log.map((m,i) => (
          <div key={i} className={cn('flex', m.role==='u'?'justify-end':'justify-start')}>
            <div className={cn('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
              m.role==='u'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200')}
              dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
            />
          </div>
        ))}
        {log.length <= 1 && (
          <div className="pt-2 space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Suggested</div>
            {AI_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => ask(s)}
                className="w-full text-left text-sm px-3 py-2 rounded-lg border border-slate-200/70 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={(e)=>{e.preventDefault(); ask(q);}} className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Ask anything about your business…"
            className="flex-1 bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400" />
          <button type="submit" className="text-indigo-500 hover:text-indigo-600"><Send className="w-4 h-4"/></button>
        </div>
      </form>
    </div>
  );
};

/* =========================================================================
   ROOT
   ========================================================================= */
const AsentioOSLayout = () => {
  const [section, setSection] = useState<Section>('overview');
  const [dark, setDark] = useDark();
  const [aiOpen, setAiOpen] = useState(false);

  const Section = useMemo(() => {
    switch (section) {
      case 'overview':    return <Overview dark={dark} />;
      case 'pipeline':    return <Pipeline />;
      case 'contracts':   return <Contracts />;
      case 'invoices':    return <Invoices dark={dark} />;
      case 'revenue':     return <Revenue dark={dark} />;
      case 'expenses':    return <Expenses dark={dark} />;
      case 'forecasting': return <Forecasting dark={dark} />;
      case 'clients':     return <Clients dark={dark} />;
      case 'reports':     return <Reports />;
      case 'settings':    return <SettingsView />;
    }
  }, [section, dark]);

  return (
    <div className={cn(dark && 'dark')}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans antialiased">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 border-r border-slate-200/70 dark:border-white/5 bg-white/60 dark:bg-white/[0.015] backdrop-blur">
            <div className="px-5 h-14 flex items-center gap-2 border-b border-slate-100 dark:border-white/5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 flex items-center justify-center">
                <span className="text-white dark:text-slate-900 text-sm font-bold">A</span>
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">Asentio OS</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Operating dashboard</div>
              </div>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {NAV.map(n => {
                const Icon = n.icon;
                const active = n.id === section;
                return (
                  <button key={n.id} onClick={() => setSection(n.id)}
                    className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                      active
                        ? 'bg-slate-900 text-white dark:bg-white/10 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5')}>
                    <Icon className="w-4 h-4" />
                    <span>{n.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => setAiOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-medium hover:opacity-95 shadow-sm">
                <Sparkles className="w-4 h-4" /> Ask Copilot
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Topbar */}
            <header className="sticky top-0 z-20 h-14 px-4 lg:px-8 flex items-center gap-3 border-b border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-[#070B14]/80 backdrop-blur">
              <div className="lg:hidden font-semibold">Asentio OS</div>
              <div className="hidden sm:flex flex-1 max-w-md">
                <div className="flex items-center gap-2 w-full px-3 h-9 rounded-lg bg-slate-100 dark:bg-white/5 text-sm text-slate-500">
                  <Search className="w-4 h-4" />
                  <input placeholder="Search clients, invoices, deals…" className="bg-transparent outline-none flex-1 text-slate-900 dark:text-slate-200 placeholder:text-slate-400" />
                  <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-white/60 dark:bg-white/10 border border-slate-200/70 dark:border-white/10">⌘K</kbd>
                </div>
              </div>
              <div className="flex-1 sm:hidden" />
              <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
              </button>
              <button onClick={() => setAiOpen(true)} className="lg:hidden w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white text-xs font-semibold flex items-center justify-center">JT</div>
            </header>

            {/* Mobile nav */}
            <div className="lg:hidden border-b border-slate-200/70 dark:border-white/5 overflow-x-auto">
              <div className="flex gap-1 px-4 py-2 min-w-max">
                {NAV.map(n => (
                  <button key={n.id} onClick={() => setSection(n.id)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap',
                      n.id === section
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5')}>
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            <main className="p-4 lg:p-8 max-w-[1400px]">{Section}</main>
          </div>
        </div>

        <AI open={aiOpen} onClose={() => setAiOpen(false)} />
      </div>
    </div>
  );
};

export default AsentioOSLayout;
