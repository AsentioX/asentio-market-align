import { Cpu, Boxes, Briefcase, ArrowDown } from "lucide-react";

const layers = [
  {
    n: "03",
    label: "Solutions",
    title: "Industry use cases",
    desc: "Bundles of VisionCapsules tailored to a specific operator role — Security, Safety, Operations.",
    icon: Briefcase,
    accent: "#C9F24A",
    examples: ["AI Security Operator", "AI Safety Operator", "AI Operations Operator"],
  },
  {
    n: "02",
    label: "VisionCapsules",
    title: "Modular AI applications",
    desc: "Each capsule is an AI operator that performs one specific task across any camera stream.",
    icon: Boxes,
    accent: "#1E40FF",
    examples: ["Intrusion Detection", "PPE Compliance", "Loitering", "Anomaly Detection"],
  },
  {
    n: "01",
    label: "BrainFrame",
    title: "Edge-native AI runtime",
    desc: "Orchestrates multiple video streams, runs VisionCapsules, scales inference at the edge.",
    icon: Cpu,
    accent: "#0A0F1C",
    examples: ["Real-time inference", "Multi-stream", "Auto-scaling", "Intel + Dell ready"],
  },
];

const ProductStack = () => {
  return (
    <section className="bg-[#0A0F1C] text-white relative overflow-hidden">
      {/* Grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl mb-16">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9F24A] mb-4"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // The product stack
          </div>
          <h2
            className="text-[40px] md:text-[56px] leading-[1.02] font-semibold tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            One platform.
            <br />
            <span className="text-white/55">Modular operators.</span>
            <br />
            Vertical solutions.
          </h2>
          <p className="mt-6 text-[16px] text-white/60 max-w-xl leading-relaxed">
            BrainFrame runs VisionCapsules. VisionCapsules power Solutions.
            Three layers, designed to plug into the cameras and infrastructure
            you already have.
          </p>
        </div>

        {/* Layer stack */}
        <div className="grid gap-3">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <div key={layer.label} className="relative">
                <div
                  className="group rounded-2xl p-7 md:p-8 bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all"
                  style={{
                    marginLeft: `${i * 24}px`,
                    marginRight: `${(layers.length - 1 - i) * 0}px`,
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                    <div className="flex items-start gap-4 md:w-72 shrink-0">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${layer.accent}1A`, color: layer.accent }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div
                          className="text-[10.5px] uppercase tracking-[0.2em] text-white/40 mb-1"
                          style={{ fontFamily: '"JetBrains Mono", monospace' }}
                        >
                          Layer {layer.n}
                        </div>
                        <div
                          className="text-[24px] font-semibold leading-tight"
                          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                          {layer.label}
                        </div>
                        <div className="text-[14px] text-white/60 mt-0.5">
                          {layer.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15.5px] text-white/75 leading-relaxed max-w-xl mb-5">
                        {layer.desc}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {layer.examples.map((ex) => (
                          <span
                            key={ex}
                            className="text-[12px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {i < layers.length - 1 && (
                  <div
                    className="flex justify-center my-1"
                    style={{ marginLeft: `${i * 24 + 30}px` }}
                  >
                    <ArrowDown className="w-4 h-4 text-white/25" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Caption */}
        <div className="mt-12 inline-flex items-center gap-3 text-[13px] text-white/55 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.03]">
          <span
            className="text-[#C9F24A]"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            ↳
          </span>
          BrainFrame runs VisionCapsules → VisionCapsules power Solutions
        </div>
      </div>
    </section>
  );
};

export default ProductStack;
