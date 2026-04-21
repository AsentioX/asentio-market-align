const cols = [
  {
    title: "Platform",
    links: ["BrainFrame", "Edge runtime", "Architecture", "Security"],
  },
  {
    title: "Products",
    links: ["VisionCapsules", "Marketplace", "Solution Packages", "Pricing"],
  },
  {
    title: "Developers",
    links: ["SDK", "Docs", "API reference", "Sample capsules"],
  },
  {
    title: "Company",
    links: ["About", "Partners", "Press", "Careers", "Contact"],
  },
];

const AOTUFooter = () => {
  return (
    <footer className="bg-[#0A0A0A] text-[#F4FDFF] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-[#161B22] border border-white/10 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#FF5E1A] rounded-sm" />
              </div>
              <span
                className="text-[17px] font-semibold tracking-tight"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                aotu<span className="text-[#FF5E1A]">.ai</span>
              </span>
            </div>
            <p className="text-[13px] text-[#F4FDFF]/50 leading-relaxed">
              AI operators for real-world automation. Built on the edge.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-[12px] font-semibold uppercase tracking-widest text-[#F4FDFF]/40 mb-4">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[14px] text-[#F4FDFF]/70 hover:text-[#FF5E1A] transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-[12px] text-[#F4FDFF]/40">
            © 2026 AOTU.ai · All rights reserved
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#F4FDFF]/40 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E1A] animate-pulse" />
            Edge AI · Built with Intel & Dell
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AOTUFooter;
