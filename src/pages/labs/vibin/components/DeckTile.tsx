import type { Deck, VibinCard } from '../types';
import { Layers } from 'lucide-react';

interface Props {
  deck: Deck;
  cards: VibinCard[];
  onClick?: () => void;
}

const durationLabel: Record<Deck['duration'], string> = {
  '3hrs': '3 hrs',
  'half-day': 'Half day',
  'full-day': 'Full day',
  'multi-day': 'Multi-day',
};

export const DeckTile = ({ deck, cards, onClick }: Props) => {
  const previews = deck.cardIds.slice(0, 3).map((id) => cards.find((c) => c.id === id)).filter(Boolean) as VibinCard[];
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-3xl overflow-hidden bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform"
    >
      <div className="relative h-40 bg-[hsl(240_15%_92%)] flex">
        {previews.length > 0 ? (
          previews.map((c, i) => (
            <img
              key={c.id}
              src={c.image}
              alt=""
              loading="lazy"
              className={`flex-1 h-full object-cover ${i > 0 ? 'border-l-2 border-white' : ''}`}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-[hsl(240_8%_55%)]">
            <Layers className="w-10 h-10" />
          </div>
        )}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white text-[11px] font-semibold">
          {deck.cardIds.length} stops · {durationLabel[deck.duration]}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[hsl(240_15%_10%)] text-lg leading-tight">{deck.title}</h3>
        <p className="text-sm text-[hsl(240_8%_55%)] mt-1 line-clamp-2">{deck.description}</p>
        {deck.authorName && (
          <p className="text-xs text-[hsl(240_8%_55%)] mt-2 font-medium">by {deck.authorName}</p>
        )}
      </div>
    </button>
  );
};
