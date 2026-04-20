import { Play, Camera, Bell, Layers } from "lucide-react";

const clips = [
  {
    icon: Camera,
    title: "AI detects events in real time",
    detail: "Intrusion · 0.18s latency",
    cameras: 12,
  },
  {
    icon: Bell,
    title: "Operators escalate instantly",
    detail: "PPE violation · auto-routed",
    cameras: 4,
  },
  {
    icon: Layers,
    title: "One brain, every camera",
    detail: "184 streams · single node",
    cameras: 184,
  },
];

const SeeItInAction = () => {
  return (
    <section className="bg-[#0A0F1C] text-white">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9F24A] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // See it in action
          </div>
          <h2
            className="text-[36px] md:text-[48px] font-semibold leading-[1.05] tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            Watch operators
            <br />
            do the watching.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {clips.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-[#C9F24A]/40 transition-all cursor-pointer"
              >
                {/* Faux video grid */}
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(201,242,74,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(201,242,74,0.15) 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                  {/* Detection box */}
                  <div className="absolute top-1/3 left-1/4 w-1/3 h-1/4 border-2 border-[#C9F24A] rounded-sm">
                    <div className="absolute -top-5 left-0 text-[10px] font-semibold text-[#C9F24A] bg-[#0A0F1C] px-1.5 py-0.5 rounded-sm">
                      0.92
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 right-1/4 w-1/4 h-1/5 border-2 border-[#1E40FF] rounded-sm" />
                </div>

                {/* Top meta */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9F24A] animate-pulse" />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest text-white"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      Live
                    </span>
                  </div>
                  <div
                    className="text-[10px] text-white/60 px-2 py-1 rounded-full bg-black/40"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    {c.cameras} cams
                  </div>
                </div>

                {/* Play */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-[#C9F24A] group-hover:border-[#C9F24A] transition-all">
                    <Play className="w-5 h-5 text-white group-hover:text-[#0A0F1C] fill-current ml-0.5" />
                  </div>
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/70 to-transparent">
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-[#C9F24A] mt-0.5 shrink-0" />
                    <div>
                      <div
                        className="text-[15px] font-semibold leading-tight"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      >
                        {c.title}
                      </div>
                      <div
                        className="text-[11px] text-white/55 mt-1 uppercase tracking-widest"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        {c.detail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SeeItInAction;
