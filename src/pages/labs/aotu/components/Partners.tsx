const Partners = () => {
  return (
    <section className="bg-[#F4F5F7] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00B8FF] mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            // Partners
          </div>
          <h2
            className="text-[28px] md:text-[36px] font-semibold leading-[1.1] tracking-tight text-[#0A0F1C]"
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
          >
            Built on enterprise-grade infrastructure.
          </h2>
          <p className="mt-4 text-[15px] text-[#0A0F1C]/60 leading-relaxed">
            Optimized for real-time edge AI performance.
          </p>
        </div>

        <div className="grid grid-cols-2 max-w-2xl mx-auto gap-px bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
          {[
            { name: "intel" },
            { name: "DELL" },
          ].map((p) => (
            <div
              key={p.name}
              className="bg-white p-10 md:p-14 flex items-center justify-center"
            >
              <div
                className="text-[42px] md:text-[56px] font-bold tracking-tight text-[#0A0F1C]"
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
