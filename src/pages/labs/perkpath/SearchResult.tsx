import { Sparkles, Layers, ArrowRight } from 'lucide-react';
import type { Perk } from '@/hooks/usePerkPath';

interface Match {
  best: Perk;
  stack: Perk[];
}

interface Props {
  query: string;
  result: Match | null;
  onPerkTap: (perk: Perk) => void;
  onClose: () => void;
}

const StackCard = ({ result, onPerkTap }: { result: Match; onPerkTap: (p: Perk) => void }) => {
  const { best, stack } = result;
  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 mb-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
        <Sparkles className="w-3 h-3" /> Best choice
      </div>
      <button onClick={() => onPerkTap(best)} className="w-full text-left active:scale-[0.99] transition-transform">
        <h3 className="text-lg font-extrabold mb-1 leading-tight">{best.title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: best.membership?.brand_color ?? '#10b981' }}>
            {best.membership?.name ?? 'Membership'}
          </span>
          <span className="text-xs font-bold text-emerald-300">{best.value_label}</span>
        </div>
      </button>

      {stack.length > 0 && (
        <div className="border-t border-white/10 pt-3 mt-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">
            <Layers className="w-3 h-3" /> Stack with
          </div>
          <div className="space-y-1.5">
            {stack.map(p => (
              <button
                key={p.id}
                onClick={() => onPerkTap(p)}
                className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{p.title}</p>
                  <p className="text-[10px] text-white/50 truncate">{p.membership?.name}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 whitespace-nowrap shrink-0">{p.value_label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchResult = ({ query, result, onPerkTap, onClose }: Props) => {
  if (!query) return null;

  if (!result) {
    return (
      <div className="px-5 pb-2">
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-center">
          <p className="text-sm font-semibold text-slate-700 mb-1">No perks for "{query}"</p>
          <p className="text-xs text-slate-500">Try a brand (Hertz, Hyatt) or category (hotels, dining, travel).</p>
          <button onClick={onClose} className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
            Clear search <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-2">
      <StackCard result={result} onPerkTap={onPerkTap} />
    </div>
  );
};

export default SearchResult;
