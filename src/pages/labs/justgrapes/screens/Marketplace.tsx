import { Glass, Pill, SectionTitle } from "../components/Glass";
import { Plane, Wine, Dumbbell, Briefcase, Sparkles, Star } from "lucide-react";

const agents = [
  { icon: Plane, name: "Wanderlust", role: "Travel agent", desc: "Books flights, hotels, and remembers your seat preferences.", rating: 4.9, installs: "120k", tone: "from-cyan-500/30" },
  { icon: Wine, name: "Cellar", role: "Sommelier", desc: "Recognizes bottles in the wild, suggests pairings, tracks your cellar.", rating: 4.8, installs: "48k", tone: "from-rose-500/30" },
  { icon: Dumbbell, name: "Atlas", role: "Fitness coach", desc: "Real-time form feedback through the glasses. Adapts your weekly plan.", rating: 4.7, installs: "210k", tone: "from-emerald-500/30" },
  { icon: Briefcase, name: "Chief", role: "Business agent", desc: "Pre-meeting briefs, action capture, polished follow-ups while you walk.", rating: 4.9, installs: "84k", tone: "from-violet-500/30" },
];

const Marketplace = () => {
  return (
    <div className="px-5 pb-32 pt-6 space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">Marketplace</div>
        <h1 className="text-[40px] leading-none font-serif text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>
          A team of <em>specialists.</em>
        </h1>
        <p className="text-white/50 mt-3 text-[14px]">Vera coordinates. Add experts she can call on.</p>
      </header>

      <SectionTitle eyebrow="Featured" title="Built by humans, refined by use" />

      <div className="space-y-4">
        {agents.map((a) => (
          <Glass key={a.name} className="overflow-hidden">
            <div className={`h-20 bg-gradient-to-br ${a.tone} to-transparent relative`}>
              <div className="absolute bottom-3 left-4 w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                <a.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white text-[17px] font-medium">{a.name}</div>
                  <div className="text-[12px] text-white/50">{a.role}</div>
                </div>
                <button className="px-4 py-1.5 rounded-full bg-white text-black text-[12px] font-medium hover:bg-white/90 transition">
                  Add
                </button>
              </div>
              <p className="text-white/75 text-[13px] mt-3 leading-relaxed">{a.desc}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-white/50">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-300 text-amber-300" />{a.rating}</span>
                <span>·</span>
                <span>{a.installs} installs</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Works with Vera</span>
              </div>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
