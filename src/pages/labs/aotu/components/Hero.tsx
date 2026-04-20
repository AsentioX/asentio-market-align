import { ArrowRight, Play, Code2, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#E5E7EB]">
      {/* Subtle grid */}
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
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9F24A] animate-pulse" />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A0F1C]/70"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            AI Operators · v2026
          </span>
        </div>

        <h1
          className="text-[42px] sm:text-[58px] md:text-[78px] leading-[0.95] font-semibold tracking-tight text-[#0A0F1C] max-w-5xl"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
        >
          Replace manual monitoring with{" "}
          <span className="relative inline-block">
            <span className="relative z-10">AI operators</span>
            <span className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-5 bg-[#C9F24A] -z-0" />
          </span>
          .
        </h1>

        <p className="mt-8 max-w-2xl text-[17px] md:text-[19px] leading-[1.55] text-[#0A0F1C]/70">
          BrainFrame powers real-time AI operators at the edge. VisionCapsules
          deliver specialized intelligence for every camera, site, and
          environment.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/labs/aotu/solutions"
            className="group inline-flex items-center gap-2 bg-[#0A0F1C] text-white px-5 py-3 rounded-md text-[14px] font-semibold hover:bg-[#1E40FF] transition-colors"
          >
            See solutions
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/labs/aotu/marketplace"
            className="inline-flex items-center gap-2 bg-white text-[#0A0F1C] border border-[#0A0F1C]/15 px-5 py-3 rounded-md text-[14px] font-semibold hover:border-[#0A0F1C]/40 transition-colors"
          >
            <Play className="w-4 h-4" />
            Explore Marketplace
          </Link>
          <Link
            to="/labs/aotu/developers"
            className="inline-flex items-center gap-2 bg-transparent text-[#0A0F1C] border border-[#0A0F1C]/15 px-5 py-3 rounded-md text-[14px] font-semibold hover:border-[#0A0F1C]/40 transition-colors"
          >
            <Code2 className="w-4 h-4" />
            Build a VisionCapsule
          </Link>
          <Link
            to="/labs/aotu/partners"
            className="inline-flex items-center gap-2 bg-transparent text-[#0A0F1C]/70 px-5 py-3 rounded-md text-[14px] font-medium hover:text-[#0A0F1C] transition-colors"
          >
            <Handshake className="w-4 h-4" />
            Partner with us
          </Link>
        </div>

        {/* Live counter strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
          {[
            { k: "Cameras under operator", v: "184,302" },
            { k: "Frames inferred / sec", v: "12.4M" },
            { k: "Capsules in marketplace", v: "147" },
            { k: "Sites deployed", v: "2,118" },
          ].map((s) => (
            <div key={s.k} className="bg-[#F4F5F7] p-5">
              <div
                className="text-[24px] md:text-[28px] font-semibold text-[#0A0F1C] tabular-nums"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {s.v}
              </div>
              <div className="text-[11.5px] uppercase tracking-widest text-[#0A0F1C]/50 mt-1">
                {s.k}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
