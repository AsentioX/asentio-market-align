const Partners = () => {
  return (
    <section className="bg-[#0A0A0A] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF5E1A] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // Partners
          </div>
          <h2
            className="text-[28px] md:text-[36px] font-semibold leading-[1.1] tracking-tight text-[#F4FDFF]"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            Built on enterprise-grade infrastructure.
          </h2>
          <p className="mt-4 text-[15px] text-[#F4FDFF]/55 leading-relaxed">
            Optimized for real-time edge AI performance.
          </p>
        </div>

        <div className="grid grid-cols-2 max-w-2xl mx-auto gap-px bg-white/[0.06] border border-white/[0.08] rounded-xl overflow-hidden">
          {[
            { name: "intel" },
            { name: "DELL" },
          ].map((p) => (
            <div
              key={p.name}
              className="bg-[#161B22] p-10 md:p-14 flex items-center justify-center"
            >
              <div
                className="text-[42px] md:text-[56px] font-bold tracking-tight text-[#F4FDFF]/90"
                style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.04em" }}
              >
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
