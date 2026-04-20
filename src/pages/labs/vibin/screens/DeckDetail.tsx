import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Sparkles, MapPin, Clock, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { categoryStyle } from '../vibinTheme';
import { toast } from 'sonner';

const DeckDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { decks, cards, updateDeck, deleteDeck, addTrip } = useVibin();
  const deck = decks.find((d) => d.id === id);
  const [editMode, setEditMode] = useState(false);

  if (!deck) {
    return (
      <div className="p-8 text-center">
        <p className="text-[hsl(240_8%_55%)]">Deck not found.</p>
        <button onClick={() => nav('/labs/vibin/decks')} className="mt-4 text-[hsl(345_95%_60%)] font-semibold">Back to decks</button>
      </div>
    );
  }

  const deckCards = deck.cardIds.map((cid) => cards.find((c) => c.id === cid)).filter(Boolean) as typeof cards;
  const totalMin = deckCards.reduce((s, c) => s + c.durationMin, 0);

  const move = (idx: number, dir: -1 | 1) => {
    const ids = [...deck.cardIds];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
    updateDeck(deck.id, { cardIds: ids });
  };
  const remove = (cid: string) => updateDeck(deck.id, { cardIds: deck.cardIds.filter((x) => x !== cid) });

  const addable = cards.filter((c) => !deck.cardIds.includes(c.id));

  const startTrip = () => {
    const t = addTrip({
      title: `Trip from ${deck.title}`,
      duration: deck.duration,
      vibe: 'scenic',
      pace: 'balanced',
      cardIds: deck.cardIds,
      startTime: '10:00',
    });
    nav(`/labs/vibin/trips/${t.id}`);
  };

  const share = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/labs/vibin/share/deck/${deck.id}`);
    toast.success('Deck link copied — paste anywhere');
  };

  return (
    <div>
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md flex items-center justify-between">
        <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
        </button>
        <button onClick={share} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <Share2 className="w-5 h-5 text-[hsl(240_15%_15%)]" />
        </button>
      </header>

      <div className="px-5">
        <div className="relative h-44 rounded-3xl overflow-hidden mb-4">
          {deck.coverImage && <img src={deck.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(345_95%_60%)]/60 via-[hsl(280_90%_55%)]/40 to-transparent" />
          <div className="relative h-full p-4 flex flex-col justify-end text-white">
            <h1 className="text-2xl font-bold leading-tight">{deck.title}</h1>
            <p className="text-sm text-white/90 mt-1">{deck.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-[hsl(240_15%_25%)] mb-4">
          <span className="px-2.5 py-1 rounded-full bg-white border border-[hsl(240_15%_92%)] flex items-center gap-1">
            <Clock className="w-3 h-3" /> ~{Math.round(totalMin / 60)}h total
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white border border-[hsl(240_15%_92%)]">{deckCards.length} stops</span>
          {deck.authorName && <span className="text-[hsl(240_8%_55%)]">by {deck.authorName}</span>}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={startTrip}
            className="py-3 rounded-2xl bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-sm font-bold shadow-lg active:scale-95"
          >
            <Sparkles className="w-4 h-4 inline mr-1" /> Build my trip
          </button>
          <button
            onClick={() => setEditMode((e) => !e)}
            className="py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-sm font-bold text-[hsl(240_15%_15%)]"
          >
            {editMode ? 'Done editing' : 'Edit deck'}
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-3 pb-4">
          {deckCards.map((c, i) => {
            const cat = categoryStyle[c.category];
            return (
              <div key={c.id} className="relative flex gap-3">
                {/* Timeline rail */}
                <div className="flex flex-col items-center pt-3 w-8">
                  <div className={`w-7 h-7 rounded-full ${cat.gradient} text-white text-xs font-bold flex items-center justify-center shadow-md`}>
                    {i + 1}
                  </div>
                  {i < deckCards.length - 1 && <div className="flex-1 w-0.5 bg-gradient-to-b from-[hsl(240_15%_85%)] to-[hsl(240_15%_92%)] mt-1" />}
                </div>

                <button
                  onClick={() => !editMode && nav(`/labs/vibin/cards/${c.id}`)}
                  className="flex-1 flex gap-3 p-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] active:scale-[0.99] transition-transform text-left"
                >
                  <img src={c.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[hsl(240_15%_10%)] truncate">{c.title}</p>
                    <p className="text-xs text-[hsl(240_8%_55%)] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{c.locationName.split(',')[0]} · {c.durationMin}m · {c.cost}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {c.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(240_15%_96%)] text-[hsl(240_8%_45%)]">#{t}</span>
                      ))}
                    </div>
                  </div>
                  {editMode && (
                    <div className="flex flex-col gap-1 items-center justify-center">
                      <button onClick={(e) => { e.stopPropagation(); move(i, -1); }} className="w-7 h-7 rounded-lg bg-[hsl(240_15%_96%)] flex items-center justify-center"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); move(i, 1); }} className="w-7 h-7 rounded-lg bg-[hsl(240_15%_96%)] flex items-center justify-center"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} className="w-7 h-7 rounded-lg bg-[hsl(345_95%_60%)]/10 text-[hsl(345_75%_50%)] flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {editMode && addable.length > 0 && (
          <div className="pb-6">
            <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Add cards</p>
            <div className="grid grid-cols-2 gap-2">
              {addable.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateDeck(deck.id, { cardIds: [...deck.cardIds, c.id] })}
                  className="relative h-24 rounded-2xl overflow-hidden text-left active:scale-95 transition-transform"
                >
                  <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold truncate">{c.title}</p>
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/95 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {editMode && (
          <button
            onClick={() => { if (confirm('Delete this deck?')) { deleteDeck(deck.id); nav('/labs/vibin/decks'); }}}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-[hsl(345_75%_50%)] mb-4"
          >
            <Trash2 className="w-4 h-4" /> Delete deck
          </button>
        )}
      </div>
    </div>
  );
};

export default DeckDetail;
