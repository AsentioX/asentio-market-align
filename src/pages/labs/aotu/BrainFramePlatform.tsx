import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Layers,
  Cpu,
  Camera,
  Boxes,
  Activity,
  ShieldAlert,
  HardHat,
  Car,
  UserX,
  Flame,
  Eye,
  Server,
  Network,
  Gauge,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const ACCENT = "#FF6B00";

// ---------- Hero ----------
const Hero = () => (
  <section className="relative overflow-hidden border-b border-[#E5E7EB]">
    <div
      className="absolute inset-0 opacity-[0.35] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(to right, #0A0F1C12 1px, transparent 1px), linear-gradient(to bottom, #0A0F1C12 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)",
      }}
    />
    <div
      className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-25 pointer-events-none blur-3xl"
      style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 60%)` }}
    />
    <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-36">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A0F1C]/70"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          BrainFrame · Platform
        </span>
      </div>

      <h1
        className="text-[44px] sm:text-[62px] md:text-[80px] leading-[0.98] font-semibold tracking-tight text-[#0A0F1C] max-w-5xl"
        style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
      >
        BrainFrame: the platform for{" "}
        <span className="relative inline-block">
          <span className="relative z-10">AI operators</span>
          <span
            className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-5 -z-0"
            style={{ background: `${ACCENT}B3` }}
          />
        </span>
        .
      </h1>

      <p className="mt-8 max-w-2xl text-[18px] md:text-[20px] leading-[1.5] text-[#0A0F1C]/65">
        Run real-time AI operators across your cameras and sites with edge-native performance and scale.
      </p>
      <p className="mt-3 max-w-2xl text-[15px] text-[#0A0F1C]/55">
        Deploy, manage, and scale VisionCapsules without complex infrastructure.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/labs/aotu/contact"
          className="group inline-flex items-center gap-2 bg-[#0A0F1C] text-white px-6 py-3.5 rounded-md text-[14px] font-semibold transition-colors"
          style={{ ["--hover-bg" as never]: ACCENT }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = ACCENT;
            e.currentTarget.style.color = "#0A0F1C";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0A0F1C";
            e.currentTarget.style.color = "#fff";
          }}
        >
          Request demo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          to="/labs/aotu/marketplace"
          className="inline-flex items-center gap-2 bg-white text-[#0A0F1C] border border-[#0A0F1C]/15 px-6 py-3.5 rounded-md text-[14px] font-semibold hover:border-[#0A0F1C]/40 transition-colors"
        >
          Explore VisionCapsules
        </Link>
      </div>
    </div>
  </section>
);

// ---------- What BrainFrame Does ----------
const capabilities = [
  {
    icon: Zap,
    title: "Real-Time Detection",
    desc: "Process live video streams and detect events instantly.",
  },
  {
    icon: Layers,
    title: "Multi-Stream Orchestration",
    desc: "Handle multiple cameras and sites from a single system.",
  },
  {
    icon: Cpu,
    title: "Edge-Native Performance",
    desc: "Run AI locally for low latency and reliability.",
  },
];

const WhatItDoes = () => (
  <section className="bg-white border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-2xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
        >
          // Capabilities
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Run AI operators in real time.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {capabilities.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="group p-7 rounded-2xl border border-[#E5E7EB] bg-[#F4F5F7] hover:bg-white hover:border-[#0A0F1C]/20 transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${ACCENT}1F`, color: ACCENT }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3
                className="text-[20px] font-semibold leading-tight mb-2"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {c.title}
              </h3>
              <p className="text-[14.5px] text-[#0A0F1C]/65 leading-relaxed">{c.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------- How It Works ----------
const steps = [
  {
    icon: Camera,
    title: "Connect cameras and video streams",
    label: "Step 01",
  },
  {
    icon: Boxes,
    title: "Deploy VisionCapsules (AI operators)",
    label: "Step 02",
  },
  {
    icon: Activity,
    title: "Detect, analyze, and trigger actions in real time",
    label: "Step 03",
  },
];

const HowItWorks = () => (
  <section className="bg-[#F4F5F7] border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-2xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
        >
          // Flow
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          How BrainFrame powers AI operators.
        </h2>
      </div>

      <div className="relative grid md:grid-cols-3 gap-5">
        {/* Connector line on desktop */}
        <div
          className="hidden md:block absolute top-[88px] left-[12%] right-[12%] h-px"
          style={{
            backgroundImage: `repeating-linear-gradient(to right, ${ACCENT} 0 8px, transparent 8px 16px)`,
          }}
        />
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="relative bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0A0F1C] text-white"
                >
                  <Icon className="w-6 h-6" style={{ color: ACCENT }} />
                </div>
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] text-[#0A0F1C]/40"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {s.label}
                </div>
              </div>
              <div
                className="text-[18px] font-semibold leading-snug"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {s.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------- Architecture ----------
const arch = [
  {
    icon: Server,
    title: "Edge Processing",
    desc: "Runs on-site for low latency and reliability.",
  },
  {
    icon: Network,
    title: "Scalable Infrastructure",
    desc: "Supports multiple cameras and deployments.",
  },
  {
    icon: Cpu,
    title: "Hardware Compatibility",
    desc: "Optimized for Intel and Dell systems.",
  },
];

const Architecture = () => (
  <section className="bg-white border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-2xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
        >
          // Architecture
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Built for real-world scale.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-[#E5E7EB] border border-[#E5E7EB] rounded-2xl overflow-hidden">
        {arch.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.title} className="bg-white p-8">
              <Icon className="w-6 h-6 mb-5" style={{ color: ACCENT }} />
              <h3
                className="text-[18px] font-semibold mb-2"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {a.title}
              </h3>
              <p className="text-[14px] text-[#0A0F1C]/65 leading-relaxed">{a.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------- Why BrainFrame ----------
const comparisons = [
  {
    label: "Traditional Monitoring",
    bad: ["Human-dependent", "Error-prone", "Not scalable"],
    good: ["Automated AI operators", "Consistent performance", "Scales across sites"],
  },
  {
    label: "Cloud-Only AI",
    bad: ["High latency", "Bandwidth heavy", "Single point of failure"],
    good: ["Edge-native processing", "Fast and efficient", "Resilient by design"],
  },
];

const WhyBrainFrame = () => (
  <section className="bg-[#F4F5F7] border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-2xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
        >
          // Differentiation
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Why BrainFrame.
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {comparisons.map((c) => (
          <div
            key={c.label}
            className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden"
          >
            <div className="grid grid-cols-2 divide-x divide-[#E5E7EB]">
              {/* Bad side */}
              <div className="p-6 bg-[#0A0F1C]/[0.02]">
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] text-[#0A0F1C]/45 mb-4"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {c.label}
                </div>
                <ul className="space-y-2.5">
                  {c.bad.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[14px] text-[#0A0F1C]/70">
                      <XCircle className="w-4 h-4 text-[#0A0F1C]/35 mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Good side */}
              <div className="p-6">
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] mb-4"
                  style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
                >
                  BrainFrame
                </div>
                <ul className="space-y-2.5">
                  {c.good.map((g) => (
                    <li key={g} className="flex items-start gap-2 text-[14px] text-[#0A0F1C] font-medium">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ---------- VisionCapsules Integration ----------
const capsules = [
  { icon: ShieldAlert, name: "Intrusion Detection", desc: "Detect unauthorized entry instantly." },
  { icon: HardHat, name: "PPE Detection", desc: "Enforce safety compliance automatically." },
  { icon: UserX, name: "Loitering Detection", desc: "Flag suspicious dwell behavior." },
  { icon: Car, name: "Vehicle Detection", desc: "Track vehicle movement and parking." },
  { icon: Flame, name: "Smoke & Fire", desc: "Early warning across critical zones." },
  { icon: Eye, name: "Anomaly Detection", desc: "Spot deviations from normal operations." },
];

const CapsuleIntegration = () => (
  <section className="bg-white border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-3xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
        >
          // VisionCapsules
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Built for VisionCapsules.
        </h2>
        <p className="mt-5 text-[18px] text-[#0A0F1C]/65 leading-relaxed">
          <span className="font-semibold text-[#0A0F1C]">BrainFrame is the engine.</span>{" "}
          VisionCapsules are the operators.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {capsules.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.name}
              to="/labs/aotu/marketplace"
              className="group bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#0A0F1C]/30 hover:bg-white transition-all flex items-start gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${ACCENT}1F`, color: ACCENT }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div
                  className="text-[16px] font-semibold leading-tight"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {c.name}
                </div>
                <div className="text-[13px] text-[#0A0F1C]/60 mt-1">{c.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        to="/labs/aotu/marketplace"
        className="inline-flex items-center gap-2 bg-[#0A0F1C] text-white px-6 py-3.5 rounded-md text-[14px] font-semibold hover:opacity-90 transition-opacity group"
      >
        Explore VisionCapsules Marketplace
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  </section>
);

// ---------- Performance & Proof ----------
const stats = [
  { value: "10K+", label: "Streams processed" },
  { value: "<200ms", label: "Inference latency" },
  { value: "120+", label: "Active deployments" },
];

const PerformanceProof = () => (
  <section className="bg-[#0A0F1C] text-white border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-2xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
        >
          // Proof
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Proven performance at scale.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-14">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-white/10 rounded-2xl p-8 bg-gradient-to-br from-white/[0.04] to-transparent"
          >
            <Gauge className="w-5 h-5 mb-5" style={{ color: ACCENT }} />
            <div
              className="text-[48px] md:text-[56px] font-semibold leading-none tracking-tight"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.025em" }}
            >
              {s.value}
            </div>
            <div
              className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/55"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div
          className="text-[11px] uppercase tracking-[0.18em] text-white/50"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          Built on enterprise-grade edge AI infrastructure
        </div>
        <div className="flex items-center gap-10">
          <span
            className="text-[22px] font-semibold text-white/80"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Intel
          </span>
          <span
            className="text-[22px] font-semibold text-white/80"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Dell
          </span>
        </div>
      </div>
    </div>
  </section>
);

// ---------- Final CTA ----------
const FinalCTA = () => (
  <section className="bg-[#0A0F1C] text-white relative overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage: `radial-gradient(circle at 30% 50%, ${ACCENT} 0%, transparent 50%), radial-gradient(circle at 80% 30%, #1E40FF 0%, transparent 50%)`,
      }}
    />
    <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
      <h2
        className="text-[44px] md:text-[72px] font-semibold leading-[1] tracking-tight max-w-4xl mx-auto"
        style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.025em" }}
      >
        Run AI operators
        <br />
        <span style={{ color: ACCENT }}>at scale.</span>
      </h2>
      <p className="mt-7 text-[16px] md:text-[18px] text-white/65 max-w-xl mx-auto leading-relaxed">
        Deploy BrainFrame and start automating monitoring across your sites.
      </p>
      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        <Link
          to="/labs/aotu/contact"
          className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-[14px] font-semibold transition-colors"
          style={{ background: ACCENT, color: "#0A0F1C" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
        >
          Request demo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          to="/labs/aotu/contact"
          className="inline-flex items-center gap-2 bg-white/5 border border-white/15 text-white px-7 py-3.5 rounded-md text-[14px] font-semibold hover:bg-white/10 transition-colors"
        >
          Talk to sales
        </Link>
      </div>
    </div>
  </section>
);

// ---------- Page ----------
const BrainFramePlatform = () => {
  return (
    <>
      <Hero />
      <WhatItDoes />
      <HowItWorks />
      <Architecture />
      <WhyBrainFrame />
      <CapsuleIntegration />
      <PerformanceProof />
      <FinalCTA />
    </>
  );
};

export default BrainFramePlatform;
