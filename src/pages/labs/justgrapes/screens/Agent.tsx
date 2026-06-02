import { Glass, Pill, SectionTitle } from "../components/Glass";
import { Sparkles, Check } from "lucide-react";

const personalities = [
  { name: "Concierge", desc: "Warm, anticipates needs", active: true },
  { name: "Coach", desc: "Direct, pushes you" },
  { name: "Researcher", desc: "Curious, deep dives" },
  { name: "Travel Guide", desc: "Adventurous, local" },
];

const preferences = [
  "Prefers Pinot Noir over Cabernet",
  "Vegetarian dinners twice weekly",
  "Frequent business traveler — SFO hub",
  "Reading: AI, robotics, longevity",
  "Coffee: cortado, oat milk, no sugar",
  "Avoids meetings before 9 AM",
];

const Agent = () => {
  return (
    <div className="px-5 pb-32 pt-6 space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">Your Agent</div>
        <h1 className="text-[40px] leading-none font-serif text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>
          Meet <em className="bg-gradient-to-r from-violet-300 to-cyan-200 bg-clip-text text-transparent not-italic">Vera.</em>
        </h1>
        <p className="text-white/50 mt-3 text-[14px] leading-relaxed">
          She's learned 1,284 things about you over 87 days. She's most confident about your taste in food, music, and how you like meetings to flow.
        </p>
      </header>

      {/* Orb */}
      <div className="relative h-56 flex items-center justify-center">
        <div className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-400 to-cyan-300 blur-2xl opacity-60 animate-pulse" />
        <div className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-300 to-cyan-200 blur-xl opacity-80" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white via-violet-100 to-cyan-100 shadow-[0_0_60px_rgba(167,139,250,0.6)]" />
      </div>

      <section>
        <SectionTitle eyebrow="Personality" title="How she shows up" />
        <div className="grid grid-cols-2 gap-3">
          {personalities.map((p) => (
            <Glass key={p.name} className={`p-4 ${p.active ? "ring-1 ring-violet-400/50" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">{p.name}</div>
                {p.active && <div className="w-5 h-5 rounded-full bg-violet-400/30 flex items-center justify-center"><Check className="w-3 h-3 text-violet-200" /></div>}
              </div>
              <div className="text-[12px] text-white/50 mt-1">{p.desc}</div>
            </Glass>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Learned" title="What she knows about you" />
        <Glass className="p-2">
          {preferences.map((p, i) => (
            <div key={p} className={`flex items-center gap-3 px-3 py-3 ${i < preferences.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
              <Sparkles className="w-3.5 h-3.5 text-violet-300/70 shrink-0" />
              <span className="text-white/85 text-[14px]">{p}</span>
            </div>
          ))}
        </Glass>
      </section>

      <section>
        <SectionTitle eyebrow="Graph" title="Your world" />
        <Glass className="p-6 h-72 relative overflow-hidden">
          <svg viewBox="0 0 400 280" className="absolute inset-0 w-full h-full">
            <defs>
              <radialGradient id="node" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6366f1" />
              </radialGradient>
            </defs>
            {/* edges */}
            {[
              [200,140, 80,60], [200,140, 320,60], [200,140, 60,200], [200,140, 340,200],
              [200,140, 200,40], [200,140, 200,250], [80,60, 60,200], [320,60, 340,200],
            ].map(([x1,y1,x2,y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(167,139,250,0.25)" strokeWidth="1" />
            ))}
            {/* nodes */}
            <circle cx="200" cy="140" r="22" fill="url(#node)" />
            <text x="200" y="144" textAnchor="middle" fontSize="9" fill="white">You</text>
            {[
              {x:80,y:60,l:"Maya"},{x:320,y:60,l:"Robotics"},{x:60,y:200,l:"SF"},
              {x:340,y:200,l:"Wine"},{x:200,y:40,l:"Lola Co."},{x:200,y:250,l:"Lisbon"},
            ].map((n) => (
              <g key={n.l}>
                <circle cx={n.x} cy={n.y} r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" />
                <text x={n.x} y={n.y+3} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.7)">{n.l}</text>
              </g>
            ))}
          </svg>
          <div className="absolute bottom-3 left-4 right-4 flex gap-2">
            <Pill tone="violet">42 people</Pill>
            <Pill tone="cyan">18 interests</Pill>
            <Pill tone="emerald">7 projects</Pill>
          </div>
        </Glass>
      </section>
    </div>
  );
};

export default Agent;
