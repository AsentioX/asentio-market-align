import { Shield, HardHat, Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const solutions = [
  {
    icon: Shield,
    name: "Security",
    desc: "Detect intrusions instantly.",
  },
  {
    icon: HardHat,
    name: "Safety",
    desc: "Enforce compliance automatically.",
  },
  {
    icon: Activity,
    name: "Operations",
    desc: "Monitor processes in real time.",
  },
];

const SolutionPackages = () => {
  return (
    <section className="bg-[#F4F5F7] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00B8FF] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // Solutions
          </div>
          <h2
            className="text-[36px] md:text-[52px] font-semibold tracking-tight leading-[1.05] text-[#0A0F1C]"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            Built for real-world operations.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="group bg-white rounded-2xl p-8 border border-[#E5E7EB] hover:border-[#0A0F1C]/40 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(10,15,28,0.12)] flex flex-col"
              >
                <div className="w-12 h-12 rounded-lg bg-[#00B8FF]/10 text-[#00B8FF] flex items-center justify-center mb-8">
                  <Icon className="w-5 h-5" />
                </div>
                <h3
                  className="text-[24px] font-semibold leading-tight mb-3 text-[#0A0F1C]"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {s.name}
                </h3>
                <p className="text-[15px] text-[#0A0F1C]/65 leading-relaxed mb-8">
                  {s.desc}
                </p>
                <Link
                  to="/labs/aotu/solutions"
                  className="mt-auto text-[13px] font-semibold inline-flex items-center gap-1.5 text-[#0A0F1C] group-hover:text-[#00B8FF] transition-colors"
                >
                  Learn more
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionPackages;
