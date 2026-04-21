import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="bg-[#0A0F1C] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, #00B8FF 0%, transparent 50%), radial-gradient(circle at 80% 30%, #1E40FF 0%, transparent 50%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
        <h2
          className="text-[44px] md:text-[72px] font-semibold leading-[1] tracking-tight max-w-4xl mx-auto"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.025em" }}
        >
          Stop watching.
          <br />
          <span className="text-[#00B8FF]">Start operating.</span>
        </h2>
        <p className="mt-7 text-[16px] md:text-[18px] text-white/65 max-w-xl mx-auto leading-relaxed">
          Deploy AI operators across your sites in weeks, not years.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link
            to="/labs/aotu/contact"
            className="group inline-flex items-center gap-2 bg-[#00B8FF] text-[#0A0F1C] px-7 py-3.5 rounded-md text-[14px] font-semibold hover:bg-white transition-colors"
          >
            Request demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/labs/aotu/contact"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/15 text-white px-7 py-3.5 rounded-md text-[14px] font-semibold hover:bg-white/10 transition-colors"
          >
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
