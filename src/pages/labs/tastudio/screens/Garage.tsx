import { ArrowLeft, Plus } from 'lucide-react';
import { Build, VEHICLE_MODELS, buildTotal } from '../mockData';

interface Props {
  builds: Build[];
  onOpen: (b: Build) => void;
  onNew: () => void;
  onHome: () => void;
}

const Garage = ({ builds, onOpen, onNew, onHome }: Props) => {
  return (
    <div className="min-h-screen px-8 md:px-16 py-10">
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={onHome}
          className="flex items-center gap-2 text-xs tracking-widest text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> HOME
        </button>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs tracking-widest hover:bg-white/90 transition"
        >
          <Plus className="w-4 h-4" /> NEW BUILD
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.4em] text-white/40 mb-2">YOUR GARAGE</p>
        <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-12">
          Saved Builds
        </h1>

        {builds.length === 0 ? (
          <div className="border border-dashed border-white/15 p-16 text-center">
            <p className="text-white/50 font-light mb-6">Your garage is empty.</p>
            <button
              onClick={onNew}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs tracking-widest hover:bg-white/90 transition"
            >
              <Plus className="w-4 h-4" /> START YOUR FIRST BUILD
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((b) => {
              const model = VEHICLE_MODELS.find((m) => m.id === b.modelId);
              return (
                <button
                  key={b.id}
                  onClick={() => onOpen(b)}
                  className="group text-left bg-white/[0.02] border border-white/10 hover:border-white/40 transition-all overflow-hidden"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={b.image}
                      alt={b.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xs tracking-widest text-white/40 mb-1">
                      {model?.name.toUpperCase()}
                    </div>
                    <div className="text-xl font-light mb-3">{b.name}</div>
                    <div className="text-base font-light tabular-nums">
                      ${buildTotal(b).toLocaleString()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Garage;
