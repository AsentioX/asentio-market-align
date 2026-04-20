import { Building2, Code2, Handshake, Newspaper, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const paths = [
  {
    icon: Building2,
    audience: "Customers",
    title: "Deploy AI operators",
    cta: "See solutions",
    to: "/labs/aotu/solutions",
  },
  {
    icon: Code2,
    audience: "Developers",
    title: "Build VisionCapsules",
    cta: "Open SDK",
    to: "/labs/aotu/developers",
  },
  {
    icon: Handshake,
    audience: "Partners",
    title: "Co-sell on AOTU",
    cta: "Become a partner",
    to: "/labs/aotu/partners",
  },
  {
    icon: Newspaper,
    audience: "Media",
    title: "Read the narrative",
    cta: "Press kit",
    to: "/labs/aotu/resources",
  },
];

const AudiencePathways = () => {
  return (
    <section className="bg-[#F4F5F7]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <h2
            className="text-[28px] md:text-[36px] font-semibold leading-[1.1] tracking-tight max-w-xl"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            Pick your path into the platform.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {paths.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.audience}
                to={p.to}
                className="group bg-white rounded-xl p-6 border border-[#E5E7EB] hover:border-[#0A0F1C]/40 hover:bg-[#0A0F1C] hover:text-white transition-all"
              >
                <Icon className="w-5 h-5 text-[#1E40FF] group-hover:text-[#C9F24A] mb-8 transition-colors" />
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] text-[#0A0F1C]/50 group-hover:text-white/50 mb-1.5"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {p.audience}
                </div>
                <div
                  className="text-[18px] font-semibold leading-tight mb-6"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {p.title}
                </div>
                <div className="text-[13px] font-semibold inline-flex items-center gap-1.5">
                  {p.cta}
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
