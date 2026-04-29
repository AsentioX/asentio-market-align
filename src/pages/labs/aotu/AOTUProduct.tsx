import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Cpu,
  Boxes,
  Bell,
  Zap,
  Plug,
  Shield,
  ShoppingBag,
  Warehouse,
  Building2,
  Factory,
  Building,
  CheckCircle2,
  Store,
  Activity,
  TrendingDown,
  Clock,
  Gauge,
  Sparkles,
} from "lucide-react";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Few cameras",
    range: "1–8 cameras",
    hardware: "Intel NUC / Dell OptiPlex",
    bestFor: "Small business, pilot deployments",
    benefits: [
      "Plug-and-play edge AI",
      "Zero networking changes",
      "Up & running in hours",
    ],
    accent: "#22C55E",
    badge: "🟢",
  },
  {
    id: "business",
    name: "Business",
    tagline: "Some cameras",
    range: "8–50 cameras",
    hardware: "Dell Precision + Intel Arc",
    bestFor: "Retail, property management",
    benefits: [
      "GPU-accelerated workstation",
      "Multi-VisionCapsule per stream",
      "Centralized dashboards",
    ],
    accent: "#FACC15",
    badge: "🟡",
    featured: true,
  },
  {
    id: "site",
    name: "Site",
    tagline: "Many cameras",
    range: "50–300 cameras",
    hardware: "Dell PowerEdge + GPUs",
    bestFor: "Warehouses, factories",
    benefits: [
      "Edge AI server cluster",
      "High-density inference",
      "On-prem data sovereignty",
    ],
    accent: "#3B82F6",
    badge: "🔵",
  },
  {
    id: "platform",
    name: "Platform",
    tagline: "Enterprise scale",
    range: "300+ cameras, multi-site",
    hardware: "Dell PowerEdge + cluster",
    bestFor: "Cities, national chains",
    benefits: [
      "Edge + cloud orchestration",
      "Cross-site analytics",
      "SLA-backed deployment",
    ],
    accent: "#F4FDFF",
    badge: "⚫",
  },
];

const useCases = [
  {
    icon: ShoppingBag,
    industry: "Retail",
    problem: "Shrinkage and unmonitored traffic patterns",
    solution: "Theft detection + footfall analytics VisionCapsules",
    outcome: "Reduce shrink, optimize layout",
  },
  {
    icon: Warehouse,
    industry: "Warehousing",
    problem: "PPE compliance and forklift safety blind spots",
    solution: "Safety compliance + zone violation operators",
    outcome: "Fewer incidents, audit-ready logs",
  },
  {
    icon: Building2,
    industry: "Property Management",
    problem: "After-hours intrusions and tenant friction",
    solution: "Intrusion detection + visitor recognition",
    outcome: "Stronger security, smoother access",
  },
  {
    icon: Factory,
    industry: "Manufacturing",
    problem: "Defects caught too late in the line",
    solution: "Defect detection + process monitoring",
    outcome: "Higher yield, less rework",
  },
  {
    icon: Building,
    industry: "Smart Cities",
    problem: "Traffic congestion and public safety response",
    solution: "Traffic flow + incident detection at scale",
    outcome: "Faster response, better mobility",
  },
];

const capsules = [
  { name: "Intrusion Detect", category: "Security", color: "#FF5E1A" },
  { name: "PPE Compliance", category: "Safety", color: "#22C55E" },
  { name: "Footfall Analytics", category: "Analytics", color: "#3B82F6" },
  { name: "License Plate", category: "Operations", color: "#FACC15" },
  { name: "Defect Inspection", category: "Manufacturing", color: "#A855F7" },
  { name: "Queue Monitor", category: "Retail", color: "#EC4899" },
];

const metrics = [
  { icon: TrendingDown, label: "Monitoring cost", value: "−68%", desc: "vs. dedicated security staff" },
  { icon: Clock, label: "Response time", value: "12s", desc: "from event to alert" },
  { icon: Gauge, label: "Operational uplift", value: "3.4×", desc: "incidents caught per shift" },
];

const AOTUProduct = () => {
  const [activeTier, setActiveTier] = useState("business");

  useEffect(() => {
    document.title = "AOTU — Turn Cameras into AI Operators";
    const meta = document.querySelector('meta[name="description"]');
    const desc =
      "BrainFrame + VisionCapsules turn existing cameras into AI operators. Pick a deployment tier from Starter to Platform and request a demo.";
    if (meta) meta.setAttribute("content", desc);
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-[#F4FDFF]">
      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          className="absolute inset-0 opacity-[0.5] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #FFFFFF0A 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF0A 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)",
          }}
        />
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle, #FF5E1A 0%, transparent 60%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E1A] animate-pulse" />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F4FDFF]/65"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  BrainFrame · VisionCapsules
                </span>
              </div>
              <h1
                className="text-[44px] sm:text-[60px] md:text-[76px] leading-[0.95] font-semibold tracking-tight"
                style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
              >
                Turn cameras into{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">AI operators</span>
                  <span className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-5 bg-[#FF5E1A]/70 -z-0" />
                </span>
                .
              </h1>
              <p className="mt-7 max-w-xl text-[17px] md:text-[19px] leading-[1.55] text-[#F4FDFF]/65">
                BrainFrame runs AI-powered video intelligence at the edge. VisionCapsules
                deliver real-world outcomes—from security to safety to operations.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#tiers"
                  className="group inline-flex items-center gap-2 bg-[#FF5E1A] text-[#0A0A0A] px-6 py-3.5 rounded-md text-[14px] font-semibold hover:bg-[#FF8C42] transition-colors"
                >
                  Explore solutions
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 bg-[#161B22] text-[#F4FDFF] border border-white/10 px-6 py-3.5 rounded-md text-[14px] font-semibold hover:border-[#FF5E1A]/40 hover:bg-[#1C232E] transition-colors"
                >
                  Request demo
                </a>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Zap, label: "Deploy in hours, not months" },
                  { icon: Plug, label: "Works with existing cameras" },
                  { icon: Cpu, label: "Powered by Intel edge AI" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 text-[12.5px] text-[#F4FDFF]/70 bg-[#161B22]/60 border border-white/5 rounded-lg px-3 py-2.5"
                  >
                    <Icon className="w-4 h-4 text-[#FF5E1A] shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Faux camera dashboard */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-[#FF5E1A]/15 to-transparent blur-2xl rounded-3xl" />
              <div className="relative bg-[#0F141B] border border-white/10 rounded-2xl p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between px-2 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF5E1A] animate-pulse" />
                    <span
                      className="text-[10px] uppercase tracking-[0.18em] text-[#F4FDFF]/60"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      Live · 8 streams
                    </span>
                  </div>
                  <span className="text-[10px] text-[#F4FDFF]/40">brainframe v3.2</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: "Loading Bay 02", tag: "PPE OK", color: "#22C55E" },
                    { label: "Aisle 14", tag: "Person × 3", color: "#3B82F6" },
                    { label: "Entry · East", tag: "Intrusion!", color: "#FF5E1A" },
                    { label: "Line A · QC", tag: "Defect", color: "#FACC15" },
                  ].map((feed) => (
                    <div
                      key={feed.label}
                      className="relative aspect-video bg-gradient-to-br from-[#1C232E] to-[#0A0A0A] rounded-md border border-white/5 overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, #ffffff05 0 8px, transparent 8px 16px)",
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          top: "28%",
                          left: "22%",
                          width: "38%",
                          height: "48%",
                          border: `1.5px solid ${feed.color}`,
                          boxShadow: `0 0 0 1px ${feed.color}33`,
                        }}
                      >
                        <span
                          className="absolute -top-4 left-0 text-[9px] font-semibold px-1 rounded-sm"
                          style={{ background: feed.color, color: "#0A0A0A" }}
                        >
                          {feed.tag}
                        </span>
                      </div>
                      <span className="absolute bottom-1 left-1.5 text-[9px] text-[#F4FDFF]/70">
                        {feed.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between bg-[#161B22] rounded-md px-3 py-2 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-[#FF5E1A]" />
                    <span className="text-[11px] text-[#F4FDFF]/80">
                      Intrusion · Entry East · 12s ago
                    </span>
                  </div>
                  <span className="text-[10px] text-[#FF5E1A] font-semibold">ACK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-14">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              // How it works
            </div>
            <h2
              className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.05]"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
            >
              From pixels to outcomes in four steps.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Camera, title: "Cameras", desc: "Use your existing IP cameras—no rip & replace." },
              { icon: Cpu, title: "BrainFrame", desc: "AI operating system orchestrates every stream." },
              { icon: Boxes, title: "VisionCapsules", desc: "Plug-and-play AI models for your use case." },
              { icon: Bell, title: "Alerts & Insights", desc: "Real-time actions, dashboards, and integrations." },
            ].map((step, i) => (
              <div key={step.title} className="relative">
                <div className="bg-[#161B22] border border-white/10 rounded-2xl p-6 h-full hover:border-[#FF5E1A]/40 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-lg bg-[#FF5E1A]/15 border border-[#FF5E1A]/20 text-[#FF5E1A] flex items-center justify-center">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span
                      className="text-[11px] text-[#F4FDFF]/30"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <h3
                    className="text-[18px] font-semibold mb-2"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[13.5px] text-[#F4FDFF]/60 leading-relaxed">{step.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 w-5 h-5 text-[#FF5E1A]/50 -translate-y-1/2 z-10" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#FF5E1A]/10 to-transparent border border-[#FF5E1A]/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-[#FF5E1A]" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#FF5E1A]">
                  BrainFrame
                </span>
              </div>
              <p className="text-[14px] text-[#F4FDFF]/75 leading-relaxed">
                The AI operating system for video. Manages compute, models, streams, and alerts
                across edge and cloud.
              </p>
            </div>
            <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Boxes className="w-4 h-4 text-[#F4FDFF]" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#F4FDFF]/80">
                  VisionCapsules
                </span>
              </div>
              <p className="text-[14px] text-[#F4FDFF]/75 leading-relaxed">
                Plug-and-play AI models, packaged for instant deployment. Mix, match, and
                upgrade without touching your hardware.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── SOLUTION TIERS ─────────── */}
      <section id="tiers" className="border-b border-white/[0.06] bg-[#0C1117]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                // Solution tiers
              </div>
              <h2
                className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.05]"
                style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
              >
                A scalable AI workforce that grows with your camera footprint.
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-[#161B22] p-1.5 rounded-lg border border-white/10">
              {tiers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTier(t.id)}
                  className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-md transition-colors ${
                    activeTier === t.id
                      ? "bg-[#FF5E1A] text-[#0A0A0A]"
                      : "text-[#F4FDFF]/60 hover:text-[#F4FDFF]"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => {
              const isActive = activeTier === tier.id;
              return (
                <div
                  key={tier.id}
                  onMouseEnter={() => setActiveTier(tier.id)}
                  className={`relative bg-[#161B22] rounded-2xl p-6 border transition-all flex flex-col ${
                    isActive
                      ? "border-[#FF5E1A]/60 shadow-[0_20px_50px_-15px_rgba(255,94,26,0.35)] -translate-y-1"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {tier.featured && (
                    <span className="absolute -top-2.5 right-4 bg-[#FF5E1A] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: tier.accent }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#F4FDFF]/50"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      {tier.tagline}
                    </span>
                  </div>
                  <h3
                    className="text-[26px] font-semibold mb-1"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {tier.name}
                  </h3>
                  <p className="text-[13.5px] text-[#F4FDFF]/55 mb-5">{tier.range}</p>

                  <div className="text-[11px] uppercase tracking-wider text-[#F4FDFF]/40 mb-1.5">
                    Hardware
                  </div>
                  <p className="text-[13px] text-[#F4FDFF]/85 mb-5">{tier.hardware}</p>

                  <div className="text-[11px] uppercase tracking-wider text-[#F4FDFF]/40 mb-2">
                    Includes
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[13px] text-[#F4FDFF]/75">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E1A] mt-[3px] shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="text-[11px] uppercase tracking-wider text-[#F4FDFF]/40 mb-1.5">
                    Best for
                  </div>
                  <p className="text-[12.5px] text-[#F4FDFF]/65 mb-5">{tier.bestFor}</p>

                  <div className="flex gap-2 mt-auto">
                    <a
                      href="#use-cases"
                      className="flex-1 text-center text-[12.5px] font-semibold bg-[#1C232E] border border-white/10 text-[#F4FDFF] px-3 py-2.5 rounded-md hover:border-[#FF5E1A]/40 transition-colors"
                    >
                      Use cases
                    </a>
                    <a
                      href="#demo"
                      className="flex-1 text-center text-[12.5px] font-semibold bg-[#FF5E1A] text-[#0A0A0A] px-3 py-2.5 rounded-md hover:bg-[#FF8C42] transition-colors"
                    >
                      Get quote
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── USE CASES ─────────── */}
      <section id="use-cases" className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              // Use cases
            </div>
            <h2
              className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.05]"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
            >
              Outcomes that operators can measure.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc) => {
              const Icon = uc.icon;
              return (
                <div
                  key={uc.industry}
                  className="bg-[#161B22] border border-white/10 rounded-2xl p-6 hover:border-[#FF5E1A]/40 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#FF5E1A]/15 border border-[#FF5E1A]/20 text-[#FF5E1A] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3
                    className="text-[19px] font-semibold mb-4"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {uc.industry}
                  </h3>
                  <div className="space-y-3 text-[13px]">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#F4FDFF]/40 mb-1">
                        Problem
                      </div>
                      <p className="text-[#F4FDFF]/75">{uc.problem}</p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#F4FDFF]/40 mb-1">
                        AI solution
                      </div>
                      <p className="text-[#F4FDFF]/75">{uc.solution}</p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#FF5E1A] mb-1">
                        Outcome
                      </div>
                      <p className="text-[#F4FDFF] font-medium">{uc.outcome}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── MARKETPLACE ─────────── */}
      <section className="border-b border-white/[0.06] bg-[#0C1117]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                // VisionCapsule Marketplace
              </div>
              <h2
                className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.05] mb-6"
                style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
              >
                An app store for vision AI.
              </h2>
              <p className="text-[16px] text-[#F4FDFF]/65 leading-relaxed max-w-lg mb-8">
                Browse AI models for security, safety, and analytics. Plug them into BrainFrame
                and continuously upgrade what your cameras can do—no integrator required.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/labs/aotu/marketplace"
                  className="inline-flex items-center gap-2 bg-[#FF5E1A] text-[#0A0A0A] px-5 py-3 rounded-md text-[13.5px] font-semibold hover:bg-[#FF8C42] transition-colors"
                >
                  Explore marketplace
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/labs/aotu/developers"
                  className="inline-flex items-center gap-2 bg-[#161B22] border border-white/10 px-5 py-3 rounded-md text-[13.5px] font-semibold hover:border-[#FF5E1A]/40 transition-colors"
                >
                  Develop a VisionCapsule
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {capsules.map((c) => (
                <div
                  key={c.name}
                  className="bg-[#161B22] border border-white/10 rounded-xl p-4 hover:border-[#FF5E1A]/40 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center mb-3"
                    style={{ background: `${c.color}22`, border: `1px solid ${c.color}40` }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: c.color }} />
                  </div>
                  <div className="text-[13.5px] font-semibold mb-0.5">{c.name}</div>
                  <div className="text-[10.5px] uppercase tracking-wider text-[#F4FDFF]/45">
                    {c.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── PARTNERS ─────────── */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              // Built on
            </div>
            <h2
              className="text-[28px] md:text-[36px] font-semibold tracking-tight"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
            >
              Enterprise-grade infrastructure.
            </h2>
            <p className="mt-3 text-[14px] text-[#F4FDFF]/60">
              Scalable, reliable, and supported by the world's leading silicon and systems partners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              {
                name: "Intel",
                role: "Edge AI compute",
                desc: "OpenVINO-optimized inference across CPUs, GPUs, and Arc accelerators.",
              },
              {
                name: "Dell Technologies",
                role: "Infrastructure",
                desc: "From OptiPlex to PowerEdge clusters—reference architectures for every scale.",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="bg-[#161B22] border border-white/10 rounded-2xl p-6 flex items-center gap-5"
              >
                <div
                  className="w-14 h-14 rounded-xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-[18px] font-bold"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div
                    className="text-[16px] font-semibold"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {p.name}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#FF5E1A] mb-1">
                    {p.role}
                  </div>
                  <p className="text-[12.5px] text-[#F4FDFF]/60">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── ROI / VALUE ─────────── */}
      <section className="border-b border-white/[0.06] bg-[#0C1117]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              // ROI
            </div>
            <h2
              className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.05]"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
            >
              From monitoring to outcomes.
            </h2>
            <p className="mt-4 text-[15px] text-[#F4FDFF]/60 max-w-lg">
              AOTU isn't just video analytics—it's a scalable AI workforce that grows with your
              camera footprint.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="bg-[#161B22] border border-white/10 rounded-2xl p-7"
                >
                  <Icon className="w-5 h-5 text-[#FF5E1A] mb-5" />
                  <div
                    className="text-[48px] font-semibold leading-none mb-2"
                    style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
                  >
                    {m.value}
                  </div>
                  <div className="text-[13.5px] font-medium text-[#F4FDFF]/85">{m.label}</div>
                  <div className="text-[12px] text-[#F4FDFF]/50 mt-1">{m.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── FINAL CTA ─────────── */}
      <section id="demo" className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, #FF5E1A33 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <h2
            className="text-[40px] md:text-[60px] font-semibold tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            See your cameras working{" "}
            <span className="text-[#FF5E1A]">for you</span>.
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#F4FDFF]/65 max-w-xl mx-auto mb-10">
            Get a tailored walkthrough of BrainFrame and the right VisionCapsules for your sites.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:hello@aotu.ai"
              className="inline-flex items-center gap-2 bg-[#FF5E1A] text-[#0A0A0A] px-7 py-4 rounded-md text-[14.5px] font-semibold hover:bg-[#FF8C42] transition-colors"
            >
              Book a demo
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="mailto:hello@aotu.ai"
              className="inline-flex items-center gap-2 bg-[#161B22] border border-white/10 px-7 py-4 rounded-md text-[14.5px] font-semibold hover:border-[#FF5E1A]/40 transition-colors"
            >
              Talk to an expert
            </a>
            <a
              href="#tiers"
              className="inline-flex items-center gap-2 text-[#F4FDFF]/70 hover:text-[#F4FDFF] px-5 py-4 text-[14.5px] font-semibold transition-colors"
            >
              <Store className="w-4 h-4" />
              Start with a Starter Kit
            </a>
          </div>
        </div>
      </section>

      {/* ─────────── STICKY CTA ─────────── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-3 bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 rounded-full pl-5 pr-2 py-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
        <Activity className="w-4 h-4 text-[#FF5E1A]" />
        <span className="text-[12.5px] text-[#F4FDFF]/80">
          Ready to deploy AI operators?
        </span>
        <a
          href="#demo"
          className="inline-flex items-center gap-1.5 bg-[#FF5E1A] text-[#0A0A0A] px-4 py-2 rounded-full text-[12.5px] font-semibold hover:bg-[#FF8C42] transition-colors"
        >
          Request demo
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default AOTUProduct;
