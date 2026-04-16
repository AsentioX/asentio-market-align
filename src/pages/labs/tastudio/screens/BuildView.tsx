import { useEffect, useRef, useState } from 'react';
import {
  Build,
  BuildTemplate,
  DriverProfile,
  TEMPLATE_PROMPTS,
  VEHICLE_MODELS,
  buildTotal,
  generateBuild,
} from '../mockData';
import { ArrowLeft, Bookmark, Loader2, Share2, Sparkles, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  build: Build;
  profile: DriverProfile | null;
  userPhoto: string | null;
  onUpdate: (b: Build) => void;
  onSave: (b: Build) => void;
  onBack: () => void;
  onGarage: () => void;
}

const BuildView = ({ build, userPhoto, onUpdate, onSave, onBack, onGarage }: Props) => {
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const lastRenderedKey = useRef<string | null>(null);

  const isCustom = build.modelId === 'custom' && !!userPhoto;
  const model = VEHICLE_MODELS.find((m) => m.id === build.modelId);
  const total = buildTotal(build);
  const heroImage = isCustom ? renderedImage ?? userPhoto! : build.image;

  // Auto-render the user's photo via AI whenever the template changes
  useEffect(() => {
    if (!isCustom || !userPhoto) return;
    const key = `${build.template}`;
    if (lastRenderedKey.current === key) return;
    lastRenderedKey.current = key;
    runAiRender(build.template);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustom, userPhoto, build.template]);

  const runAiRender = async (template: BuildTemplate) => {
    if (!userPhoto) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tastudio-render', {
        body: { imageDataUrl: userPhoto, prompt: TEMPLATE_PROMPTS[template] },
      });
      if (error) {
        if (error.message?.includes('429')) toast.error('Too many requests — try again in a moment.');
        else if (error.message?.includes('402')) toast.error('AI credits exhausted.');
        else toast.error('AI render failed. Showing your original photo.');
        return;
      }
      if (data?.image) {
        setRenderedImage(data.image);
        toast.success('AI render complete.');
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (e) {
      console.error(e);
      toast.error('AI render failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const refine = (template: BuildTemplate) => {
    if (isCustom) {
      // Generate a new build (parts/pricing) and trigger an AI re-render of the photo
      const next = generateBuild('custom', template, undefined, userPhoto!);
      onUpdate(next);
      lastRenderedKey.current = null; // force re-render
    } else {
      onUpdate(generateBuild(build.modelId, template));
      toast.success('Build refined.');
    }
  };

  const reduceCost = () => {
    onUpdate({
      ...build,
      parts: build.parts.map((p) => ({ ...p, price: Math.round(p.price * 0.7) })),
      name: `${build.name} — Essentials`,
    });
    toast.success('Cost reduced.');
  };

  const increasePerf = () => {
    onUpdate({
      ...build,
      parts: build.parts.map((p) =>
        p.category === 'Performance' ? { ...p, price: Math.round(p.price * 1.4), item: `${p.item} +` } : p,
      ),
    });
    toast.success('Performance increased.');
  };

  const heroLabel = isCustom ? 'YOUR PORSCHE · CUSTOM' : `${model?.name.toUpperCase()} · ${model?.series.toUpperCase()}`;

  return (
    <div className="min-h-screen px-8 md:px-16 py-10">
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs tracking-widest text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> START OVER
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
          <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
            <img
              src={heroImage}
              alt={build.name}
              className={`h-full w-full object-cover transition-opacity duration-500 ${aiLoading ? 'opacity-30' : 'opacity-100'}`}
            />
            {aiLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="text-xs tracking-[0.4em] text-white/80">RE-IMAGINING YOUR PORSCHE…</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
              <p className="text-xs tracking-[0.4em] text-white/60 mb-2">{heroLabel}</p>
              <h2 className="text-4xl md:text-5xl font-light">{build.name}</h2>
              <p className="text-white/70 mt-2 font-light italic">{build.tagline}</p>
            </div>
          </div>

          {isCustom && renderedImage && (
            <p className="mt-3 text-xs text-white/40 tracking-widest">
              AI-RENDERED FROM YOUR UPLOADED PHOTO
            </p>
          )}

          {/* Iteration controls */}
          <div className="mt-6">
            <p className="text-xs tracking-[0.4em] text-white/40 mb-3">REFINE</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <RefineBtn icon={<Zap className="w-4 h-4" />} label="More Aggressive" onClick={() => refine('aggressive')} disabled={aiLoading} />
              <RefineBtn icon={<Sparkles className="w-4 h-4" />} label="More Subtle" onClick={() => refine('refined')} disabled={aiLoading} />
              <RefineBtn icon={<TrendingDown className="w-4 h-4" />} label="Reduce Cost" onClick={reduceCost} disabled={aiLoading} />
              <RefineBtn icon={<TrendingUp className="w-4 h-4" />} label="More Performance" onClick={increasePerf} disabled={aiLoading} />
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
              onClick={() => onSave({ ...build, image: heroImage })}
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

const RefineBtn = ({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 border border-white/15 px-4 py-3 text-xs tracking-widest hover:border-white/40 hover:bg-white/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {icon}
    <span className="text-left flex-1">{label.toUpperCase()}</span>
  </button>
);

export default BuildView;
