import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#0A0A0A]">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #FFFFFF0A 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF0A 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)",
        }}
      />
      {/* Cyber orange glow */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, #FF5E1A 0%, transparent 60%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-36">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E1A] animate-pulse" />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F4FDFF]/65"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            AI Operators · v2026
          </span>
        </div>

        <h1
          className="text-[44px] sm:text-[62px] md:text-[84px] leading-[0.95] font-semibold tracking-tight text-[#F4FDFF] max-w-5xl"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Replace manual monitoring with{" "}
          <span className="relative inline-block">
            <span className="relative z-10">AI operators</span>
            <span className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-5 bg-[#FF5E1A]/70 -z-0" />
          </span>
          .
        </h1>

        <p className="mt-8 max-w-xl text-[18px] md:text-[20px] leading-[1.5] text-[#F4FDFF]/60">
          Deploy real-time AI operators across your cameras and sites in minutes.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/labs/aotu/contact"
            className="group inline-flex items-center gap-2 bg-[#FF5E1A] text-[#0A0A0A] px-6 py-3.5 rounded-md text-[14px] font-semibold hover:bg-[#FF8C42] transition-colors"
          >
            Request demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/labs/aotu/marketplace"
            className="inline-flex items-center gap-2 bg-[#161B22] text-[#F4FDFF] border border-white/10 px-6 py-3.5 rounded-md text-[14px] font-semibold hover:border-[#FF5E1A]/40 hover:bg-[#1C232E] transition-colors"
          >
            <Play className="w-4 h-4" />
            Explore AI operators
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
