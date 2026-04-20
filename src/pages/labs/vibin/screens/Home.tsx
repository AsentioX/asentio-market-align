import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, TrendingUp, Bell } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { CardTile } from '../components/CardTile';
import { DeckTile } from '../components/DeckTile';

const Home = () => {
  const { cards, decks, profile, toggleLike } = useVibin();
  const nav = useNavigate();
  const trending = [...cards].sort((a, b) => (b.liked ? 1 : 0) - (a.liked ? 1 : 0)).slice(0, 5);
  const featuredDeck = decks[0];
  const recent = cards.slice(0, 6);

  return (
    <div className="pb-4">
      {/* Header */}
      <header className="sticky top-0 z-30 px-5 pt-12 pb-4 bg-gradient-to-b from-[hsl(20_30%_98%)] via-[hsl(20_30%_98%)] to-[hsl(20_30%_98%)]/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-[hsl(345_95%_60%)] uppercase tracking-wider">Vibin</p>
            <h1 className="text-2xl font-bold text-[hsl(240_15%_10%)] leading-tight">
              Hey {profile.name.split(' ')[0]} ✨
            </h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <Bell className="w-5 h-5 text-[hsl(240_15%_25%)]" />
          </button>
        </div>
        <button
          onClick={() => nav('/labs/vibin/cards')}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-full bg-white shadow-sm border border-[hsl(240_15%_92%)] text-[hsl(240_8%_55%)] text-sm"
        >
          <Search className="w-4 h-4" />
          <span>Search places, decks, vibes…</span>
        </button>
      </header>

      {/* Hero featured deck */}
      {featuredDeck && (
        <section className="px-5 mt-2">
          <button
            onClick={() => nav(`/labs/vibin/decks/${featuredDeck.id}`)}
            className="relative w-full h-56 rounded-3xl overflow-hidden text-left active:scale-[0.99] transition-transform"
          >
            {featuredDeck.coverImage && (
              <img src={featuredDeck.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(345_95%_60%)]/70 via-[hsl(280_90%_55%)]/50 to-transparent" />
            <div className="relative h-full p-5 flex flex-col justify-between text-white">
              <span className="self-start px-2.5 py-1 rounded-full bg-white/25 backdrop-blur text-[11px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> FEATURED DECK
              </span>
              <div>
                <h2 className="text-2xl font-bold leading-tight">{featuredDeck.title}</h2>
                <p className="text-sm text-white/90 mt-1 line-clamp-2">{featuredDeck.description}</p>
              </div>
            </div>
          </button>
        </section>
      )}

      {/* Trending vibes chip row */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h3 className="text-lg font-bold text-[hsl(240_15%_10%)] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[hsl(345_95%_60%)]" /> Trending now
          </h3>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-hide">
          {trending.map((c) => (
            <div key={c.id} className="flex-shrink-0 w-64 snap-start">
              <CardTile card={c} variant="grid" onClick={() => nav(`/labs/vibin/cards/${c.id}`)} onLike={() => toggleLike(c.id)} />
            </div>
          ))}
        </div>
      </section>

      {/* Decks scroll */}
      <section className="mt-6 px-5">
        <h3 className="text-lg font-bold text-[hsl(240_15%_10%)] mb-3">Curated decks</h3>
        <div className="space-y-4">
          {decks.slice(0, 2).map((d) => (
            <DeckTile key={d.id} deck={d} cards={cards} onClick={() => nav(`/labs/vibin/decks/${d.id}`)} />
          ))}
        </div>
      </section>

      {/* Recent cards grid */}
      <section className="mt-6 px-5">
        <h3 className="text-lg font-bold text-[hsl(240_15%_10%)] mb-3">Fresh adds</h3>
        <div className="grid grid-cols-2 gap-3">
          {recent.map((c) => (
            <CardTile key={c.id} card={c} variant="grid" onClick={() => nav(`/labs/vibin/cards/${c.id}`)} onLike={() => toggleLike(c.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
