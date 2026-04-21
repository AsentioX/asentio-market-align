import { Boxes, Zap, Network } from "lucide-react";

const blocks = [
  {
    icon: Boxes,
    title: "AI Operators",
    desc: "Each VisionCapsule replaces a specific monitoring task.",
  },
  {
    icon: Zap,
    title: "Real-Time Edge AI",
    desc: "Detect events instantly across all cameras.",
  },
  {
    icon: Network,
    title: "Scalable Deployment",
    desc: "Run across sites without adding headcount.",
  },
];

const WhatYouGet = () => {
  return (
    <section className="bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00B8FF] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // What you get
          </div>
          <h2
            className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight text-[#0A0F1C]"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            What you get with AOTU.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[#E5E7EB] border border-[#E5E7EB] rounded-2xl overflow-hidden">
          {blocks.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="bg-white p-8 md:p-10">
                <div className="w-11 h-11 rounded-lg bg-[#00B8FF]/10 text-[#00B8FF] flex items-center justify-center mb-8">
                  <Icon className="w-5 h-5" />
                </div>
                <h3
                  className="text-[22px] md:text-[24px] font-semibold leading-tight text-[#0A0F1C] mb-3"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {b.title}
                </h3>
                <p className="text-[15px] text-[#0A0F1C]/65 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatYouGet;
