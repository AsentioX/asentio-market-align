import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Clock, DollarSign, Sun, Lightbulb, Share2, Trash2 } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { categoryStyle } from '../vibinTheme';
import { toast } from 'sonner';

const CardDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { cards, toggleLike, deleteCard } = useVibin();
  const card = cards.find((c) => c.id === id);

  if (!card) {
    return (
      <div className="p-8 text-center">
        <p className="text-[hsl(240_8%_55%)]">Card not found.</p>
        <button onClick={() => nav('/labs/vibin/cards')} className="mt-4 text-[hsl(345_95%_60%)] font-semibold">Back to cards</button>
      </div>
    );
  }
  const cat = categoryStyle[card.category];

  return (
    <div>
      {/* Hero */}
      <div className="relative h-96">
        <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
        <div className="absolute top-12 left-4 right-4 flex items-center justify-between">
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md">
            <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/labs/vibin/share/card/${card.id}`); toast.success('Card link copied'); }}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md"
            >
              <Share2 className="w-5 h-5 text-[hsl(240_15%_15%)]" />
            </button>
            <button
              onClick={() => toggleLike(card.id)}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md"
            >
              <Heart className={`w-5 h-5 ${card.liked ? 'fill-[hsl(345_95%_60%)] text-[hsl(345_95%_60%)]' : 'text-[hsl(240_15%_15%)]'}`} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <span className={`${cat.gradient} inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg`}>
            {cat.emoji} {cat.label}
          </span>
          <h1 className="text-3xl font-bold mt-2 leading-tight">{card.title}</h1>
          <p className="text-sm text-white/90 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {card.locationName}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={Clock} label="Duration" value={`${card.durationMin}m`} />
          <Stat icon={DollarSign} label="Cost" value={card.cost} />
          <Stat icon={Sun} label="Best time" value={card.bestTime} />
        </div>

        <p className="text-[15px] text-[hsl(240_15%_20%)] leading-relaxed">{card.description}</p>

        {card.note && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[hsl(345_95%_60%)]/8 to-[hsl(280_90%_55%)]/8 border border-[hsl(345_95%_60%)]/20">
            <p className="text-xs font-semibold text-[hsl(280_90%_45%)] uppercase tracking-wider mb-1">Personal note</p>
            <p className="text-sm text-[hsl(240_15%_20%)] italic">"{card.note}"</p>
          </div>
        )}

        {card.tip && (
          <div className="p-4 rounded-2xl bg-white border border-[hsl(240_15%_92%)] flex gap-3">
            <Lightbulb className="w-5 h-5 text-[hsl(45_95%_55%)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[hsl(240_15%_25%)] uppercase tracking-wider mb-0.5">Tip</p>
              <p className="text-sm text-[hsl(240_15%_25%)]">{card.tip}</p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {card.tags.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-white border border-[hsl(240_15%_92%)] text-xs font-medium text-[hsl(240_15%_25%)]">#{t}</span>
            ))}
          </div>
        </div>

        {/* Mock map */}
        <div>
          <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Location</p>
          <div className="relative h-40 rounded-2xl overflow-hidden bg-[hsl(190_40%_85%)]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, hsl(160_60%_75%) 0%, transparent 40%),
                                radial-gradient(circle at 70% 60%, hsl(190_70%_80%) 0%, transparent 50%),
                                linear-gradient(135deg, hsl(190_50%_88%) 0%, hsl(170_45%_82%) 100%)`,
            }} />
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="2" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="2" />
              <line x1="0" y1="30%" x2="100%" y2="40%" stroke="white" strokeWidth="1" />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="w-8 h-8 rounded-full bg-[hsl(345_95%_60%)] border-4 border-white shadow-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="w-1 h-1 bg-[hsl(345_95%_60%)] mx-auto" />
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-white/90 text-[10px] font-mono text-[hsl(240_15%_25%)]">
              {card.lat.toFixed(3)}, {card.lng.toFixed(3)}
            </div>
          </div>
        </div>

        {card.authorName && (
          <p className="text-sm text-[hsl(240_8%_55%)] text-center pt-2">Curated by <span className="font-semibold text-[hsl(240_15%_25%)]">{card.authorName}</span></p>
        )}

        <button
          onClick={() => { if (confirm('Delete this card?')) { deleteCard(card.id); nav('/labs/vibin/cards'); }}}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-[hsl(345_75%_50%)] hover:bg-[hsl(345_95%_60%)]/8 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete card
        </button>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="p-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-center">
    <Icon className="w-4 h-4 mx-auto text-[hsl(240_8%_55%)]" />
    <p className="text-[10px] uppercase tracking-wider text-[hsl(240_8%_55%)] mt-1 font-semibold">{label}</p>
    <p className="text-sm font-bold text-[hsl(240_15%_15%)] capitalize mt-0.5">{value}</p>
  </div>
);

export default CardDetail;
