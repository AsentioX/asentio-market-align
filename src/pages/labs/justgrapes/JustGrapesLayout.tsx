import { useState } from "react";
import { Home, Clock, Sparkles, Eye, Shield, Store, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Dashboard from "./screens/Dashboard";
import Memory from "./screens/Memory";
import Agent from "./screens/Agent";
import Glasses from "./screens/Glasses";
import Trust from "./screens/Trust";
import Marketplace from "./screens/Marketplace";

type Tab = "home" | "memory" | "agent" | "glasses" | "trust" | "market";

const tabs: { k: Tab; icon: any; label: string }[] = [
  { k: "home", icon: Home, label: "Home" },
  { k: "memory", icon: Clock, label: "Memory" },
  { k: "agent", icon: Sparkles, label: "Agent" },
  { k: "glasses", icon: Eye, label: "Glasses" },
  { k: "trust", icon: Shield, label: "Trust" },
  { k: "market", icon: Store, label: "Agents" },
];

const JustGrapesLayout = () => {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div
      className="min-h-screen w-full text-white"
      style={{
        fontFamily: '"Inter", system-ui, sans-serif',
        background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0a0a14 50%, #000000 100%)",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />

      {/* Back to Labs */}
      <Link
        to="/labs"
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/90 transition bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5"
      >
        <ArrowLeft className="w-3 h-3" /> Labs
      </Link>

      {/* Phone frame — desktop only */}
      <div className="hidden md:flex min-h-screen items-center justify-center py-10">
        <div className="relative w-[420px] h-[860px] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl bg-black">
          <Inner tab={tab} setTab={setTab} />
        </div>
      </div>

      {/* Mobile — full screen */}
      <div className="md:hidden min-h-screen">
        <Inner tab={tab} setTab={setTab} />
      </div>
    </div>
  );
};

const Inner = ({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) => {
  return (
    <div
      className="relative h-full overflow-y-auto"
      style={{ background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0a0a14 50%, #000000 100%)" }}
    >
      {tab === "home" && <Dashboard />}
      {tab === "memory" && <Memory />}
      {tab === "agent" && <Agent />}
      {tab === "glasses" && <Glasses />}
      {tab === "trust" && <Trust />}
      {tab === "market" && <Marketplace />}

      {/* Bottom nav */}
      <nav className="fixed md:absolute bottom-0 left-0 right-0 z-40">
        <div className="mx-3 mb-3 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl px-2 py-2 flex justify-between">
          {tabs.map((t) => {
            const active = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl transition ${
                  active ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                <t.icon className="w-[18px] h-[18px]" />
                <span className="text-[9px] tracking-wide">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default JustGrapesLayout;
