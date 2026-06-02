import { useState } from "react";
import { Glass, Pill } from "../components/Glass";
import { Wine, Users, ShoppingBag, Mic, Eye } from "lucide-react";

type Scene = "wine" | "meeting" | "shop";

const Glasses = () => {
  const [scene, setScene] = useState<Scene>("wine");

  return (
    <div className="px-5 pb-32 pt-6 space-y-5">
      <header>
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">Live view</div>
        <h1 className="text-[40px] leading-none font-serif text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>
          What I see.
        </h1>
      </header>

      <div className="flex gap-2">
        {[
          { k: "wine" as Scene, label: "Wine shelf", icon: Wine },
          { k: "meeting" as Scene, label: "Meeting", icon: Users },
          { k: "shop" as Scene, label: "Shopping", icon: ShoppingBag },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setScene(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[12px] border transition ${
              scene === t.k ? "bg-white text-black border-white" : "bg-white/[0.04] text-white/70 border-white/10"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Camera feed */}
      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10">
        {/* Faux camera background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              scene === "wine"
                ? "linear-gradient(180deg, #2a1810 0%, #4a2818 40%, #1a0a05 100%)"
                : scene === "meeting"
                ? "linear-gradient(180deg, #1a2540 0%, #2a3550 50%, #0a1020 100%)"
                : "linear-gradient(180deg, #f5f0e8 0%, #d8d0c0 60%, #908578 100%)",
          }}
        />
        {/* HUD bars */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        {/* HUD top */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Pill tone="emerald"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</Pill>
          <Pill><Eye className="w-3 h-3" /> Vera is watching</Pill>
        </div>

        {/* Scene overlays */}
        {scene === "wine" && <WineOverlay />}
        {scene === "meeting" && <MeetingOverlay />}
        {scene === "shop" && <ShopOverlay />}

        {/* Bottom voice bar */}
        <div className="absolute bottom-4 left-4 right-4">
          <Glass className="px-4 py-3 flex items-center gap-3 !bg-black/40">
            <Mic className="w-4 h-4 text-white/80" />
            <div className="text-[12px] text-white/70 italic">"Tell me about this wine"</div>
          </Glass>
        </div>
      </div>
    </div>
  );
};

const Crosshair = ({ x, y, label }: { x: string; y: string; label: string }) => (
  <div className="absolute" style={{ left: x, top: y }}>
    <div className="w-3 h-3 rounded-full bg-cyan-300 ring-4 ring-cyan-300/20 animate-pulse" />
    <div className="absolute left-5 -top-1 whitespace-nowrap text-[10px] text-cyan-100 bg-black/50 px-2 py-0.5 rounded">
      {label}
    </div>
  </div>
);

const WineOverlay = () => (
  <>
    <Crosshair x="22%" y="35%" label="2019 Pinot Noir" />
    <Crosshair x="55%" y="45%" label="2020 Cabernet" />
    <Crosshair x="78%" y="40%" label="2018 Chardonnay" />
    <div className="absolute left-4 right-4 bottom-24">
      <Glass className="p-4 !bg-black/50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-white font-medium">Domaine Serene · 2019</div>
            <div className="text-[11px] text-white/50">Evenstad Reserve · Willamette · $68</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-serif text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>94</div>
            <div className="text-[10px] text-white/40 -mt-1">Wine Spec.</div>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Pill tone="violet">cherry</Pill>
          <Pill tone="violet">earth</Pill>
          <Pill tone="amber">silky</Pill>
          <Pill tone="emerald">pairs · duck, mushroom</Pill>
        </div>
      </Glass>
    </div>
  </>
);

const MeetingOverlay = () => (
  <>
    <div className="absolute top-1/3 left-1/4 right-1/4 flex justify-around">
      <FaceTag name="Maya Chen" company="Lola Co · CPO" />
      <FaceTag name="Devon Park" company="Lola Co · Eng Lead" />
    </div>
    <div className="absolute left-4 right-4 bottom-24">
      <Glass className="p-4 !bg-black/50">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Topics from last meeting</div>
        <ul className="space-y-1.5 text-[13px] text-white/85">
          <li>· Q3 pricing experiment — Maya owns</li>
          <li>· Devon to share API benchmarks by Fri</li>
          <li>· You promised: revised deck Wed AM</li>
        </ul>
      </Glass>
    </div>
  </>
);

const FaceTag = ({ name, company }: { name: string; company: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-20 h-20 rounded-full border-2 border-cyan-300/70 mb-2" />
    <div className="text-[11px] text-white bg-black/50 px-2 py-0.5 rounded">{name}</div>
    <div className="text-[10px] text-white/60 mt-0.5">{company}</div>
  </div>
);

const ShopOverlay = () => (
  <>
    <Crosshair x="40%" y="40%" label="Sony WH-1000XM5" />
    <div className="absolute left-4 right-4 bottom-24">
      <Glass className="p-4 !bg-black/50">
        <div className="text-white font-medium">Sony WH-1000XM5</div>
        <div className="text-[11px] text-white/50 mt-0.5">Here · $399 · Amazon · $349 · Best Buy · $339</div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1">
            <div className="text-[10px] text-white/40">Reviews</div>
            <div className="text-white text-[13px]">4.7 ★ · 12,840</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-white/40">Sustainability</div>
            <div className="text-emerald-300 text-[13px]">B · recycled plastic</div>
          </div>
        </div>
      </Glass>
    </div>
  </>
);

export default Glasses;
