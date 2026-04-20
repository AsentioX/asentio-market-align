import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

const labels: Record<string, { title: string; sub: string }> = {
  "/labs/aotu/platform": {
    title: "BrainFrame · Platform",
    sub: "Edge-native AI runtime. Multi-stream orchestration. Sub-second inference at any scale.",
  },
  "/labs/aotu/solutions": {
    title: "Solutions",
    sub: "Pre-packaged AI operators across Security, Manufacturing, Logistics, and Smart Infrastructure.",
  },
  "/labs/aotu/marketplace": {
    title: "VisionCapsules Marketplace",
    sub: "Browse, filter, and deploy modular AI operators built by AOTU, our partners, and developers.",
  },
  "/labs/aotu/developers": {
    title: "Developers",
    sub: "SDK, APIs, docs and tutorials for building VisionCapsules on BrainFrame.",
  },
  "/labs/aotu/partners": {
    title: "Partners",
    sub: "Strategic partners (Intel, Dell), tech vendors, and channel integrators.",
  },
  "/labs/aotu/resources": {
    title: "Resources",
    sub: "Case studies, POVs, videos, and whitepapers on autonomous operations and edge AI.",
  },
  "/labs/aotu/company": {
    title: "Company",
    sub: "Press, media kit, founder POV, and the AOTU narrative.",
  },
};

const AOTUStub = () => {
  const loc = useLocation();
  const meta = labels[loc.pathname] ?? { title: "AOTU", sub: "Coming soon." };

  return (
    <section className="border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <Link
          to="/labs/aotu"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#0A0F1C]/60 hover:text-[#0A0F1C] mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9F24A]/30 text-[#0A0F1C] text-[11px] font-semibold uppercase tracking-[0.18em] mb-6"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          <Sparkles className="w-3 h-3" /> Page in build
        </div>

        <h1
          className="text-[44px] md:text-[64px] font-semibold leading-[1.02] tracking-tight max-w-3xl"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.025em" }}
        >
          {meta.title}
        </h1>
        <p className="mt-6 text-[17px] text-[#0A0F1C]/65 max-w-2xl leading-relaxed">
          {meta.sub}
        </p>

        <div className="mt-12 grid sm:grid-cols-3 gap-3 max-w-3xl">
          {["Outline ready", "Design in progress", "Ships next sprint"].map(
            (s, i) => (
              <div
                key={s}
                className="bg-white border border-[#E5E7EB] rounded-xl p-5"
              >
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] text-[#0A0F1C]/45"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  Step 0{i + 1}
                </div>
                <div className="text-[15px] font-semibold mt-1.5">{s}</div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default AOTUStub;
