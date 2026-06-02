import { useState } from "react";
import { Glass, Pill, SectionTitle } from "../components/Glass";
import { Search, MapPin, Users, ShoppingBag, MessageSquare, FileText, Calendar, Wine, Car, Coffee } from "lucide-react";

const filters = [
  { icon: Users, label: "People" },
  { icon: MapPin, label: "Places" },
  { icon: ShoppingBag, label: "Products" },
  { icon: MessageSquare, label: "Conversations" },
  { icon: FileText, label: "Documents" },
  { icon: Calendar, label: "Events" },
];

const suggestions = [
  "Where did I park?",
  "When did I last meet Sarah?",
  "That wine I looked at last month",
  "Customer meeting last week",
];

const memories = [
  { time: "Today · 9:14 AM", place: "Blue Bottle, Hayes Valley", icon: Coffee, tags: ["place", "coffee"], summary: "Cortado and a 12-minute conversation with Maya about the Q3 roadmap. She mentioned wanting to revisit pricing.", hue: "from-amber-500/30" },
  { time: "Yesterday · 7:42 PM", place: "K&L Wines, SF", icon: Wine, tags: ["product", "wine"], summary: "Saved: 2019 Domaine Serene Evenstad Pinot Noir — $68. You compared it to two others; this one was your pick.", hue: "from-rose-500/30" },
  { time: "Mon · 4:08 PM", place: "Garage, Mission Bay", icon: Car, tags: ["place"], summary: "Parked on Level 3, Row C, near elevator. Spot #312.", hue: "from-cyan-500/30" },
  { time: "Sun · 1:20 PM", place: "Lunch with Sarah", icon: Users, tags: ["people", "conversation"], summary: "She's switching roles in August. Talked about her trip to Lisbon, wants restaurant recs for October.", hue: "from-violet-500/30" },
];

const Memory = () => {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="px-5 pb-32 pt-6 space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">Memory</div>
        <h1 className="text-[40px] leading-none font-serif text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>
          Everything,<br /><em className="text-white/60">remembered.</em>
        </h1>
      </header>

      <Glass className="p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-white/40 ml-2" />
        <input
          placeholder="Ask your memory…"
          className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-[15px] py-2"
        />
      </Glass>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button key={s} className="px-3 py-1.5 rounded-full text-[12px] text-white/70 bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition">
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none">
        {filters.map((f) => {
          const isOn = active === f.label;
          return (
            <button
              key={f.label}
              onClick={() => setActive(isOn ? null : f.label)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] whitespace-nowrap border transition ${
                isOn ? "bg-white text-black border-white" : "bg-white/[0.04] text-white/70 border-white/10"
              }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

      <section>
        <SectionTitle eyebrow="Timeline" title="This week" />
        <div className="space-y-3">
          {memories.map((m, i) => (
            <Glass key={i} className="overflow-hidden">
              <div className={`h-24 bg-gradient-to-br ${m.hue} to-transparent relative`}>
                <m.icon className="w-6 h-6 text-white/60 absolute bottom-3 right-4" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-[11px] text-white/40 mb-1.5">
                  <span>{m.time}</span>
                  <span>{m.place}</span>
                </div>
                <p className="text-white/90 text-[14px] leading-relaxed">{m.summary}</p>
                <div className="flex gap-1.5 mt-3">
                  {m.tags.map((t) => <Pill key={t}>{t}</Pill>)}
                </div>
              </div>
            </Glass>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Memory;
