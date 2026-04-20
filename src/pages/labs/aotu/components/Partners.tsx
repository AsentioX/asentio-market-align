const Partners = () => {
  return (
    <section className="bg-white border-y border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="grid md:grid-cols-[1fr_2fr] gap-10 items-center">
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1E40FF] mb-3"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              // Partners
            </div>
            <h2
              className="text-[28px] md:text-[34px] font-semibold leading-[1.1] tracking-tight"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.02em" }}
            >
              Built on enterprise-grade
              <br />
              edge infrastructure.
            </h2>
            <p className="mt-4 text-[14.5px] text-[#0A0F1C]/65 leading-relaxed max-w-md">
              AOTU runs natively on Intel and Dell edge platforms — validated,
              hardened, and ready for production scale.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
            {[
              { name: "intel", tag: "Silicon partner" },
              { name: "DELL", tag: "Edge hardware partner" },
            ].map((p) => (
              <div
                key={p.name}
                className="bg-white p-10 md:p-14 flex flex-col items-center justify-center"
              >
                <div
                  className="text-[42px] md:text-[56px] font-bold tracking-tight text-[#0A0F1C]"
                  style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.04em" }}
                >
                  {p.name}
                </div>
                <div
                  className="text-[10.5px] uppercase tracking-[0.2em] text-[#0A0F1C]/45 mt-2"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {p.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
