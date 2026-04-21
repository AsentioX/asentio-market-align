import { ArrowRight, ArrowUpRight, ShieldAlert, HardHat, UserX, Car, Boxes, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const capsules = [
  { icon: ShieldAlert, name: "Intrusion Detection", desc: "Spot unauthorized access in real time." },
  { icon: HardHat, name: "PPE Detection", desc: "Verify hardhats, vests, and gear." },
  { icon: UserX, name: "Loitering Detection", desc: "Flag dwell time in restricted zones." },
  { icon: Car, name: "Vehicle Detection", desc: "Track vehicles entering and exiting." },
  { icon: Boxes, name: "Object Counting", desc: "Quantify throughput and inventory." },
  { icon: Flame, name: "Smoke & Fire", desc: "Detect early signs of combustion." },
];

const MarketplaceTeaser = () => {
  return (
    <section className="bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div className="max-w-2xl">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00B8FF] mb-3"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              // Marketplace
            </div>
            <h2
              className="text-[36px] md:text-[52px] font-semibold tracking-tight leading-[1.05] text-[#0A0F1C]"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
            >
              Explore AI operators.
            </h2>
          </div>
          <Link
            to="/labs/aotu/marketplace"
            className="text-[14px] font-semibold text-[#0A0F1C] inline-flex items-center gap-1.5 hover:text-[#00B8FF] transition-colors"
          >
            View all
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capsules.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.name}
                to="/labs/aotu/marketplace"
                className="group bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#00B8FF]/50 hover:-translate-y-0.5 transition-all flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-lg bg-[#00B8FF]/10 text-[#00B8FF] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[16px] font-semibold text-[#0A0F1C] mb-1"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {c.name}
                  </div>
                  <div className="text-[13.5px] text-[#0A0F1C]/60 leading-relaxed mb-3">
                    {c.desc}
                  </div>
                  <div className="text-[12.5px] font-semibold inline-flex items-center gap-1 text-[#0A0F1C] group-hover:text-[#00B8FF] transition-colors">
                    View
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MarketplaceTeaser;
