import { useState } from "react";
import {
  ArrowRight,
  Check,
  Play,
  Sparkles,
  Cpu,
  Camera,
  Layers,
  Zap,
  Network,
  ShieldCheck,
  Server,
  Building2,
  Factory,
  Globe2,
  ChevronRight,
} from "lucide-react";

// ---------- Industrial Dark Mode palette (from reference) ----------
const BG = "#1A1538";          // deep indigo/navy
const BG_ALT = "#221C45";      // surface
const SURFACE = "#2A2454";     // raised surface
const SURFACE_HI = "#332C66";  // hover
const RULE = "#FFFFFF14";      // hairline
const TEAL = "#3FE0C5";        // primary accent
const TEAL_SOFT = "#3FE0C566";
const MAGENTA = "#E94BD6";     // secondary accent
const TEXT = "#F4FDFF";
const MUTE = "#F4FDFFA0";
const FAINT = "#F4FDFF55";

const fontDisplay = '"Space Grotesk", "Inter", system-ui, sans-serif';
const fontMono = '"JetBrains Mono", ui-monospace, monospace';

// ---------- Hero ----------
const Hero = () => (
  <section
    className="relative overflow-hidden border-b"
    style={{ background: BG, borderColor: RULE }}
  >
    {/* grid */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.35]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #FFFFFF0F 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF0F 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 60% 40%, black, transparent)",
      }}
    />
    {/* glows */}
    <div
      className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full blur-3xl opacity-40 pointer-events-none"
      style={{ background: `radial-gradient(circle, ${TEAL} 0%, transparent 60%)` }}
    />
    <div
      className="absolute top-20 -right-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-30 pointer-events-none"
      style={{ background: `radial-gradient(circle, ${MAGENTA} 0%, transparent 60%)` }}
    />

    <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
      <div className="lg:col-span-6">
        <div className="flex items-center gap-2 mb-7">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: TEAL }}
          />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: fontMono, color: MUTE }}
          >
            Plug-and-Play Edge AI · Powered by BrainFrame
          </span>
        </div>

        <h1
          className="text-[44px] sm:text-[58px] lg:text-[72px] font-semibold leading-[0.98] tracking-tight"
          style={{ fontFamily: fontDisplay, color: TEXT, letterSpacing: "-0.025em" }}
        >
          Turnkey Smart Vision.{" "}
          <span style={{ color: TEAL }}>From Video Feed</span> to Live AI Analytics in{" "}
          <span className="relative inline-block">
            <span className="relative z-10">5 Minutes</span>
            <span
              className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-5 -z-0"
              style={{ background: `${MAGENTA}66` }}
            />
          </span>
          .
        </h1>

        <p
          className="mt-7 max-w-xl text-[17px] md:text-[19px] leading-[1.55]"
          style={{ color: MUTE }}
        >
          Deploy pre-configured edge boxes pre-loaded with aotu.ai's BrainFrame OS.
          Create, train, and deploy custom computer vision capsules on the fly with zero code.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#packages"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-[14px] font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: TEAL, color: BG }}
          >
            Book a Virtual Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#packages"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-[14px] font-semibold border transition-colors"
            style={{ borderColor: "#FFFFFF26", color: TEXT }}
          >
            View System Packages
          </a>
        </div>

        <div className="mt-12 flex items-center gap-6 text-[12px]" style={{ color: FAINT, fontFamily: fontMono }}>
          <span>NO-CODE</span>
          <span style={{ color: RULE }}>·</span>
          <span>EDGE-NATIVE</span>
          <span style={{ color: RULE }}>·</span>
          <span>OPENVINO + TENSORRT</span>
        </div>
      </div>

      {/* Visual mockup */}
      <div className="lg:col-span-6">
        <HeroMockup />
      </div>
    </div>
  </section>
);

const HeroMockup = () => (
  <div className="relative">
    {/* outer frame */}
    <div
      className="relative rounded-2xl border overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
      style={{ background: BG_ALT, borderColor: RULE }}
    >
      {/* window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: RULE, background: "#00000033" }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
        <span className="ml-3 text-[11px]" style={{ fontFamily: fontMono, color: FAINT }}>
          brainframe://cam-04 · live
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px]" style={{ fontFamily: fontMono, color: TEAL }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: TEAL }} />
          REC · 30 FPS
        </span>
      </div>

      {/* video area */}
      <div
        className="relative aspect-[16/10]"
        style={{
          background:
            `linear-gradient(135deg, ${SURFACE} 0%, ${BG_ALT} 60%, ${BG} 100%)`,
        }}
      >
        {/* scanline grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, #FFFFFF0A 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF0A 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* bounding boxes */}
        <BBox top="22%" left="14%" w="26%" h="42%" label="PERSON · 0.97" color={TEAL} />
        <BBox top="40%" left="48%" w="22%" h="36%" label="FORKLIFT · 0.92" color={MAGENTA} />
        <BBox top="58%" left="74%" w="18%" h="28%" label="HELMET · 0.88" color={TEAL} />

        {/* floating capsule generator */}
        <div
          className="absolute bottom-5 left-5 right-5 md:left-auto md:right-5 md:w-[280px] rounded-xl border backdrop-blur-md p-4"
          style={{ background: "#0A081Acc", borderColor: RULE }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5" style={{ color: TEAL }} />
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: fontMono, color: TEAL }}
            >
              Capsule Generator
            </span>
          </div>
          <div className="text-[13px] font-semibold mb-3" style={{ color: TEXT }}>
            Train "blue_shirt_worker"
          </div>
          <div className="space-y-1.5">
            {[
              ["Frames", "5 / 5", true],
              ["Synthesize", "412 variants", true],
              ["Compile", "OVMS · TRT", false],
            ].map(([k, v, done], i) => (
              <div key={i} className="flex items-center justify-between text-[11.5px]">
                <span style={{ color: MUTE }}>{k as string}</span>
                <span
                  className="font-medium flex items-center gap-1"
                  style={{ color: done ? TEAL : MAGENTA, fontFamily: fontMono }}
                >
                  {done ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: MAGENTA }} />}
                  {v as string}
                </span>
              </div>
            ))}
          </div>
          <button
            className="mt-3 w-full text-[12px] font-semibold py-2 rounded-md transition-all hover:opacity-90"
            style={{ background: TEAL, color: BG }}
          >
            Deploy to 50 cameras
          </button>
        </div>
      </div>
    </div>

    {/* glow */}
    <div
      className="absolute -inset-4 -z-10 rounded-3xl blur-3xl opacity-40"
      style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${MAGENTA} 100%)` }}
    />
  </div>
);

const BBox = ({ top, left, w, h, label, color }: any) => (
  <div
    className="absolute"
    style={{
      top,
      left,
      width: w,
      height: h,
      border: `1.5px solid ${color}`,
      boxShadow: `0 0 24px ${color}55, inset 0 0 12px ${color}22`,
    }}
  >
    <span
      className="absolute -top-5 left-0 px-1.5 py-0.5 text-[9.5px] font-semibold"
      style={{
        background: color,
        color: BG,
        fontFamily: fontMono,
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </span>
  </div>
);

// ---------- Section 2: Instant Capsule Generation ----------
const CapsuleSteps = [
  {
    n: "01",
    title: "Capture",
    body: "Select an object of interest directly in any live video stream.",
    icon: Camera,
    accent: TEAL,
  },
  {
    n: "02",
    title: "Synthesize",
    body: "Few-shot foundation engine generates hundreds of training variants automatically.",
    icon: Layers,
    accent: MAGENTA,
  },
  {
    n: "03",
    title: "Deploy",
    body: "One-click push of a live OpenVisionCapsule to every camera in your network.",
    icon: Zap,
    accent: TEAL,
  },
];

const CapsuleFeature = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="border-b" style={{ background: BG_ALT, borderColor: RULE }}>
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* left copy */}
        <div className="lg:col-span-5">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
            style={{ fontFamily: fontMono, color: TEAL }}
          >
            // The On-The-Fly Magic
          </div>
          <h2
            className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
            style={{ fontFamily: fontDisplay, color: TEXT, letterSpacing: "-0.025em" }}
          >
            Instant Capsule Generation.
          </h2>
          <p className="mt-6 text-[16.5px] leading-[1.65]" style={{ color: MUTE }}>
            Spot an object of interest — a blue shirt, a rogue component on an assembly
            line — feed <span style={{ color: TEAL }}>1–5 video frames</span> into the
            platform, and our built-in few-shot foundation engine synthesizes data to
            compile and push a live{" "}
            <span style={{ color: MAGENTA }}>OpenVisionCapsule</span> across your entire
            network in minutes.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["1-5", "Frames needed"],
              ["~3 min", "Time to deploy"],
              ["0", "Lines of code"],
            ].map(([v, k]) => (
              <div key={k}>
                <div
                  className="text-[26px] font-semibold"
                  style={{ fontFamily: fontDisplay, color: TEAL }}
                >
                  {v}
                </div>
                <div
                  className="text-[11px] uppercase tracking-[0.15em] mt-1"
                  style={{ color: FAINT, fontFamily: fontMono }}
                >
                  {k}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right interactive stepper */}
        <div className="lg:col-span-7">
          <div
            className="rounded-2xl border p-6 md:p-8"
            style={{ background: BG, borderColor: RULE }}
          >
            <div className="space-y-3">
              {CapsuleSteps.map((s, i) => {
                const Icon = s.icon;
                const isActive = active === i;
                return (
                  <button
                    key={s.n}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className="w-full text-left rounded-xl border p-5 transition-all flex items-start gap-5"
                    style={{
                      background: isActive ? SURFACE : "transparent",
                      borderColor: isActive ? `${s.accent}55` : RULE,
                      boxShadow: isActive ? `0 8px 30px -10px ${s.accent}55` : "none",
                    }}
                  >
                    <div
                      className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border"
                      style={{
                        background: isActive ? s.accent : `${s.accent}1A`,
                        borderColor: `${s.accent}33`,
                        color: isActive ? BG : s.accent,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span
                          className="text-[11px] font-semibold"
                          style={{ fontFamily: fontMono, color: s.accent }}
                        >
                          {s.n}
                        </span>
                        <span
                          className="text-[17px] font-semibold"
                          style={{ fontFamily: fontDisplay, color: TEXT }}
                        >
                          {s.title}
                        </span>
                      </div>
                      <p className="text-[14px] leading-relaxed" style={{ color: MUTE }}>
                        {s.body}
                      </p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 shrink-0 mt-2 transition-transform"
                      style={{
                        color: isActive ? s.accent : FAINT,
                        transform: isActive ? "translateX(4px)" : "none",
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* footer pipe */}
            <div
              className="mt-6 flex items-center gap-2 text-[11px] pt-5 border-t"
              style={{ borderColor: RULE, fontFamily: fontMono, color: FAINT }}
            >
              <Network className="w-3.5 h-3.5" />
              <span>brainframe.deploy</span>
              <span style={{ color: RULE }}>—</span>
              <span style={{ color: TEAL }}>capsule.live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------- Section 3: Packages ----------
type Pkg = {
  badge?: string;
  title: string;
  cams: string;
  bestFor: string;
  includes: string[];
  metric: string;
  cta: string;
  highlight?: boolean;
};

const packages: Pkg[] = [
  {
    title: "5-Camera Edge Package",
    cams: "Starter",
    bestFor: "Small facilities, localized retail, and quick proof-of-concepts.",
    includes: [
      "1× Pre-loaded Compact Edge Node (Intel Core / NPU)",
      "5× 4K IP Indoor/Outdoor Cameras",
      "BrainFrame OS pre-installed",
      "Core Safety & Counting Capsule pack",
    ],
    metric: "Low CapEx, immediate plug-and-play situational awareness.",
    cta: "Inquire for Pricing",
  },
  {
    badge: "Most Popular",
    title: "50-Camera Scale Package",
    cams: "Facility",
    bestFor: "Medium warehouses, manufacturing floors, multi-department facilities.",
    includes: [
      "2× Pre-loaded Enterprise Edge Servers",
      "50× Smart IP Security Cameras",
      "Dynamic Load-Balancing Software",
      "On-The-Fly Capsule Engine enabled",
    ],
    metric: "Multi-stream algorithm optimization via Intel OpenVINO / NVIDIA TensorRT.",
    cta: "Request Infrastructure Audit",
    highlight: true,
  },
  {
    title: "500+ Camera Enterprise Grid",
    cams: "Enterprise",
    bestFor: "Industrial manufacturing, campus environments, and Smart Cities.",
    includes: [
      "Distributed High-Density Edge Cluster Architecture",
      "Central Management Hub Console",
      "Unlimited On-The-Fly Capsule Deployments",
      "24/7 Mission-Critical Support",
    ],
    metric: "Zero cloud bandwidth bloat — 99% of processing stays fully on-premise.",
    cta: "Contact Enterprise Architect",
  },
];

const PkgIcons = [Building2, Factory, Globe2];

const Packages = () => (
  <section id="packages" className="border-b" style={{ background: BG, borderColor: RULE }}>
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-2xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
          style={{ fontFamily: fontMono, color: TEAL }}
        >
          // Turnkey System Packages
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: fontDisplay, color: TEXT, letterSpacing: "-0.025em" }}
        >
          Three packages. Every scale.
        </h2>
        <p className="mt-5 text-[16.5px] leading-relaxed" style={{ color: MUTE }}>
          Every package ships with edge hardware, IP cameras, and pre-loaded BrainFrame
          software — ready to deploy out of the box.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {packages.map((p, i) => {
          const Icon = PkgIcons[i];
          const accent = p.highlight ? TEAL : MUTE;
          return (
            <div
              key={p.title}
              className="relative rounded-2xl border p-7 md:p-8 flex flex-col transition-all hover:-translate-y-1"
              style={{
                background: p.highlight ? SURFACE : BG_ALT,
                borderColor: p.highlight ? `${TEAL}66` : RULE,
                boxShadow: p.highlight
                  ? `0 24px 60px -20px ${TEAL}55, inset 0 0 0 1px ${TEAL}22`
                  : "0 12px 40px -20px rgba(0,0,0,0.5)",
              }}
            >
              {p.badge && (
                <div
                  className="absolute -top-3 left-7 px-3 py-1 rounded-full text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    background: TEAL,
                    color: BG,
                    fontFamily: fontMono,
                  }}
                >
                  {p.badge}
                </div>
              )}

              <div className="flex items-start justify-between mb-7">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center border"
                  style={{
                    background: p.highlight ? `${TEAL}1A` : "#FFFFFF08",
                    borderColor: p.highlight ? `${TEAL}44` : RULE,
                    color: p.highlight ? TEAL : MUTE,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: fontMono, color: accent }}
                >
                  {p.cams}
                </span>
              </div>

              <h3
                className="text-[22px] md:text-[24px] font-semibold leading-tight mb-3"
                style={{ fontFamily: fontDisplay, color: TEXT, letterSpacing: "-0.01em" }}
              >
                {p.title}
              </h3>
              <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: MUTE }}>
                {p.bestFor}
              </p>

              <div className="space-y-2.5 mb-6 pb-6 border-b" style={{ borderColor: RULE }}>
                {p.includes.map((it) => (
                  <div key={it} className="flex items-start gap-2.5">
                    <Check
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: p.highlight ? TEAL : MAGENTA }}
                    />
                    <span className="text-[13px] leading-snug" style={{ color: TEXT }}>
                      {it}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-7">
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] mb-2 font-semibold"
                  style={{ fontFamily: fontMono, color: FAINT }}
                >
                  Value Metric
                </div>
                <p className="text-[13px] leading-relaxed italic" style={{ color: MUTE }}>
                  {p.metric}
                </p>
              </div>

              <button
                className="mt-auto group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-[13.5px] font-semibold transition-all"
                style={
                  p.highlight
                    ? { background: TEAL, color: BG }
                    : { background: "transparent", color: TEXT, border: `1px solid ${RULE}` }
                }
              >
                {p.cta}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------- Section 4: Trust & Social Proof ----------
const partners = ["intel", "DELL", "OpenCV"];

const caseStudies = [
  {
    tag: "Intel Ecosystem",
    body:
      "How a global bottling company utilized BrainFrame and Intel OpenVINO across 10 distinct factory plants to automate safety compliance — slashing hardware CapEx and dropping deployment timeframes from months to hours.",
    accent: TEAL,
  },
  {
    tag: "Dell Infrastructure",
    body:
      "Deploying high-density edge vision arrays on ruggedized Dell hardware setups to maintain 24/7 security tracking without sacrificing processing FPS.",
    accent: MAGENTA,
  },
];

const Trust = () => (
  <section className="border-b" style={{ background: BG_ALT, borderColor: RULE }}>
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-28">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
          style={{ fontFamily: fontMono, color: TEAL }}
        >
          // Validated at scale
        </div>
        <h2
          className="text-[30px] md:text-[42px] font-semibold leading-[1.1] tracking-tight"
          style={{ fontFamily: fontDisplay, color: TEXT, letterSpacing: "-0.02em" }}
        >
          Proven, validated, and scaled with industry leaders.
        </h2>
      </div>

      {/* Partner logos */}
      <div
        className="grid grid-cols-3 max-w-3xl mx-auto gap-px rounded-xl overflow-hidden border mb-14"
        style={{ background: RULE, borderColor: RULE }}
      >
        {partners.map((p) => (
          <div
            key={p}
            className="flex items-center justify-center py-10 md:py-12"
            style={{ background: BG }}
          >
            <div
              className="text-[28px] md:text-[40px] font-bold tracking-tight"
              style={{
                fontFamily: fontDisplay,
                color: `${TEXT}E0`,
                letterSpacing: "-0.04em",
              }}
            >
              {p}
            </div>
          </div>
        ))}
      </div>

      {/* Mini case studies */}
      <div className="grid md:grid-cols-2 gap-5">
        {caseStudies.map((c) => (
          <div
            key={c.tag}
            className="rounded-2xl border p-7 md:p-8 transition-all hover:-translate-y-0.5"
            style={{
              background: BG,
              borderColor: RULE,
              boxShadow: `0 12px 40px -20px ${c.accent}33`,
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="w-4 h-4" style={{ color: c.accent }} />
              <span
                className="text-[10.5px] font-semibold uppercase tracking-[0.2em]"
                style={{ fontFamily: fontMono, color: c.accent }}
              >
                {c.tag}
              </span>
            </div>
            <p
              className="text-[16px] leading-[1.6]"
              style={{ color: TEXT, fontFamily: fontDisplay }}
            >
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ---------- Section 5: Sticky CTA Banner ----------
const CtaBanner = () => (
  <section style={{ background: BG }}>
    <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
      <div
        className="relative rounded-3xl border overflow-hidden p-10 md:p-14"
        style={{
          background: `linear-gradient(135deg, ${SURFACE} 0%, ${BG_ALT} 100%)`,
          borderColor: `${TEAL}33`,
        }}
      >
        {/* glows */}
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${TEAL} 0%, transparent 60%)` }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${MAGENTA} 0%, transparent 60%)` }}
        />

        <div className="relative grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ fontFamily: fontMono, color: TEAL }}
            >
              // Ready to deploy
            </div>
            <h3
              className="text-[28px] md:text-[40px] font-semibold leading-[1.1] tracking-tight"
              style={{ fontFamily: fontDisplay, color: TEXT, letterSpacing: "-0.02em" }}
            >
              Ready to audit your campus environment?
            </h3>
            <p
              className="mt-4 text-[16px] md:text-[18px] leading-relaxed max-w-2xl"
              style={{ color: MUTE }}
            >
              Get a tailored AI deployment blueprint — hardware sizing, capsule selection,
              and rollout timeline shipped within 48 hours.
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end gap-3 flex-wrap">
            <a
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-[14px] font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: TEAL, color: BG }}
              href="#"
            >
              Get my blueprint
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ---------- Page ----------
const AOTUSolutions = () => {
  return (
    <div style={{ background: BG, color: TEXT }}>
      <Hero />
      <CapsuleFeature />
      <Packages />
      <Trust />
      <CtaBanner />
    </div>
  );
};

export default AOTUSolutions;
