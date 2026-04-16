import { useState } from 'react';
import {
  Build,
  BuildTemplate,
  DriverProfile,
  VEHICLE_MODELS,
  buildTotal,
  generateBuild,
} from '../mockData';
import { ArrowLeft, Bookmark, Share2, Sparkles, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  build: Build;
  profile: DriverProfile | null;
  onUpdate: (b: Build) => void;
  onSave: (b: Build) => void;
  onBack: () => void;
  onGarage: () => void;
}

const BuildView = ({ build, onUpdate, onSave, onBack, onGarage }: Props) => {
  const [refining, setRefining] = useState(false);
  const model = VEHICLE_MODELS.find((m) => m.id === build.modelId)!;
  const total = buildTotal(build);

  const refine = (template: BuildTemplate) => {
    setRefining(true);
    setTimeout(() => {
      onUpdate(generateBuild(build.modelId, template));
      setRefining(false);
      toast.success('Build refined.');
    }, 600);
  };

  const reduceCost = () => {
    const reduced: Build = {
      ...build,
      parts: build.parts.map((p) => ({ ...p, price: Math.round(p.price * 0.7) })),
      name: `${build.name} — Essentials`,
    };
    onUpdate(reduced);
    toast.success('Cost reduced.');
  };

  const increasePerf = () => {
    const boosted: Build = {
      ...build,
      parts: build.parts.map((p) =>
        p.category === 'Performance' ? { ...p, price: Math.round(p.price * 1.4), item: `${p.item} +` } : p,
      ),
    };
    onUpdate(boosted);
    toast.success('Performance increased.');
  };

  return (
    <div className="min-h-screen px-8 md:px-16 py-10">
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs tracking-widest text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> CHANGE PLATFORM
        </button>
        <button
          onClick={onGarage}
          className="text-xs tracking-widest text-white/60 hover:text-white transition"
        >
          GARAGE
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Hero */}
        <div className="lg:col-span-7">
          <div className={`relative aspect-[16/10] overflow-hidden bg-white/5 transition-opacity ${refining ? 'opacity-30' : 'opacity-100'}`}>
            <img
              src={build.image}
              alt={build.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs tracking-[0.4em] text-white/60 mb-2">{model.name.toUpperCase()} · {model.series.toUpperCase()}</p>
              <h2 className="text-4xl md:text-5xl font-light">{build.name}</h2>
              <p className="text-white/70 mt-2 font-light italic">{build.tagline}</p>
            </div>
          </div>

          {/* Iteration controls */}
          <div className="mt-6">
            <p className="text-xs tracking-[0.4em] text-white/40 mb-3">REFINE</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <RefineBtn icon={<Zap className="w-4 h-4" />} label="More Aggressive" onClick={() => refine('aggressive')} />
              <RefineBtn icon={<Sparkles className="w-4 h-4" />} label="More Subtle" onClick={() => refine('refined')} />
              <RefineBtn icon={<TrendingDown className="w-4 h-4" />} label="Reduce Cost" onClick={reduceCost} />
              <RefineBtn icon={<TrendingUp className="w-4 h-4" />} label="More Performance" onClick={increasePerf} />
            </div>
          </div>
        </div>

        {/* Right: BOM */}
        <div className="lg:col-span-5">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="text-xs tracking-[0.4em] text-white/40 mb-2">ESTIMATED INVESTMENT</p>
            <div className="text-5xl font-light tracking-tight mb-1">${total.toLocaleString()}</div>
            <p className="text-xs text-white/40">Estimated pricing — excludes tax & install.</p>
          </div>

          <div className="mt-4 border border-white/10 bg-white/[0.02]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-xs tracking-[0.4em] text-white/40">BILL OF MATERIALS</p>
              <p className="text-xs text-white/40">{build.parts.length} ITEMS</p>
            </div>
            <div>
              {build.parts.map((p, i) => (
                <div
                  key={i}
                  className="px-6 py-5 flex items-start justify-between gap-4 border-b border-white/5 last:border-0"
                >
                  <div className="flex-1">
                    <div className="text-xs tracking-widest text-white/40 mb-1">{p.category.toUpperCase()}</div>
                    <div className="text-base font-light">{p.item}</div>
                  </div>
                  <div className="text-base font-light tabular-nums">${p.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              onClick={() => onSave(build)}
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-4 text-xs tracking-widest hover:bg-white/90 transition"
            >
              <Bookmark className="w-4 h-4" /> SAVE TO GARAGE
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://tastudio.app/build/${build.id}`);
                toast.success('Share link copied.');
              }}
              className="inline-flex items-center justify-center gap-2 border border-white/30 px-6 py-4 text-xs tracking-widest hover:bg-white/10 transition"
            >
              <Share2 className="w-4 h-4" /> SHARE
            </button>
          </div>
          <button
            onClick={() => toast.success('Request sent to TECHART specialist.')}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 border border-white/15 px-6 py-4 text-xs tracking-widest hover:bg-white/10 transition"
          >
            SEND TO TECHART SPECIALIST
          </button>
        </div>
      </div>
    </div>
  );
};

const RefineBtn = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 border border-white/15 px-4 py-3 text-xs tracking-widest hover:border-white/40 hover:bg-white/5 transition"
  >
    {icon}
    <span className="text-left flex-1">{label.toUpperCase()}</span>
  </button>
);

export default BuildView;
