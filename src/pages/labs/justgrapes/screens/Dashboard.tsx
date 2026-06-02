import { Glass, Pill, SectionTitle } from "../components/Glass";
import { Calendar, Cloud, Car, Bell, Sparkles, MapPin, ShoppingBag, Mail, ChevronRight, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const activities = [
    { icon: Bell, label: "Added reminder", detail: "Pick up dry cleaning at 5 PM", why: "Heard you mention it during your 11 AM call", conf: 96, tone: "violet" as const },
    { icon: ShoppingBag, label: "Identified a product", detail: "Sony WH-1000XM5 — $349 at Best Buy", why: "You looked at it for 12s in the store", conf: 88, tone: "cyan" as const },
    { icon: Mail, label: "Drafted an email", detail: "Follow-up to Maya about the Q3 deck", why: "You promised it at the end of your meeting", conf: 92, tone: "amber" as const },
    { icon: MapPin, label: "Saved a place", detail: "Tartine Bakery — visited 14 min", why: "First time here; you stayed past 10 min", conf: 81, tone: "emerald" as const },
  ];

  return (
    <div className="px-5 pb-32 pt-4 space-y-6">
      {/* Greeting */}
      <header className="pt-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">Tuesday · June 2</div>
        <h1 className="text-[42px] leading-[1.05] font-serif text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>
          Good morning,<br /><span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">Jon.</span>
        </h1>
      </header>

      {/* Morning briefing */}
      <Glass className="p-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <Pill tone="violet"><Sparkles className="w-3 h-3" /> Morning briefing</Pill>
          <p className="mt-4 text-white/90 text-[17px] leading-relaxed font-light">
            You have <span className="text-white">3 meetings</span> today. Traffic to your first is <span className="text-white">18 min</span>. Light rain expected after <span className="text-white">4 PM</span> — I moved your run to tomorrow morning.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Stat icon={Calendar} value="3" label="meetings" />
            <Stat icon={Cloud} value="62°" label="rain · 4pm" />
            <Stat icon={Car} value="18m" label="to first" />
          </div>
        </div>
      </Glass>

      {/* Activity feed */}
      <section>
        <SectionTitle eyebrow="Today" title="What I did for you" />
        <div className="space-y-3">
          {activities.map((a, i) => (
            <Glass key={i} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <a.icon className="w-4 h-4 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] text-white/50">{a.label}</div>
                    <Pill tone={a.tone}>{a.conf}% sure</Pill>
                  </div>
                  <div className="text-white text-[15px] mt-0.5">{a.detail}</div>
                  <div className="text-[12px] text-white/40 mt-1.5 leading-relaxed">Why · {a.why}</div>
                </div>
              </div>
            </Glass>
          ))}
        </div>
      </section>

      {/* Insights */}
      <section>
        <SectionTitle eyebrow="Patterns" title="Daily insights" />
        <div className="grid grid-cols-2 gap-3">
          <Insight value="4h" label="in meetings yesterday" tone="from-violet-500/20 to-transparent" />
          <Insight value="3" label="new places this week" tone="from-cyan-500/20 to-transparent" />
          <Insight value="↑ 22%" label="curiosity about EVs" tone="from-emerald-500/20 to-transparent" />
          <Insight value="7.4h" label="avg sleep · trending up" tone="from-amber-500/20 to-transparent" />
        </div>
      </section>
    </div>
  );
};

const Stat = ({ icon: Icon, value, label }: any) => (
  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3">
    <Icon className="w-3.5 h-3.5 text-white/40 mb-2" />
    <div className="text-white font-medium text-lg leading-none">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1.5">{label}</div>
  </div>
);

const Insight = ({ value, label, tone }: { value: string; label: string; tone: string }) => (
  <div className={`relative overflow-hidden rounded-3xl border border-white/10 p-4 bg-gradient-to-br ${tone}`}>
    <TrendingUp className="w-3.5 h-3.5 text-white/40 mb-3" />
    <div className="text-white text-2xl font-serif" style={{ fontFamily: '"Instrument Serif", serif' }}>{value}</div>
    <div className="text-[12px] text-white/60 mt-1 leading-snug">{label}</div>
  </div>
);

export default Dashboard;
