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
    <section className="bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="max-w-2xl mb-12">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00B8FF] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // Pathways
          </div>
          <h2
            className="text-[32px] md:text-[44px] font-semibold leading-[1.05] tracking-tight text-[#0A0F1C]"
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
                className="group bg-white rounded-xl p-6 border border-[#E5E7EB] hover:border-[#0A0F1C]/40 hover:bg-[#0A0F1C] hover:text-white transition-all"
              >
                <Icon className="w-5 h-5 text-[#00B8FF] mb-8" />
                <div
                  className="text-[18px] font-semibold leading-tight mb-6"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {p.title}
                </div>
                <div className="text-[13px] font-semibold inline-flex items-center gap-1.5">
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
