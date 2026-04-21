import { Building2, Code2, Handshake, Newspaper, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const paths = [
  {
    icon: Building2,
    title: "Deploy AI Operators",
    to: "/labs/aotu/solutions",
  },
  {
    icon: Code2,
    title: "Build VisionCapsules",
    to: "/labs/aotu/developers",
  },
  {
    icon: Handshake,
    title: "Partner with AOTU",
    to: "/labs/aotu/partners",
  },
  {
    icon: Newspaper,
    title: "Explore insights",
    to: "/labs/aotu/resources",
  },
];

const AudiencePathways = () => {
  return (
    <section className="bg-[#0A0A0A] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="max-w-2xl mb-12">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // Pathways
          </div>
          <h2
            className="text-[32px] md:text-[44px] font-semibold leading-[1.05] tracking-tight text-[#F4FDFF]"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            Choose your path.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {paths.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.title}
                to={p.to}
                className="group bg-[#161B22] rounded-xl p-6 border border-white/10 hover:border-[#FF5E1A]/50 hover:bg-[#1C232E] transition-all"
              >
                <Icon className="w-5 h-5 text-[#FF5E1A] mb-8" />
                <div
                  className="text-[18px] font-semibold leading-tight mb-6 text-[#F4FDFF]"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {p.title}
                </div>
                <div className="text-[13px] font-semibold inline-flex items-center gap-1.5 text-[#F4FDFF] group-hover:text-[#FF5E1A] transition-colors">
                  Go
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AudiencePathways;
