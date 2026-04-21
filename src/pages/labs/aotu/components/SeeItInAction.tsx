import { Play, ShieldAlert, HardHat, Activity } from "lucide-react";

const clips = [
  {
    icon: ShieldAlert,
    title: "Intrusion detected",
    detail: "Perimeter · 0.18s",
  },
  {
    icon: HardHat,
    title: "PPE violation detected",
    detail: "Zone B · auto-routed",
  },
  {
    icon: Activity,
    title: "Anomaly detected",
    detail: "Line 4 · flagged",
  },
];

const SeeItInAction = () => {
  return (
    <section className="bg-[#0A0A0A] text-[#F4FDFF] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // Live
          </div>
          <h2
            className="text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            See AI operators in action.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {clips.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#161B22] border border-white/10 hover:border-[#FF5E1A]/50 transition-all cursor-pointer"
              >
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,94,26,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,94,26,0.18) 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                  <div className="absolute top-1/3 left-1/4 w-1/3 h-1/4 border-2 border-[#FF5E1A] rounded-sm">
                    <div className="absolute -top-5 left-0 text-[10px] font-semibold text-[#0A0A0A] bg-[#FF5E1A] px-1.5 py-0.5 rounded-sm">
                      0.92
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E1A] animate-pulse" />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest text-[#F4FDFF]"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      Live
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-[#FF5E1A] group-hover:border-[#FF5E1A] transition-all">
                    <Play className="w-5 h-5 text-[#F4FDFF] group-hover:text-[#0A0A0A] fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent">
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-[#FF5E1A] mt-0.5 shrink-0" />
                    <div>
                      <div
                        className="text-[16px] font-semibold leading-tight text-[#F4FDFF]"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      >
                        {c.title}
                      </div>
                      <div
                        className="text-[11px] text-[#F4FDFF]/55 mt-1 uppercase tracking-widest"
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
