import { hero } from '../mockData';
import { ArrowRight } from 'lucide-react';

interface Props {
  onStart: () => void;
  onBrowse: () => void;
}

const Landing = ({ onStart, onBrowse }: Props) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={hero}
        alt="TA Studio — Customized Porsche"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-8 py-6 md:px-16">
          <div className="text-sm tracking-[0.4em] text-white/80">TA · STUDIO</div>
          <button
            onClick={onBrowse}
            className="text-xs tracking-widest text-white/60 hover:text-white transition"
          >
            GARAGE
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-center px-8 md:px-16 max-w-5xl">
          <p className="text-xs tracking-[0.4em] text-white/60 mb-6">AI VEHICLE CUSTOMIZATION</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tight">
            Design Your Porsche.<br />
            <span className="text-white/60">Define Your Identity.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-white/70 font-light">
            A guided design journey that translates how you drive into a complete TECHART build —
            in under sixty seconds.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm tracking-widest hover:bg-white/90 transition"
            >
              START YOUR BUILD
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onBrowse}
              className="inline-flex items-center gap-3 border border-white/30 text-white px-8 py-4 text-sm tracking-widest hover:bg-white/10 transition"
            >
              BROWSE BUILDS
            </button>
          </div>
        </div>

        <footer className="px-8 md:px-16 py-8 flex items-center justify-between text-xs tracking-widest text-white/40">
          <span>EST. PROTOTYPE — ASENTIO LABS</span>
          <span>911 · CAYENNE · MACAN · TAYCAN · PANAMERA</span>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
