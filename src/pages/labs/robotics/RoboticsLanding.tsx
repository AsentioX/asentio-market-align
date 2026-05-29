import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Activity, Cpu, Camera, Lock,
  BarChart3, Bot, Truck, Wrench, Building2, Factory, Zap, GraduationCap,
  HeartPulse, Warehouse, Check, X, Calculator, FileText, BookOpen, TrendingUp,
  Linkedin, Youtube, ChevronRight, Eye, AlertTriangle, Users, DollarSign,
  Clock, MapPin, Radio,
} from 'lucide-react';
import heroImg from './assets/hero.jpg';
import commandImg from './assets/command.jpg';
import securityImg from './assets/security.jpg';
import cleaningImg from './assets/cleaning.jpg';
import logisticsImg from './assets/logistics.jpg';
import inspectionImg from './assets/inspection.jpg';

const accent = 'text-[#3DA9FC]';
const accentBg = 'bg-[#3DA9FC]';
const accentBorder = 'border-[#3DA9FC]';

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl bg-black/60 border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-white">Robotic<span className={accent}>$</span></span>
        </a>
        <nav className="hidden lg:flex items-center gap-8 text-sm text-white/70">
          <a href="#solutions" className="hover:text-white transition">Solutions</a>
          <a href="#industries" className="hover:text-white transition">Industries</a>
          <a href="#platform" className="hover:text-white transition">Platform</a>
          <a href="#roi" className="hover:text-white transition">ROI Calculator</a>
          <a href="#resources" className="hover:text-white transition">Resources</a>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#roi" className="hidden sm:inline-flex text-sm text-white/80 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition">Calculate ROI</a>
          <a href="#contact" className={`inline-flex items-center gap-1.5 text-sm font-medium text-black px-4 py-2 rounded-full ${accentBg} hover:opacity-90 transition`}>
            Book Assessment <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};

const Metric = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur">
    <div className={`w-9 h-9 rounded-lg ${accentBg}/10 flex items-center justify-center ${accent}`}>{icon}</div>
    <div>
      <div className="text-white font-semibold text-lg leading-none">{value}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </div>
  </div>
);

const Hero = () => {
  const [counters, setCounters] = useState({ uptime: 99.7, tasks: 12480, incidents: 27, savings: 1840000 });
  useEffect(() => {
    const id = setInterval(() => {
      setCounters((c) => ({
        uptime: Math.min(99.99, c.uptime + Math.random() * 0.01),
        tasks: c.tasks + Math.floor(Math.random() * 6),
        incidents: c.incidents + (Math.random() > 0.85 ? 1 : 0),
        savings: c.savings + Math.floor(Math.random() * 220),
      }));
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_85%)]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur text-xs text-white/70 mb-8">
            <span className={`w-1.5 h-1.5 rounded-full ${accentBg} animate-pulse`} />
            Physical AI Operating System
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-semibold tracking-tight text-white leading-[0.95]">
            Your Next Employee<br />
            <span className="text-white/40">Isn't Human.</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-white/70 max-w-2xl leading-relaxed">
            Deploy autonomous workers that patrol, inspect, clean, transport, monitor, and optimize operations 24/7.
            Reduce labor costs. Improve safety. Increase operational visibility.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#contact" className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full ${accentBg} text-black font-medium hover:opacity-90 transition`}>
              Book Assessment <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#roi" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 text-white hover:bg-white/5 transition">
              Calculate ROI
            </a>
          </div>
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
            <Metric icon={<Clock className="w-4 h-4" />} value="24/7" label="Operations" />
            <Metric icon={<TrendingUp className="w-4 h-4" />} value="Up to 70%" label="Labor savings" />
            <Metric icon={<ShieldCheck className="w-4 h-4" />} value="Improved" label="Safety & compliance" />
            <Metric icon={<Cpu className="w-4 h-4" />} value="RaaS" label="Robotics-as-a-Service" />
          </div>
        </div>

        {/* Live overlay panel */}
        <div className="hidden lg:block absolute right-6 top-32 w-80 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-white/40">Live Fleet</span>
            <span className={`text-[10px] ${accent} flex items-center gap-1`}><span className={`w-1.5 h-1.5 ${accentBg} rounded-full animate-pulse`} /> STREAMING</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Robot uptime', value: `${counters.uptime.toFixed(2)}%`, icon: <Activity className="w-3.5 h-3.5" /> },
              { label: 'Tasks completed', value: counters.tasks.toLocaleString(), icon: <Check className="w-3.5 h-3.5" /> },
              { label: 'Incidents detected', value: counters.incidents.toString(), icon: <AlertTriangle className="w-3.5 h-3.5" /> },
              { label: 'Cost savings (YTD)', value: `$${(counters.savings / 1000).toFixed(0)}k`, icon: <DollarSign className="w-3.5 h-3.5" /> },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/50">{m.icon}{m.label}</span>
                <span className={`font-mono ${accent}`}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Trust = () => (
  <section className="relative py-24 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Trusted by Forward-Thinking Operators</p>
        <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Operations teams choose Robotic<span className={accent}>$</span></h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        {['Property Mgmt', 'Warehousing', 'Manufacturing', 'Utilities', 'Education', 'Healthcare'].map((n) => (
          <div key={n} className="bg-black aspect-[3/1] flex items-center justify-center text-white/30 text-sm font-medium tracking-wide hover:text-white/60 transition">
            {n}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
        {[
          { v: '4.2M+', l: 'Labor hours automated' },
          { v: '180+', l: 'Facilities managed' },
          { v: '600+', l: 'Robots deployed' },
          { v: '12.4M+', l: 'Tasks completed' },
        ].map((m) => (
          <div key={m.l} className="text-center">
            <div className={`text-4xl sm:text-5xl font-semibold tracking-tight ${accent}`}>{m.v}</div>
            <div className="text-sm text-white/50 mt-2">{m.l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Problem = () => {
  const cards = [
    { icon: <Users className="w-6 h-6" />, title: 'Labor Shortages', desc: 'Difficulty hiring and retaining staff for critical operational roles.' },
    { icon: <DollarSign className="w-6 h-6" />, title: 'Rising Operating Costs', desc: 'Increasing wages, benefits, and operational expenses pressure margins.' },
    { icon: <AlertTriangle className="w-6 h-6" />, title: 'Safety Risks', desc: 'Dangerous, repetitive work environments expose teams to liability.' },
    { icon: <Eye className="w-6 h-6" />, title: 'Operational Blind Spots', desc: 'Limited visibility into what happens day-to-day across facilities.' },
  ];
  return (
    <section className="relative py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>The Problem</p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-tight">
            Labor is harder. <span className="text-white/40">Operations are more complex.</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.title} className="group p-7 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500">
              <div className={`w-12 h-12 rounded-xl ${accentBg}/10 flex items-center justify-center ${accent} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                {c.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{c.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Solution = () => {
  const layers = [
    { icon: <Bot className="w-5 h-5" />, name: 'Robots', desc: 'Autonomous mobile platforms' },
    { icon: <Camera className="w-5 h-5" />, name: 'Computer Vision', desc: 'Real-time scene understanding' },
    { icon: <Radio className="w-5 h-5" />, name: 'Sensors', desc: 'Environmental & access telemetry' },
    { icon: <Cpu className="w-5 h-5" />, name: 'AI Platform', desc: 'Orchestration & inference' },
    { icon: <BarChart3 className="w-5 h-5" />, name: 'Operational Insights', desc: 'Decisions & reporting' },
  ];
  return (
    <section id="solutions" className="relative py-32 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(61,169,252,0.08),transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>The Solution</p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">Meet your autonomous workforce.</h2>
          <p className="mt-6 text-white/60 text-lg">
            Robotic<span className={accent}>$</span> combines autonomous robots, computer vision, sensors, access control, and AI analytics into a single operational platform.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className={`absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#3DA9FC]/40 to-transparent`} />
          <div className="space-y-4">
            {layers.map((l, i) => (
              <div key={l.name} className="relative flex items-center gap-5 group">
                <div className={`relative z-10 w-14 h-14 rounded-full border ${accentBorder}/40 bg-black flex items-center justify-center ${accent} group-hover:scale-110 transition`}>
                  {l.icon}
                </div>
                <div className="flex-1 p-5 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur group-hover:border-white/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{l.name}</div>
                      <div className="text-xs text-white/50 mt-0.5">{l.desc}</div>
                    </div>
                    <span className="text-xs text-white/30 font-mono">0{i + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const UseCases = () => {
  const cases = [
    {
      img: securityImg, title: 'Security Operations', items: ['Patrols', 'Incident detection', 'Remote monitoring'],
      industries: 'Multifamily · Corporate · Campuses', roi: '50–70% reduction in guarding cost',
    },
    {
      img: cleaningImg, title: 'Cleaning & Maintenance', items: ['Floor cleaning', 'Facility sanitation', 'Maintenance support'],
      industries: 'Hospitality · Healthcare · Education', roi: '40–60% reduction in cleaning labor',
    },
    {
      img: logisticsImg, title: 'Logistics & Delivery', items: ['Material movement', 'Inventory transport', 'Campus delivery'],
      industries: 'Warehousing · Manufacturing · Hospitals', roi: '3–5x throughput per facility',
    },
    {
      img: inspectionImg, title: 'Inspection & Compliance', items: ['Infrastructure monitoring', 'Utility inspections', 'Safety audits'],
      industries: 'Utilities · Energy · Industrial', roi: '80% faster inspection cycles',
    },
  ];
  return (
    <section className="relative py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 max-w-3xl">
          <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>Use Cases</p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">Every shift, fully covered.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div key={c.title} className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] hover:border-white/30 transition-all duration-500">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={c.img} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>
              <div className="p-7">
                <h3 className="text-2xl text-white font-semibold tracking-tight">{c.title}</h3>
                <ul className="mt-4 space-y-1.5">
                  {c.items.map((i) => (
                    <li key={i} className="text-sm text-white/60 flex items-center gap-2"><ChevronRight className={`w-3 h-3 ${accent}`} />{i}</li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-4 text-xs">
                  <div><span className="text-white/40">Industries · </span><span className="text-white/70">{c.industries}</span></div>
                  <div><span className="text-white/40">ROI · </span><span className={accent}>{c.roi}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CommandCenter = () => (
  <section id="platform" className="relative py-32 border-t border-white/5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>Physical AI Command Center</p>
        <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">One platform. Every robot. Every facility.</h2>
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
        <img src={commandImg} alt="Physical AI command center" loading="lazy" className="w-full h-auto opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Glassmorphic widgets overlay */}
        <div className="absolute inset-0 hidden md:grid grid-cols-4 gap-4 p-8 content-end">
          {[
            { l: 'Cost savings', v: '$2.4M', sub: 'YTD' },
            { l: 'Labor reduction', v: '63%', sub: 'vs baseline' },
            { l: 'Security events', v: '147', sub: 'detected · 24h' },
            { l: 'Productivity gains', v: '+38%', sub: 'tasks/hr' },
          ].map((w) => (
            <div key={w.l} className="rounded-xl border border-white/15 bg-black/50 backdrop-blur-xl p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/50">{w.l}</div>
              <div className={`text-2xl font-semibold ${accent} mt-1`}>{w.v}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{w.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {[
          { icon: <MapPin className="w-4 h-4" />, label: 'Live facility map' },
          { icon: <Bot className="w-4 h-4" />, label: 'Robot locations' },
          { icon: <Camera className="w-4 h-4" />, label: 'Camera feeds' },
          { icon: <Lock className="w-4 h-4" />, label: 'Access control events' },
          { icon: <AlertTriangle className="w-4 h-4" />, label: 'Real-time alerts' },
          { icon: <BarChart3 className="w-4 h-4" />, label: 'Operational analytics' },
          { icon: <Wrench className="w-4 h-4" />, label: 'Maintenance status' },
          { icon: <Activity className="w-4 h-4" />, label: 'Fleet health' },
        ].map((w) => (
          <div key={w.label} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <span className={accent}>{w.icon}</span>
            <span className="text-sm text-white/70">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Industries = () => {
  const inds = [
    { icon: <Building2 className="w-5 h-5" />, name: 'Multifamily Housing', challenge: 'Tenant safety, after-hours coverage', solution: 'Security patrols, smart access, maintenance robots', outcome: '40% lower security spend' },
    { icon: <Warehouse className="w-5 h-5" />, name: 'Warehousing', challenge: 'Throughput, accuracy, labor turnover', solution: 'AMRs, vision-based inventory, autonomous transport', outcome: '3x picks per hour' },
    { icon: <Factory className="w-5 h-5" />, name: 'Manufacturing', challenge: 'Quality, safety, line uptime', solution: 'Inspection robots, vision QC, automation', outcome: '99.6% defect catch rate' },
    { icon: <Zap className="w-5 h-5" />, name: 'Utilities & Energy', challenge: 'Remote infrastructure & compliance', solution: 'Inspection drones, thermal vision, AI monitoring', outcome: '70% faster inspections' },
    { icon: <HeartPulse className="w-5 h-5" />, name: 'Healthcare', challenge: 'Delivery, sanitation, monitoring', solution: 'Material transport, UV-C, AI compliance', outcome: '6 nurse-hours saved/day' },
    { icon: <GraduationCap className="w-5 h-5" />, name: 'Education & Campuses', challenge: 'Coverage at scale, safety', solution: 'Patrol robots, delivery, smart access', outcome: '24/7 coverage at fixed cost' },
  ];
  return (
    <section id="industries" className="relative py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>Industries</p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">Built for high-impact operations.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inds.map((i) => (
            <div key={i.name} className="group p-7 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04] transition-all">
              <div className={`w-10 h-10 rounded-lg ${accentBg}/10 flex items-center justify-center ${accent} mb-5`}>{i.icon}</div>
              <h3 className="text-white text-lg font-semibold mb-4">{i.name}</h3>
              <div className="space-y-3 text-sm">
                <div><div className="text-[10px] uppercase tracking-widest text-white/30">Challenge</div><div className="text-white/70">{i.challenge}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-white/30">Physical AI</div><div className="text-white/70">{i.solution}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-white/30">Outcome</div><div className={accent}>{i.outcome}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ROI = () => {
  const [employees, setEmployees] = useState(50);
  const [wage, setWage] = useState(28);
  const [facilities, setFacilities] = useState(2);
  const [hours, setHours] = useState(24);
  const [showLead, setShowLead] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const annualLabor = employees * wage * hours * 365;
    const savingsPct = Math.min(0.7, 0.25 + facilities * 0.05 + (hours / 100));
    const savings = annualLabor * savingsPct;
    const investment = facilities * 180000;
    const roi = investment > 0 ? ((savings - investment) / investment) * 100 : 0;
    return {
      annualLabor: Math.round(annualLabor),
      savings: Math.round(savings),
      roi: Math.round(roi),
      pct: Math.round(savingsPct * 100),
    };
  }, [employees, wage, facilities, hours]);

  return (
    <section id="roi" className="relative py-32 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(61,169,252,0.1),transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>ROI Calculator</p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">See what Physical AI could save you.</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur space-y-6">
            {[
              { label: 'Number of operational employees', value: employees, min: 5, max: 1000, step: 5, set: setEmployees, suffix: '' },
              { label: 'Average hourly wage', value: wage, min: 15, max: 80, step: 1, set: setWage, suffix: '$' },
              { label: 'Number of facilities', value: facilities, min: 1, max: 50, step: 1, set: setFacilities, suffix: '' },
              { label: 'Operating hours per day', value: hours, min: 8, max: 24, step: 1, set: setHours, suffix: 'hrs' },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-white/70">{f.label}</label>
                  <span className={`text-sm font-mono ${accent}`}>{f.suffix === '$' ? '$' : ''}{f.value}{f.suffix !== '$' ? f.suffix : ''}</span>
                </div>
                <input
                  type="range" min={f.min} max={f.max} step={f.step} value={f.value}
                  onChange={(e) => f.set(Number(e.target.value))}
                  className="w-full accent-[#3DA9FC]"
                />
              </div>
            ))}
          </div>

          <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#3DA9FC]/10 to-transparent backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Projected impact</div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <div className="text-xs text-white/50">Annual labor cost</div>
                <div className="text-3xl font-semibold text-white mt-1">${result.annualLabor.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-white/50">Potential savings</div>
                <div className={`text-3xl font-semibold ${accent} mt-1`}>${result.savings.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-white/50">Estimated ROI</div>
                <div className="text-3xl font-semibold text-white mt-1">{result.roi}%</div>
              </div>
              <div>
                <div className="text-xs text-white/50">Automation rate</div>
                <div className={`text-3xl font-semibold ${accent} mt-1`}>{result.pct}%</div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Suggested solutions</div>
              <div className="flex flex-wrap gap-2">
                {['Security patrol', 'AMR transport', 'Vision QC', 'Smart access', 'Inspection drone'].map((s) => (
                  <span key={s} className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/70">{s}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setShowLead(true)} className={`mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full ${accentBg} text-black font-medium hover:opacity-90 transition`}>
              Get Full Assessment <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showLead && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowLead(false)}>
            <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#0a0a0a] p-8" onClick={(e) => e.stopPropagation()}>
              {submitted ? (
                <div className="text-center py-8">
                  <div className={`w-14 h-14 rounded-full ${accentBg}/20 flex items-center justify-center mx-auto mb-4`}>
                    <Check className={`w-7 h-7 ${accent}`} />
                  </div>
                  <h3 className="text-2xl text-white font-semibold">Report on the way.</h3>
                  <p className="text-white/60 mt-2 text-sm">A solutions engineer will follow up within one business day.</p>
                  <button onClick={() => setShowLead(false)} className="mt-6 text-sm text-white/60 hover:text-white">Close</button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl text-white font-semibold">Get your detailed report</h3>
                  <p className="text-sm text-white/50 mt-1">Tailored to your operation. No spam.</p>
                  <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                    {[
                      { name: 'name', placeholder: 'Full name', type: 'text' },
                      { name: 'email', placeholder: 'Work email', type: 'email' },
                      { name: 'company', placeholder: 'Company', type: 'text' },
                      { name: 'phone', placeholder: 'Phone (optional)', type: 'tel' },
                    ].map((f) => (
                      <input key={f.name} required={f.name !== 'phone'} type={f.type} placeholder={f.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#3DA9FC] transition" />
                    ))}
                    <button type="submit" className={`w-full px-6 py-3 rounded-xl ${accentBg} text-black font-medium hover:opacity-90 transition`}>
                      Send my report
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const Comparison = () => {
  const rows = [
    { k: 'Availability', t: 'Shift-based, gaps', p: '24/7/365 uninterrupted' },
    { k: 'Consistency', t: 'Varies by individual', p: 'Identical every cycle' },
    { k: 'Reporting', t: 'Manual logs', p: 'Automated, real-time' },
    { k: 'Scalability', t: 'Hiring bottlenecks', p: 'Deploy in days' },
    { k: 'Safety', t: 'Human exposure', p: 'Removes risk from humans' },
    { k: 'Data Visibility', t: 'Blind spots', p: 'Full operational telemetry' },
    { k: 'Compliance', t: 'Audit-dependent', p: 'Continuous compliance trail' },
    { k: 'Cost Efficiency', t: 'Wages compound', p: 'Predictable subscription' },
  ];
  return (
    <section className="relative py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>Why Physical AI Wins</p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">Traditional labor vs Physical AI.</h2>
        </div>
        <div className="rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 bg-white/5 text-xs uppercase tracking-widest text-white/50">
            <div className="p-5">Capability</div>
            <div className="p-5 border-l border-white/5">Traditional Labor</div>
            <div className={`p-5 border-l border-white/5 ${accent}`}>Physical AI</div>
          </div>
          {rows.map((r, i) => (
            <div key={r.k} className={`grid grid-cols-3 text-sm ${i % 2 ? 'bg-white/[0.01]' : ''} hover:bg-white/[0.04] transition`}>
              <div className="p-5 text-white font-medium">{r.k}</div>
              <div className="p-5 border-l border-white/5 text-white/50 flex items-center gap-2"><X className="w-4 h-4 text-white/30" />{r.t}</div>
              <div className="p-5 border-l border-white/5 text-white flex items-center gap-2"><Check className={`w-4 h-4 ${accent}`} />{r.p}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RaaS = () => {
  const tiers = [
    { name: 'Pilot Program', tagline: 'Validate ROI', highlight: false, items: ['1 robot', '30–60 day deployment', 'Full software stack', 'Onboarding', 'Weekly reporting'] },
    { name: 'Site Deployment', tagline: 'Single facility rollout', highlight: true, items: ['Multi-robot fleet', 'Full integration', 'Access & vision', '24/7 monitoring', 'Quarterly reviews'] },
    { name: 'Enterprise Scale', tagline: 'Multi-site operations', highlight: false, items: ['Unlimited robots', 'Custom analytics', 'API & SSO', 'Dedicated team', 'Executive reporting'] },
  ];
  return (
    <section className="relative py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>Robotics-as-a-Service</p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">Automation without the upfront investment.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div key={t.name} className={`relative p-8 rounded-3xl border transition-all ${t.highlight ? `${accentBorder} bg-gradient-to-b from-[#3DA9FC]/10 to-transparent` : 'border-white/10 bg-white/[0.02] hover:border-white/30'}`}>
              {t.highlight && <span className={`absolute -top-3 left-8 text-[10px] uppercase tracking-widest ${accentBg} text-black px-3 py-1 rounded-full font-semibold`}>Most Popular</span>}
              <h3 className="text-2xl text-white font-semibold">{t.name}</h3>
              <p className={`text-sm mt-1 ${t.highlight ? accent : 'text-white/50'}`}>{t.tagline}</p>
              <ul className="mt-8 space-y-3">
                {t.items.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/70"><Check className={`w-4 h-4 ${accent}`} />{i}</li>
                ))}
              </ul>
              <a href="#contact" className={`mt-8 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition ${t.highlight ? `${accentBg} text-black hover:opacity-90` : 'border border-white/20 text-white hover:bg-white/5'}`}>
                Get pricing <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-12">
          {['Hardware', 'Software', 'Deployment', 'Maintenance', 'Analytics', 'Support'].map((f) => (
            <div key={f} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center text-sm text-white/60">{f}</div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Resources = () => {
  const res = [
    { icon: <BookOpen className="w-5 h-5" />, title: 'Physical AI Guide', desc: 'A practical playbook for operations leaders.' },
    { icon: <Calculator className="w-5 h-5" />, title: 'ROI Calculator', desc: 'Model savings across any facility footprint.' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Industry Reports', desc: 'Benchmarks across multifamily, warehousing, more.' },
    { icon: <FileText className="w-5 h-5" />, title: 'Case Studies', desc: 'Real deployments. Measurable outcomes.' },
    { icon: <Sparkles className="w-5 h-5" />, title: 'Blog', desc: 'The latest in autonomous operations.' },
  ];
  return (
    <section id="resources" className="relative py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <p className={`text-xs uppercase tracking-widest ${accent} mb-3`}>Resources</p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">Learn the playbook.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {res.map((r) => (
            <a key={r.title} href="#" className="group p-7 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05] transition-all">
              <div className={`w-10 h-10 rounded-lg ${accentBg}/10 flex items-center justify-center ${accent} mb-5`}>{r.icon}</div>
              <h3 className="text-white font-semibold flex items-center gap-2">{r.title}<ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></h3>
              <p className="text-sm text-white/50 mt-2">{r.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => (
  <section id="contact" className="relative py-32 border-t border-white/5 overflow-hidden">
    <div className="absolute inset-0">
      <img src={commandImg} alt="" className="w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
    </div>
    <div className="relative max-w-5xl mx-auto px-6 text-center">
      <p className={`text-xs uppercase tracking-widest ${accent} mb-4`}>Get Started</p>
      <h2 className="text-5xl sm:text-7xl font-semibold tracking-tight text-white leading-[1.05]">
        Start building your<br />autonomous workforce.
      </h2>
      <p className="mt-8 text-lg text-white/60 max-w-2xl mx-auto">
        Schedule a free site assessment and discover where Physical AI can reduce costs, improve safety, and unlock operational efficiency.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a href="#" className={`inline-flex items-center gap-2 px-7 py-4 rounded-full ${accentBg} text-black font-medium hover:opacity-90 transition`}>
          Book Assessment <ArrowRight className="w-4 h-4" />
        </a>
        <a href="#roi" className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/20 text-white hover:bg-white/5 transition">
          Request ROI Analysis
        </a>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-white/5 bg-black">
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
        <div className="col-span-2">
          <span className="text-xl font-semibold text-white">Robotic<span className={accent}>$</span></span>
          <p className="text-sm text-white/40 mt-3 max-w-xs">The Physical AI Operating System for enterprise operations.</p>
          <div className="flex items-center gap-3 mt-5">
            <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>
        {[
          { h: 'Solutions', l: ['Security', 'Cleaning', 'Logistics', 'Inspection'] },
          { h: 'Industries', l: ['Multifamily', 'Warehousing', 'Manufacturing', 'Healthcare'] },
          { h: 'Platform', l: ['Command Center', 'Analytics', 'Integrations', 'API'] },
          { h: 'Company', l: ['About', 'Resources', 'Careers', 'Contact'] },
        ].map((c) => (
          <div key={c.h}>
            <div className="text-xs uppercase tracking-widest text-white/40 mb-4">{c.h}</div>
            <ul className="space-y-2">
              {c.l.map((i) => <li key={i}><a href="#" className="text-sm text-white/60 hover:text-white transition">{i}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-14 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/40">
        <div>© {new Date().getFullYear()} Robotic$ — The Physical AI Operating System</div>
        <Link to="/labs" className="hover:text-white/70 transition flex items-center gap-1.5"><ArrowLeft className="w-3 h-3" /> Asentio Labs</Link>
      </div>
    </div>
  </footer>
);

const RoboticsLanding = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Robotic$ — The Physical AI Operating System';
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content') || '';
    meta?.setAttribute('content', 'Deploy autonomous workers that patrol, inspect, clean, transport, monitor, and optimize operations 24/7. Physical AI for the enterprise.');
    return () => {
      document.title = prev;
      meta?.setAttribute('content', prevDesc);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-[#3DA9FC] selection:text-black">
      <Nav />
      <main>
        <Hero />
        <Trust />
        <Problem />
        <Solution />
        <UseCases />
        <CommandCenter />
        <Industries />
        <ROI />
        <Comparison />
        <RaaS />
        <Resources />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default RoboticsLanding;
