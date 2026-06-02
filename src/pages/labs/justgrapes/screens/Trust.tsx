import { Glass, Pill, SectionTitle } from "../components/Glass";
import { Camera, Mic, MapPin, Users, Calendar, Mail, Trash2, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";

const permissions = [
  { icon: Camera, label: "Camera", desc: "Vision & object recognition" },
  { icon: Mic, label: "Microphone", desc: "Conversations & commands" },
  { icon: MapPin, label: "Location", desc: "Places & navigation" },
  { icon: Users, label: "Contacts", desc: "Recognize people you know" },
  { icon: Calendar, label: "Calendar", desc: "Briefings & reminders" },
  { icon: Mail, label: "Email", desc: "Drafts & follow-ups" },
];

const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button onClick={onChange} className={`w-11 h-7 rounded-full transition-colors relative ${on ? "bg-emerald-400/80" : "bg-white/15"}`}>
    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
  </button>
);

const Trust = () => {
  const [state, setState] = useState<Record<string, boolean>>(Object.fromEntries(permissions.map((p) => [p.label, true])));

  return (
    <div className="px-5 pb-32 pt-6 space-y-6">
      <header>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-emerald-300/80 mb-2">
          <Shield className="w-3 h-3" /> Trust center
        </div>
        <h1 className="text-[40px] leading-none font-serif text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>
          You're in <em>control.</em>
        </h1>
      </header>

      {/* Why */}
      <Glass className="p-5">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Why did Vera do this?</div>
        <div className="text-white text-[16px]">Suggested dinner at Nopa.</div>
        <p className="text-white/60 text-[13px] mt-2 leading-relaxed">
          You've rated 3 similar California-modern restaurants 4★+. It's 8 min from your meeting, within your typical $$ range, and Maya mentioned she's never been.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Pill tone="cyan">location</Pill>
          <Pill tone="violet">dining history</Pill>
          <Pill tone="amber">budget</Pill>
          <Pill tone="emerald">guest preference</Pill>
        </div>
      </Glass>

      <section>
        <SectionTitle eyebrow="Permissions" title="What Vera can sense" />
        <Glass className="p-1">
          {permissions.map((p, i) => (
            <div key={p.label} className={`flex items-center gap-3 px-4 py-3 ${i < permissions.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <p.icon className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex-1">
                <div className="text-white text-[14px]">{p.label}</div>
                <div className="text-[11px] text-white/40">{p.desc}</div>
              </div>
              <Toggle on={state[p.label]} onChange={() => setState((s) => ({ ...s, [p.label]: !s[p.label] }))} />
            </div>
          ))}
        </Glass>
      </section>

      <section>
        <SectionTitle eyebrow="Memory" title="Delete what she knows" />
        <Glass className="p-2">
          {["Delete today", "Forget a person", "Forget a location", "Delete everything"].map((label, i, arr) => (
            <button key={label} className={`w-full flex items-center justify-between px-4 py-4 text-left ${i < arr.length - 1 ? "border-b border-white/[0.06]" : ""} ${label === "Delete everything" ? "text-rose-300" : "text-white/90"}`}>
              <span className="flex items-center gap-3 text-[14px]"><Trash2 className="w-4 h-4 opacity-60" />{label}</span>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>
          ))}
        </Glass>
      </section>
    </div>
  );
};

export default Trust;
