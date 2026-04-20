import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { CardTile } from '../components/CardTile';
import { toast } from 'sonner';

const ShareView = () => {
  const { type, id } = useParams<{ type: 'card' | 'deck'; id: string }>();
  const nav = useNavigate();
  const { cards, decks, addDeck, addCard } = useVibin();

  if (type === 'card') {
    const card = cards.find((c) => c.id === id);
    if (!card) return <NotFound />;
    return (
      <div>
        <Header />
        <div className="px-5">
          <p className="text-center text-xs text-[hsl(240_8%_55%)] mb-3">Shared card from {card.authorName ?? 'a friend'}</p>
          <CardTile card={card} variant="feed" onClick={() => nav(`/labs/vibin/cards/${card.id}`)} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => { toast.success('Card saved'); nav('/labs/vibin/cards'); }}
              className="py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] font-bold text-sm text-[hsl(240_15%_15%)] flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => { addCard({ ...card, id: undefined as any, createdAt: undefined as any, authorName: 'You (remixed)' } as any); toast.success('Remixed into your library'); nav('/labs/vibin/cards'); }}
              className="py-3 rounded-2xl bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> Remix
            </button>
          </div>
        </div>
      </div>
    );
  }

  const deck = decks.find((d) => d.id === id);
  if (!deck) return <NotFound />;
  const deckCards = deck.cardIds.map((cid) => cards.find((c) => c.id === cid)).filter(Boolean) as typeof cards;

  return (
    <div>
      <Header />
      <div className="px-5">
        <p className="text-center text-xs text-[hsl(240_8%_55%)] mb-3">Shared deck from {deck.authorName ?? 'a friend'}</p>
        <div className="relative h-44 rounded-3xl overflow-hidden mb-3">
          {deck.coverImage && <img src={deck.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(345_95%_60%)]/60 to-transparent" />
          <div className="relative h-full p-4 flex flex-col justify-end text-white">
            <h1 className="text-2xl font-bold">{deck.title}</h1>
            <p className="text-sm text-white/90">{deck.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => { toast.success('Deck saved'); nav('/labs/vibin/decks'); }}
            className="py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] font-bold text-sm text-[hsl(240_15%_15%)] flex items-center justify-center gap-1.5"
          >
            <Heart className="w-4 h-4" /> Save
          </button>
          <button
            onClick={() => { addDeck({ ...deck, id: undefined as any, createdAt: undefined as any, title: deck.title + ' (remix)', authorName: 'You' } as any); toast.success('Remixed into your decks'); nav('/labs/vibin/decks'); }}
            className="py-3 rounded-2xl bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Sparkles className="w-4 h-4" /> Remix
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pb-4">
          {deckCards.map((c) => (
            <CardTile key={c.id} card={c} variant="grid" />
          ))}
        </div>
      </div>
    </div>
  );

  function Header() {
    return (
      <header className="px-5 pt-12 pb-3 flex items-center justify-between">
        <button onClick={() => nav('/labs/vibin')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
        </button>
        <p className="text-xs font-bold text-[hsl(345_95%_60%)] uppercase tracking-wider">Shared with you</p>
        <div className="w-10" />
      </header>
    );
  }
};

const NotFound = () => (
  <div className="p-8 text-center pt-20">
    <p className="text-[hsl(240_8%_55%)]">This share link is no longer available.</p>
  </div>
);

export default ShareView;
