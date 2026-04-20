import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Sparkles } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { CardTile } from '../components/CardTile';
import { categoryStyle, type Category } from '../vibinTheme';

const Cards = () => {
  const { cards, toggleLike } = useVibin();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (cat !== 'all' && c.category !== cat) return false;
      if (q.trim()) {
        const hay = (c.title + ' ' + c.description + ' ' + c.tags.join(' ') + ' ' + c.locationName).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cards, q, cat]);

  return (
    <div>
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-[hsl(240_15%_10%)]">Cards</h1>
          <button
            onClick={() => nav('/labs/vibin/cards/new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-sm font-semibold shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-sm border border-[hsl(240_15%_92%)]">
          <Search className="w-4 h-4 text-[hsl(240_8%_55%)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search places, tags, vibes…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
          {(['all', 'food', 'place', 'experience'] as const).map((c) => {
            const active = cat === c;
            const label = c === 'all' ? 'All' : categoryStyle[c].label;
            const emoji = c === 'all' ? '✨' : categoryStyle[c].emoji;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[hsl(240_15%_10%)] text-white'
                    : 'bg-white text-[hsl(240_15%_25%)] border border-[hsl(240_15%_92%)]'
                }`}
              >
                {emoji} {label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-5 pt-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-10 h-10 mx-auto text-[hsl(240_15%_85%)]" />
            <p className="text-sm text-[hsl(240_8%_55%)] mt-3">No cards match. Try another vibe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((c) => (
              <CardTile
                key={c.id}
                card={c}
                variant="grid"
                onClick={() => nav(`/labs/vibin/cards/${c.id}`)}
                onLike={() => toggleLike(c.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cards;
