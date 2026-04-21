import { Link } from "react-router-dom";
import {
  ArrowRight,
  Home,
  Building2,
  Factory,
  Camera,
  Layers,
  Zap,
  ShieldAlert,
  HardHat,
  UserX,
  Car,
  Boxes,
  Flame,
  Check,
  Minus,
  Sparkles,
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
          Solutions · Every scale
        </span>
      </div>

      <h1
        className="text-[44px] sm:text-[62px] md:text-[80px] leading-[0.98] font-semibold tracking-tight text-[#0A0F1C] max-w-5xl"
        style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
      >
        AI operators for{" "}
        <span className="relative inline-block">
          <span className="relative z-10">every scale</span>
          <span
            className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-5 -z-0"
            style={{ background: `${ACCENT}B3` }}
          />
        </span>
        .
      </h1>

      <p className="mt-8 max-w-2xl text-[18px] md:text-[20px] leading-[1.5] text-[#0A0F1C]/65">
        From single-site monitoring to enterprise-wide automation, AOTU delivers AI operators tailored to your needs.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="#segments"
          className="group inline-flex items-center gap-2 bg-[#0A0F1C] text-white px-6 py-3.5 rounded-md text-[14px] font-semibold transition-colors hover:bg-[#FF6B00]"
        >
          Find your solution
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  </section>
);

// ---------- Segment Overview ----------
const segments = [
  {
    id: "smb",
    icon: Home,
    label: "SMB / Consumer",
    desc: "Reliable AI monitoring for small teams and single locations.",
    benefit: "Plug-and-play in minutes",
  },
  {
    id: "prosumer",
    icon: Building2,
    label: "Prosumer",
    desc: "Advanced operators for growing businesses and multi-site users.",
    benefit: "Scale across locations",
  },
  {
    id: "enterprise",
    icon: Factory,
    label: "Commercial / Enterprise",
    desc: "Real-time AI automation across complex operations.",
    benefit: "Replace manual monitoring",
  },
];

const SegmentOverview = () => (
  <section id="segments" className="bg-[#F4F5F7] border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-28">
      <div className="max-w-2xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF6B00] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          // Choose your tier
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold tracking-tight leading-[1.05] text-[#0A0F1C]"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Three solutions. One platform.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {segments.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="group bg-white rounded-2xl p-8 border border-[#E5E7EB] hover:border-[#FF6B00]/50 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(10,15,28,0.12)] flex flex-col"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-8"
                style={{ background: `${ACCENT}1A`, color: ACCENT }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A0F1C]/45 mb-2"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {s.label}
              </div>
              <h3
                className="text-[22px] font-semibold leading-tight mb-3 text-[#0A0F1C]"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {s.benefit}
              </h3>
              <p className="text-[14.5px] text-[#0A0F1C]/65 leading-relaxed mb-8">
                {s.desc}
              </p>
              <div className="mt-auto text-[13px] font-semibold inline-flex items-center gap-1.5 text-[#0A0F1C] group-hover:text-[#FF6B00] transition-colors">
                Explore
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------- Reusable Tier Section ----------
type TierProps = {
  id: string;
  tag: string;
  title: string;
  desc: string;
  positioning: string;
  benefits: string[];
  useCases: string[];
  capsules: { icon: typeof ShieldAlert; name: string }[];
  primaryCTA: { label: string; to: string };
  secondaryCTA: { label: string; to: string };
  variant: "light" | "dark" | "fog";
};

const TierSection = ({
  id,
  tag,
  title,
  desc,
  positioning,
  benefits,
  useCases,
  capsules,
  primaryCTA,
  secondaryCTA,
  variant,
}: TierProps) => {
  const isDark = variant === "dark";
  const bg = isDark ? "bg-[#0A0F1C]" : variant === "fog" ? "bg-[#F4F5F7]" : "bg-white";
  const textColor = isDark ? "text-white" : "text-[#0A0F1C]";
  const subColor = isDark ? "text-white/65" : "text-[#0A0F1C]/65";
  const muteColor = isDark ? "text-white/45" : "text-[#0A0F1C]/45";
  const cardBg = isDark ? "bg-white/[0.04]" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-[#E5E7EB]";

  return (
    <section id={id} className={`${bg} border-b border-[#E5E7EB] ${isDark ? "border-b-0" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: positioning */}
          <div className="lg:col-span-5">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-4"
              style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
            >
              // {tag}
            </div>
            <h2
              className={`text-[34px] md:text-[44px] font-semibold tracking-tight leading-[1.08] ${textColor}`}
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
            >
              {title}
            </h2>
            <p className={`mt-6 text-[16.5px] leading-relaxed ${subColor}`}>{desc}</p>

            <div
              className={`mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-[#0A0F1C]/[0.06]"}`}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
              <span
                className={`text-[12px] font-semibold ${textColor}`}
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {positioning}
              </span>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to={primaryCTA.to}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-md text-[13.5px] font-semibold transition-colors text-white hover:opacity-90"
                style={{ background: ACCENT }}
              >
                {primaryCTA.label}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to={secondaryCTA.to}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-md text-[13.5px] font-semibold border transition-colors ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-[#0A0F1C]/15 text-[#0A0F1C] hover:bg-[#0A0F1C]/[0.04]"}`}
              >
                {secondaryCTA.label}
              </Link>
            </div>
          </div>

          {/* Right: details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Benefits */}
            <div>
              <div
                className={`text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-4 ${muteColor}`}
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                Key benefits
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {benefits.map((b) => (
                  <div
                    key={b}
                    className={`${cardBg} ${cardBorder} border rounded-xl p-4`}
                  >
                    <Check className="w-4 h-4 mb-2" style={{ color: ACCENT }} />
                    <div className={`text-[13.5px] font-medium leading-snug ${textColor}`}>
                      {b}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Use cases */}
            <div>
              <div
                className={`text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-4 ${muteColor}`}
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                Example use cases
              </div>
              <div className="flex flex-wrap gap-2">
                {useCases.map((u) => (
                  <span
                    key={u}
                    className={`text-[12.5px] px-3 py-1.5 rounded-full border ${cardBorder} ${subColor}`}
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>

            {/* Capsules */}
            <div>
              <div
                className={`text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-4 ${muteColor}`}
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                Included VisionCapsules
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {capsules.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.name}
                      className={`${cardBg} ${cardBorder} border rounded-lg px-4 py-3 flex items-center gap-3`}
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: `${ACCENT}1A`, color: ACCENT }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className={`text-[13.5px] font-medium ${textColor}`}>
                        {c.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------- Comparison Table ----------
const compareRows: { label: string; smb: string; pro: string; ent: string }[] = [
  { label: "Deployment scale", smb: "Single site", pro: "Multi-site", ent: "Global / unlimited" },
  { label: "Number of cameras", smb: "Up to 8", pro: "8–100", ent: "100+ to thousands" },
  { label: "VisionCapsule access", smb: "Core operators", pro: "Extended library", ent: "Full library + custom" },
  { label: "Customization", smb: "Templates", pro: "Configurable workflows", ent: "Custom development" },
  { label: "Performance", smb: "Standard edge", pro: "High-performance edge", ent: "Enterprise-grade orchestration" },
  { label: "Support level", smb: "Self-serve + email", pro: "Priority support", ent: "Dedicated success team" },
];

const ComparisonTable = () => (
  <section className="bg-white border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-28">
      <div className="max-w-2xl mb-12">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF6B00] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          // Compare tiers
        </div>
        <h2
          className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.05] text-[#0A0F1C]"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Find the right fit at a glance.
        </h2>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F4F5F7] border-b border-[#E5E7EB]">
              <th
                className="py-5 px-5 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#0A0F1C]/50 w-[28%]"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                Feature
              </th>
              <th className="py-5 px-5">
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] text-[#0A0F1C]/45 font-semibold mb-1"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  Tier 01
                </div>
                <div
                  className="text-[15px] font-semibold text-[#0A0F1C]"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  SMB / Consumer
                </div>
              </th>
              <th
                className="py-5 px-5 border-l border-[#E5E7EB]"
                style={{ background: `${ACCENT}0D` }}
              >
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] font-semibold mb-1"
                  style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
                >
                  Tier 02
                </div>
                <div
                  className="text-[15px] font-semibold text-[#0A0F1C]"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  Prosumer
                </div>
              </th>
              <th className="py-5 px-5 border-l border-[#E5E7EB]">
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] text-[#0A0F1C]/45 font-semibold mb-1"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  Tier 03
                </div>
                <div
                  className="text-[15px] font-semibold text-[#0A0F1C]"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  Enterprise
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row, i) => (
              <tr
                key={row.label}
                className={`border-b border-[#E5E7EB] last:border-b-0 ${i % 2 === 1 ? "bg-[#F4F5F7]/40" : ""}`}
              >
                <td className="py-4 px-5 text-[13.5px] font-semibold text-[#0A0F1C]">
                  {row.label}
                </td>
                <td className="py-4 px-5 text-[13.5px] text-[#0A0F1C]/70">{row.smb}</td>
                <td
                  className="py-4 px-5 text-[13.5px] text-[#0A0F1C]/85 font-medium border-l border-[#E5E7EB]"
                  style={{ background: `${ACCENT}08` }}
                >
                  {row.pro}
                </td>
                <td className="py-4 px-5 text-[13.5px] text-[#0A0F1C]/70 border-l border-[#E5E7EB]">
                  {row.ent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

// ---------- VisionCapsules Connection ----------
const capsuleSamples = [
  { icon: ShieldAlert, name: "Intrusion" },
  { icon: HardHat, name: "PPE" },
  { icon: UserX, name: "Loitering" },
  { icon: Car, name: "Vehicle" },
  { icon: Boxes, name: "Object Count" },
  { icon: Flame, name: "Smoke & Fire" },
];

const CapsuleConnection = () => (
  <section className="bg-[#F4F5F7] border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-28">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF6B00] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // Powered by VisionCapsules
          </div>
          <h2
            className="text-[34px] md:text-[44px] font-semibold tracking-tight leading-[1.05] text-[#0A0F1C]"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            One library. Every tier.
          </h2>
          <p className="mt-5 text-[16px] text-[#0A0F1C]/65 leading-relaxed max-w-md">
            All solutions are built on modular AI operators that can be deployed, combined, and scaled across any environment.
          </p>
          <Link
            to="/labs/aotu/marketplace"
            className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0A0F1C] hover:text-[#FF6B00] transition-colors"
          >
            Explore Marketplace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {capsuleSamples.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.name}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-[#FF6B00]/40 hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center mb-4"
                    style={{ background: `${ACCENT}1A`, color: ACCENT }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div
                    className="text-[14px] font-semibold text-[#0A0F1C]"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {c.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ---------- Deployment Simplicity ----------
const steps = [
  { n: "01", icon: Camera, title: "Connect cameras", desc: "Plug in existing cameras and video streams." },
  { n: "02", icon: Layers, title: "Deploy VisionCapsules", desc: "Pick the AI operators you need." },
  { n: "03", icon: Zap, title: "Start detecting events", desc: "Real-time alerts and automated actions." },
];

const DeploymentSimplicity = () => (
  <section className="bg-white border-b border-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-28">
      <div className="max-w-2xl mb-14">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF6B00] mb-3"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          // Deployment
        </div>
        <h2
          className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.05] text-[#0A0F1C]"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          From setup to operation in weeks.
        </h2>
      </div>

      <div className="relative">
        <div
          className="hidden md:block absolute top-12 left-[12%] right-[12%] border-t-2 border-dashed border-[#0A0F1C]/15"
          aria-hidden
        />
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-5">
                  <div
                    className="w-24 h-24 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 shadow-[0_8px_24px_-12px_rgba(10,15,28,0.15)] relative z-10"
                  >
                    <Icon className="w-9 h-9" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <div
                      className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#0A0F1C]/45 mb-1.5"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      Step {s.n}
                    </div>
                    <h3
                      className="text-[20px] font-semibold text-[#0A0F1C] mb-2"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-[14.5px] text-[#0A0F1C]/65 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

// ---------- Final CTA ----------
const FinalCTA = () => (
  <section className="bg-[#0A0F1C] relative overflow-hidden">
    <div
      className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl pointer-events-none"
      style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 60%)` }}
    />
    <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-3xl">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-5"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
        >
          // Get started
        </div>
        <h2
          className="text-[40px] md:text-[60px] font-semibold tracking-tight leading-[1.04] text-white"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Find the right AI operators for your needs.
        </h2>
        <p className="mt-6 text-[18px] text-white/65 leading-relaxed max-w-2xl">
          Whether you're starting small or scaling globally, AOTU has a solution for you.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/labs/aotu/contact"
            className="group inline-flex items-center gap-2 text-white px-6 py-3.5 rounded-md text-[14px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: ACCENT }}
          >
            Request demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/labs/aotu/contact"
            className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3.5 rounded-md text-[14px] font-semibold hover:bg-white/10 transition-colors"
          >
            Talk to sales
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// ---------- Page ----------
const AOTUSolutions = () => {
  return (
    <>
      <Hero />
      <SegmentOverview />

      <TierSection
        id="smb"
        tag="Tier 01 · SMB / Consumer"
        title="Simple AI monitoring for small teams and single locations."
        desc="For small businesses and property owners who need reliable monitoring without complexity."
        positioning="Get started in minutes"
        benefits={["Plug-and-play setup", "Low cost entry", "Core operators included"]}
        useCases={["Small retail security", "Home & rental monitoring", "Small office oversight"]}
        capsules={[
          { icon: ShieldAlert, name: "Intrusion detection" },
          { icon: Zap, name: "Motion alerts" },
          { icon: Boxes, name: "Basic anomaly detection" },
          { icon: Camera, name: "Live camera feed" },
        ]}
        primaryCTA={{ label: "Get started", to: "/labs/aotu/contact" }}
        secondaryCTA={{ label: "Request demo", to: "/labs/aotu/contact" }}
        variant="light"
      />

      <TierSection
        id="prosumer"
        tag="Tier 02 · Prosumer"
        title="Advanced AI operators for growing businesses and multi-site users."
        desc="For tech-forward operators and growing businesses that want more control, customization, and intelligence."
        positioning="Scale your operations"
        benefits={["Multi-camera & multi-site", "Customizable capsules", "Higher performance"]}
        useCases={["Multi-location retail", "Warehouses", "Short-term rentals", "Smart property mgmt"]}
        capsules={[
          { icon: HardHat, name: "PPE detection" },
          { icon: UserX, name: "Loitering detection" },
          { icon: Car, name: "Vehicle detection" },
          { icon: Layers, name: "Custom workflows" },
        ]}
        primaryCTA={{ label: "Explore capabilities", to: "/labs/aotu/marketplace" }}
        secondaryCTA={{ label: "Build your setup", to: "/labs/aotu/contact" }}
        variant="fog"
      />

      <TierSection
        id="enterprise"
        tag="Tier 03 · Commercial / Enterprise"
        title="AI operators at scale for enterprise and industrial environments."
        desc="For large organizations that need real-time automation across many sites, systems, and teams."
        positioning="Replace manual monitoring"
        benefits={[
          "Full BrainFrame deployment",
          "Large-scale orchestration",
          "Integrates with your stack",
          "Enterprise-grade SLAs",
        ]}
        useCases={[
          "Manufacturing safety",
          "Logistics & supply chain",
          "Smart infrastructure",
          "Large-scale security ops",
        ]}
        capsules={[
          { icon: Boxes, name: "Full library + custom dev" },
          { icon: HardHat, name: "Compliance monitoring" },
          { icon: ShieldAlert, name: "Advanced anomaly detection" },
          { icon: Flame, name: "Hazard & fire detection" },
        ]}
        primaryCTA={{ label: "Talk to sales", to: "/labs/aotu/contact" }}
        secondaryCTA={{ label: "Request enterprise demo", to: "/labs/aotu/contact" }}
        variant="dark"
      />

      <ComparisonTable />
      <CapsuleConnection />
      <DeploymentSimplicity />
      <FinalCTA />
    </>
  );
};

export default AOTUSolutions;
