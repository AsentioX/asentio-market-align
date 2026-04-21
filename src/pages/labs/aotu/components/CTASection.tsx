import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="bg-[#0A0A0A] text-[#F4FDFF] relative overflow-hidden border-b border-white/[0.06]">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, #FF5E1A 0%, transparent 50%), radial-gradient(circle at 80% 30%, #FF8C42 0%, transparent 50%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
        <h2
          className="text-[44px] md:text-[72px] font-semibold leading-[1] tracking-tight max-w-4xl mx-auto"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "-0.025em" }}
        >
          Stop watching.
          <br />
          <span className="text-[#FF5E1A]">Start operating.</span>
        </h2>
        <p className="mt-7 text-[16px] md:text-[18px] text-[#F4FDFF]/60 max-w-xl mx-auto leading-relaxed">
          Deploy AI operators across your sites in weeks, not years.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link
            to="/labs/aotu/contact"
            className="group inline-flex items-center gap-2 bg-[#FF5E1A] text-[#0A0A0A] px-7 py-3.5 rounded-md text-[14px] font-semibold hover:bg-[#FF8C42] transition-colors"
          >
            Request demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/labs/aotu/contact"
            className="inline-flex items-center gap-2 bg-[#161B22] border border-white/15 text-[#F4FDFF] px-7 py-3.5 rounded-md text-[14px] font-semibold hover:bg-[#1C232E] hover:border-[#FF5E1A]/40 transition-colors"
          >
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
