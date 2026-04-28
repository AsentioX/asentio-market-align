import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Heart, Activity, Pill, Brain, Home, Phone, MapPin,
  ArrowRight, ArrowLeft, Check, Sparkles, Lock, Wrench, ChevronLeft,
  CircleDot, Bell, Watch
} from 'lucide-react';

type Screen = 'home' | 'quiz' | 'results' | 'checkout' | 'success' | 'dashboard';

type AnswerKey =
  | 'livesAlone' | 'homeType' | 'falls' | 'mobility' | 'meds'
  | 'memory' | 'leavesHome' | 'wearable' | 'cameras';

type Answers = Partial<Record<AnswerKey, string>>;

interface Question {
  key: AnswerKey;
  q: string;
  options: { label: string; value: string }[];
}

const QUESTIONS: Question[] = [
  { key: 'livesAlone', q: 'Does your parent live alone?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { key: 'homeType', q: 'What type of home do they live in?', options: [{ label: 'House', value: 'house' }, { label: 'Apartment', value: 'apartment' }] },
  { key: 'falls', q: 'Have they had any falls in the past year?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { key: 'mobility', q: 'Do they use mobility assistance?', options: [{ label: 'None', value: 'none' }, { label: 'Cane', value: 'cane' }, { label: 'Walker', value: 'walker' }] },
  { key: 'meds', q: 'Do they take medication daily?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { key: 'memory', q: 'Any memory concerns?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Unsure', value: 'unsure' }] },
  { key: 'leavesHome', q: 'Do they leave home frequently?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { key: 'wearable', q: 'Are they comfortable wearing a device (watch/pendant)?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { key: 'cameras', q: 'Are they comfortable with cameras in the home?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
];

interface KitModule {
  icon: React.ReactNode;
  name: string;
  desc: string;
}

interface Kit {
  id: 'starter' | 'safety' | 'care' | 'advanced';
  name: string;
  tagline: string;
  price: number;
  monthly: number;
  modules: KitModule[];
}

const KITS: Record<Kit['id'], Kit> = {
  starter: {
    id: 'starter', name: 'Starter Kit', tagline: 'Essential peace of mind for active, independent parents.',
    price: 199, monthly: 19,
    modules: [
      { icon: <Bell className="w-5 h-5" />, name: 'Emergency Alert Button', desc: 'One press connects them to help, anywhere in the home.' },
      { icon: <Activity className="w-5 h-5" />, name: 'Daily Check-In', desc: 'A gentle touch-base so you know they’re okay each morning.' },
    ],
  },
  safety: {
    id: 'safety', name: 'Safety Kit', tagline: 'Adds fall awareness and home presence — the most popular choice.',
    price: 399, monthly: 29,
    modules: [
      { icon: <Watch className="w-5 h-5" />, name: 'Fall Detection Wearable', desc: 'Lightweight device that automatically calls for help after a fall.' },
      { icon: <CircleDot className="w-5 h-5" />, name: 'Presence Sensors', desc: 'Quietly notice daily movement — no cameras, no microphones.' },
      { icon: <Bell className="w-5 h-5" />, name: 'Emergency Alerts', desc: '24/7 response team reaches you and your parent instantly.' },
    ],
  },
  care: {
    id: 'care', name: 'Care Kit', tagline: 'For parents needing medication and routine support.',
    price: 549, monthly: 39,
    modules: [
      { icon: <Watch className="w-5 h-5" />, name: 'Fall Detection Wearable', desc: 'Auto-alerts after a fall, plus a one-press help button.' },
      { icon: <CircleDot className="w-5 h-5" />, name: 'Presence Sensors', desc: 'Camera-free awareness of daily routines and unusual stillness.' },
      { icon: <Pill className="w-5 h-5" />, name: 'Medication Reminders', desc: 'Smart dispenser nudges them at the right time, every time.' },
      { icon: <Bell className="w-5 h-5" />, name: 'Emergency Alerts', desc: 'Around-the-clock professional response.' },
    ],
  },
  advanced: {
    id: 'advanced', name: 'Advanced Kit', tagline: 'Full coverage for parents with higher care needs.',
    price: 749, monthly: 49,
    modules: [
      { icon: <Watch className="w-5 h-5" />, name: 'Fall Detection Wearable', desc: 'Automatic fall alerts, plus GPS for trips outside the home.' },
      { icon: <CircleDot className="w-5 h-5" />, name: 'Presence Sensors', desc: 'Whole-home routine awareness without surveillance.' },
      { icon: <Pill className="w-5 h-5" />, name: 'Medication Support', desc: 'Smart dispenser with refill alerts and adherence tracking.' },
      { icon: <Brain className="w-5 h-5" />, name: 'Cognitive Support', desc: 'Door reminders and gentle wayfinding cues for memory care.' },
      { icon: <MapPin className="w-5 h-5" />, name: 'Outdoor Safety', desc: 'Stay connected when they leave home, with one-tap help.' },
      { icon: <Bell className="w-5 h-5" />, name: 'Emergency Alerts', desc: 'Priority 24/7 response from trained care agents.' },
    ],
  },
};

interface RiskScores {
  fall: number;
  visibility: number;
  medication: number;
  cognitive: number;
}

function scoreAnswers(a: Answers): RiskScores {
  let fall = 0, visibility = 0, medication = 0, cognitive = 0;
  if (a.falls === 'yes') fall += 2;
  if (a.mobility === 'cane') fall += 1;
  if (a.mobility === 'walker') fall += 2;
  if (a.livesAlone === 'yes') visibility += 2;
  if (a.leavesHome === 'no') visibility += 1;
  if (a.meds === 'yes') medication += 2;
  if (a.memory === 'yes') cognitive += 2;
  if (a.memory === 'unsure') cognitive += 1;
  return { fall, visibility, medication, cognitive };
}

function pickKit(s: RiskScores): Kit['id'] {
  const total = s.fall + s.visibility + s.medication + s.cognitive;
  if (s.cognitive >= 2 || total >= 6) return 'advanced';
  if (s.medication >= 2 && s.fall >= 1) return 'care';
  if (s.fall >= 1 || s.visibility >= 2) return 'safety';
  return 'starter';
}

function riskTags(s: RiskScores): string[] {
  const tags: string[] = [];
  tags.push(s.fall >= 2 ? 'High Fall Risk' : s.fall === 1 ? 'Moderate Fall Risk' : 'Low Fall Risk');
  tags.push(s.visibility >= 2 ? 'Low Daily Visibility' : 'Good Daily Visibility');
  if (s.medication >= 2) tags.push('Medication Support Needed');
  if (s.cognitive >= 1) tags.push('Memory Considerations');
  return tags;
}

// ---------- Shared UI ----------
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#F7F8FA] text-slate-900 antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
    {children}
  </div>
);

const TopBar = ({ onHome, right }: { onHome: () => void; right?: React.ReactNode }) => (
  <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
    <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
      <button onClick={onHome} className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 text-white" fill="white" />
        </div>
        <span className="font-semibold tracking-tight text-slate-900">Care Kits</span>
      </button>
      <div className="flex items-center gap-3">
        <Link to="/labs" className="text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Labs
        </Link>
        {right}
      </div>
    </div>
  </header>
);

// ---------- Screens ----------
const HomeScreen = ({ onStart, onDashboard }: { onStart: () => void; onDashboard: () => void }) => (
  <>
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-white" />
      <div className="absolute -top-32 -right-24 w-[480px] h-[480px] bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-24 w-[420px] h-[420px] bg-sky-200/40 rounded-full blur-3xl" />
      <div className="relative max-w-5xl mx-auto px-5 pt-20 pb-24">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-600 shadow-sm mb-7">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Privacy-first. No cameras required.
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.05] max-w-3xl">
          Is your parent safe living alone?
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Answer a few questions and get a personalized safety kit — without cameras or complexity.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <button onClick={onStart} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-full font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/10">
            Start Free Assessment <ArrowRight className="w-4 h-4" />
          </button>
          <a href="#how" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 px-6 py-3.5 rounded-full font-medium hover:bg-slate-50 transition">
            See How It Works
          </a>
        </div>
        <p className="mt-6 text-sm text-slate-500">Takes about 2 minutes • No account required to get a recommendation</p>
      </div>
    </section>

    <section id="how" className="max-w-5xl mx-auto px-5 py-20">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">How it works</h2>
        <p className="mt-3 text-slate-600">From questions to peace of mind in three steps.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { n: '1', t: 'Take a 2-minute quiz', d: 'Tell us about your parent’s home and daily routine.', icon: <Sparkles className="w-5 h-5" /> },
          { n: '2', t: 'Get a personalized care plan', d: 'We match you to the right kit based on real risks.', icon: <Heart className="w-5 h-5" /> },
          { n: '3', t: 'Receive a ready-to-use kit', d: 'Everything arrives pre-configured. Plug in and you’re set.', icon: <Wrench className="w-5 h-5" /> },
        ].map(s => (
          <div key={s.n} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">{s.icon}</div>
              <span className="text-xs font-medium text-slate-400">STEP {s.n}</span>
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-1.5">{s.t}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-white border-y border-slate-200/70">
      <div className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-8">
        {[
          { icon: <Heart className="w-5 h-5" />, t: 'Designed for families', d: 'Built for adult children caring for aging parents at a distance.' },
          { icon: <Lock className="w-5 h-5" />, t: 'Privacy-first', d: 'No cameras. No surveillance. Just gentle awareness and quick help when it matters.' },
          { icon: <Wrench className="w-5 h-5" />, t: 'No tech expertise needed', d: 'Pre-configured kits arrive ready to use. Setup takes 5 minutes.' },
        ].map(t => (
          <div key={t.t} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">{t.icon}</div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">{t.t}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{t.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="max-w-5xl mx-auto px-5 py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Know they’re okay — without hovering.</h2>
      <p className="mt-4 text-slate-600 max-w-xl mx-auto">A 2-minute assessment gives you a clear plan, not a catalog of confusing devices.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button onClick={onStart} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-full font-medium hover:bg-slate-800 transition">
          Start Free Assessment <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onDashboard} className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 px-6 py-3.5 rounded-full font-medium hover:bg-slate-50 transition">
          Open Caregiver Dashboard
        </button>
      </div>
    </section>
  </>
);

const QuizScreen = ({ onComplete, onBack }: { onComplete: (a: Answers) => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const q = QUESTIONS[step];
  const progress = ((step) / QUESTIONS.length) * 100;

  const choose = (val: string) => {
    const next = { ...answers, [q.key]: val };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 180);
    } else {
      setTimeout(() => onComplete(next), 200);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <button onClick={() => step === 0 ? onBack() : setStep(step - 1)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Question {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight mb-8">
        {q.q}
      </h2>

      <div className="space-y-3">
        {q.options.map(opt => {
          const selected = answers[q.key] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => choose(opt.value)}
              className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition flex items-center justify-between group ${
                selected ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium text-slate-900">{opt.label}</span>
              <ArrowRight className={`w-4 h-4 ${selected ? 'text-sky-600' : 'text-slate-300 group-hover:text-slate-500'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ResultsScreen = ({ answers, onCheckout, onRestart }: { answers: Answers; onCheckout: (kit: Kit) => void; onRestart: () => void }) => {
  const scores = useMemo(() => scoreAnswers(answers), [answers]);
  const kitId = useMemo(() => pickKit(scores), [scores]);
  const kit = KITS[kitId];
  const tags = useMemo(() => riskTags(scores), [scores]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs text-emerald-700 mb-5">
        <Check className="w-3.5 h-3.5" /> Your personalized recommendation
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
        We recommend the <span className="text-sky-600">{kit.name}</span> for your parent.
      </h1>
      <p className="mt-4 text-slate-600 text-lg">{kit.tagline}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map(t => (
          <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700">{t}</span>
        ))}
      </div>

      <div className="mt-10 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-slate-900 text-xl">{kit.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">Everything arrives pre-configured.</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-slate-900">${kit.price}</div>
              <div className="text-sm text-slate-500">+ ${kit.monthly}/month</div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {kit.modules.map(m => (
            <div key={m.name} className="flex gap-4 p-4 rounded-2xl bg-slate-50/60">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-sky-600 flex items-center justify-center shrink-0">{m.icon}</div>
              <div>
                <h4 className="font-medium text-slate-900">{m.name}</h4>
                <p className="text-sm text-slate-600 mt-0.5">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 30-day return policy. Cancel anytime.
          </div>
          <button onClick={() => onCheckout(kit)} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition">
            Order Your Kit <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button onClick={onRestart} className="mt-6 text-sm text-slate-500 hover:text-slate-800">Retake the assessment</button>
    </div>
  );
};

const CheckoutScreen = ({ kit, onComplete, onBack }: { kit: Kit; onComplete: () => void; onBack: () => void }) => {
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '', card: '' });
  const valid = form.name && form.email && form.address && form.city && form.zip;

  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to recommendation
      </button>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Checkout</h1>
      <div className="mt-8 grid md:grid-cols-[1fr,360px] gap-8">
        <form onSubmit={(e) => { e.preventDefault(); if (valid) onComplete(); }} className="space-y-6">
          <Section title="Contact">
            <Field label="Full name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Jane Doe" />
            <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="jane@example.com" type="email" />
          </Section>
          <Section title="Shipping address (where the kit is delivered)">
            <Field label="Street address" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="123 Maple St" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={form.city} onChange={v => setForm({ ...form, city: v })} placeholder="San Francisco" />
              <Field label="ZIP" value={form.zip} onChange={v => setForm({ ...form, zip: v })} placeholder="94110" />
            </div>
          </Section>
          <Section title="Payment">
            <Field label="Card number" value={form.card} onChange={v => setForm({ ...form, card: v })} placeholder="4242 4242 4242 4242" />
            <p className="text-xs text-slate-500 inline-flex items-center gap-1.5"><Lock className="w-3 h-3" /> Demo checkout — no payment is processed.</p>
          </Section>
          <button type="submit" disabled={!valid} className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-full font-medium hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Place order — ${kit.price} today
          </button>
        </form>

        <aside className="bg-white border border-slate-200 rounded-2xl p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-slate-900">{kit.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{kit.modules.length} components included</p>
          <div className="my-5 border-t border-slate-100" />
          <Row label="Kit (one-time)" value={`$${kit.price}`} />
          <Row label="Monitoring (monthly)" value={`$${kit.monthly}/mo`} />
          <Row label="Shipping" value="Free" />
          <div className="my-4 border-t border-slate-100" />
          <Row label="Due today" value={`$${kit.price}`} bold />
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">${kit.monthly}/month begins after your kit is activated. Cancel anytime.</p>
        </aside>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5">
    <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide text-slate-500">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <label className="block">
    <span className="text-sm text-slate-700 mb-1.5 block">{label}</span>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition bg-white text-slate-900" />
  </label>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex items-center justify-between py-1.5 ${bold ? 'text-slate-900 font-semibold text-base' : 'text-sm text-slate-600'}`}>
    <span>{label}</span><span>{value}</span>
  </div>
);

const SuccessScreen = ({ onDashboard }: { onDashboard: () => void }) => (
  <div className="max-w-xl mx-auto px-5 py-24 text-center">
    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
      <Check className="w-8 h-8" />
    </div>
    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Your kit is on the way.</h1>
    <p className="mt-4 text-slate-600">We’ll email tracking details and a simple setup guide. Most kits are up and running in under 5 minutes.</p>
    <button onClick={onDashboard} className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition">
      Open Caregiver Dashboard <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const DashboardScreen = () => (
  <div className="max-w-4xl mx-auto px-5 py-12">
    <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
      <div>
        <p className="text-sm text-slate-500">Caregiver dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Mom — 123 Maple St</h1>
      </div>
      <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500" /> All good today
      </span>
    </div>

    <div className="grid md:grid-cols-3 gap-4 mb-8">
      <StatusCard icon={<Activity className="w-5 h-5" />} label="Activity" value="Active" sub="Last motion 12 min ago" tone="emerald" />
      <StatusCard icon={<Pill className="w-5 h-5" />} label="Medication" value="Taken" sub="8:02 AM" tone="sky" />
      <StatusCard icon={<Home className="w-5 h-5" />} label="At home" value="Yes" sub="Since 6:45 PM yesterday" tone="slate" />
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Alerts</h2>
        <span className="text-xs text-slate-500">Last 7 days</span>
      </div>
      <div className="text-center py-12 text-slate-400">
        <Bell className="w-8 h-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No alerts. Everything looks calm.</p>
      </div>
    </div>

    <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
      <h2 className="font-semibold text-slate-900 mb-4">Today’s rhythm</h2>
      <ul className="space-y-3 text-sm text-slate-700">
        {[
          { t: '7:48 AM', d: 'Morning movement detected — kitchen' },
          { t: '8:02 AM', d: 'Morning medication taken' },
          { t: '10:30 AM', d: 'Living room activity' },
          { t: '12:15 PM', d: 'Lunch routine — kitchen' },
        ].map(e => (
          <li key={e.t} className="flex gap-4">
            <span className="text-slate-400 w-20 shrink-0">{e.t}</span>
            <span>{e.d}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
      <Phone className="w-3.5 h-3.5" /> 24/7 emergency response: 1-800-CAREKIT
    </div>
  </div>
);

const StatusCard = ({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: 'emerald' | 'sky' | 'slate' }) => {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600',
    sky: 'bg-sky-50 text-sky-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</div>
        <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{sub}</div>
    </div>
  );
};

// ---------- Root ----------
const CareKitsLayout = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [answers, setAnswers] = useState<Answers>({});
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);

  const goHome = () => setScreen('home');

  return (
    <Shell>
      <TopBar onHome={goHome} right={
        screen !== 'dashboard' && (
          <button onClick={() => setScreen('dashboard')} className="text-xs text-slate-600 hover:text-slate-900 hidden sm:inline">Dashboard</button>
        )
      } />
      {screen === 'home' && <HomeScreen onStart={() => setScreen('quiz')} onDashboard={() => setScreen('dashboard')} />}
      {screen === 'quiz' && <QuizScreen onBack={goHome} onComplete={(a) => { setAnswers(a); setScreen('results'); }} />}
      {screen === 'results' && <ResultsScreen answers={answers} onCheckout={(k) => { setSelectedKit(k); setScreen('checkout'); }} onRestart={() => setScreen('quiz')} />}
      {screen === 'checkout' && selectedKit && <CheckoutScreen kit={selectedKit} onBack={() => setScreen('results')} onComplete={() => setScreen('success')} />}
      {screen === 'success' && <SuccessScreen onDashboard={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && <DashboardScreen />}
    </Shell>
  );
};

export default CareKitsLayout;
