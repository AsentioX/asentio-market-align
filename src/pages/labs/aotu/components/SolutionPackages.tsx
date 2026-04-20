import { Shield, HardHat, Activity, ArrowUpRight } from "lucide-react";

const solutions = [
  {
    icon: Shield,
    name: "AI Security Operator",
    problem:
      "Security teams can't watch every camera. Threats go undetected for hours.",
    capsules: ["Intrusion Detection", "Perimeter Monitoring", "Loitering Detection"],
    roi: "Reduce response time 84%",
    color: "#1E40FF",
  },
  {
    icon: HardHat,
    name: "AI Safety Operator",
    problem:
      "PPE violations and hazards are spotted only after incidents occur.",
    capsules: ["PPE Detection", "Hazard Detection", "Compliance Monitoring"],
    roi: "Cut safety incidents 62%",
    color: "#0A0F1C",
  },
  {
    icon: Activity,
    name: "AI Operations Operator",
    problem:
      "Process anomalies and inefficiencies go unnoticed across shifts.",
    capsules: ["Process Monitoring", "Anomaly Detection", "Throughput Analytics"],
    roi: "Lift line efficiency 18%",
    color: "#C9F24A",
  },
];

const SolutionPackages = () => {
  return (
    <section className="bg-[#F4F5F7] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div className="max-w-2xl">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1E40FF] mb-3"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              // Solution packages
            </div>
            <h2
              className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.05]"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
            >
              Pre-built operators
              <br />
              for the work that matters.
            </h2>
          </div>
          <a
            href="#"
            className="text-[14px] font-semibold text-[#0A0F1C] inline-flex items-center gap-1.5 hover:text-[#1E40FF]"
          >
            All solutions
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="group bg-white rounded-2xl p-7 border border-[#E5E7EB] hover:border-[#0A0F1C]/40 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(10,15,28,0.15)] flex flex-col"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-6"
                  style={{ background: `${s.color}15`, color: s.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3
                  className="text-[22px] font-semibold leading-tight mb-3"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {s.name}
                </h3>
                <p className="text-[14px] text-[#0A0F1C]/65 leading-relaxed mb-6">
                  {s.problem}
                </p>

                <div className="mb-5">
                  <div
                    className="text-[10.5px] uppercase tracking-widest text-[#0A0F1C]/40 mb-2"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    Key capsules
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.capsules.map((c) => (
                      <span
                        key={c}
                        className="text-[12px] px-2 py-0.5 rounded-md bg-[#F4F5F7] border border-[#E5E7EB] text-[#0A0F1C]/75"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-5 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <div
                      className="text-[10.5px] uppercase tracking-widest text-[#0A0F1C]/40"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      ROI
                    </div>
                    <div className="text-[14px] font-semibold text-[#0A0F1C]">
                      {s.roi}
                    </div>
                  </div>
                  <button className="text-[13px] font-semibold inline-flex items-center gap-1 text-[#0A0F1C] group-hover:text-[#1E40FF] transition-colors">
                    Explore
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionPackages;
