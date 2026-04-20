import { Heart, Clock, MapPin } from 'lucide-react';
import { categoryStyle } from '../vibinTheme';
import type { VibinCard } from '../types';

interface Props {
  card: VibinCard;
  onClick?: () => void;
  onLike?: () => void;
  variant?: 'feed' | 'grid' | 'small';
}

export const CardTile = ({ card, onClick, onLike, variant = 'feed' }: Props) => {
  const cat = categoryStyle[card.category];
  const heightClass =
    variant === 'feed' ? 'h-80' : variant === 'grid' ? 'h-56' : 'h-32';

  return (
    <button
      onClick={onClick}
      className={`group relative w-full ${heightClass} rounded-3xl overflow-hidden text-left bg-[hsl(240_15%_96%)] active:scale-[0.98] transition-transform`}
    >
      <img
        src={card.image}
        alt={card.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top row */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
        <span className={`${cat.gradient} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1`}>
          <span>{cat.emoji}</span>{cat.label}
        </span>
        {onLike && (
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md active:scale-90 transition-transform"
            aria-label="Like"
          >
            <Heart className={`w-4 h-4 ${card.liked ? 'fill-[hsl(345_95%_60%)] text-[hsl(345_95%_60%)]' : 'text-[hsl(240_15%_25%)]'}`} />
          </button>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className={`font-bold leading-tight ${variant === 'small' ? 'text-base' : 'text-xl'}`}>{card.title}</h3>
        {variant !== 'small' && (
          <p className="text-sm text-white/85 mt-1 line-clamp-1">{card.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-white/90 font-medium">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{card.durationMin}m</span>
          <span>{card.cost}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{card.locationName.split(',')[0]}</span>
        </div>
      </div>
    </button>
  );
};
