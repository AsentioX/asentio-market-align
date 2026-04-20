import { useNavigate } from 'react-router-dom';
import { Plus, Layers } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { DeckTile } from '../components/DeckTile';

const Decks = () => {
  const { decks, cards } = useVibin();
  const nav = useNavigate();

  return (
    <div>
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(240_15%_10%)]">Decks</h1>
          <p className="text-xs text-[hsl(240_8%_55%)] mt-0.5">Curated trip blueprints</p>
        </div>
        <button
          onClick={() => nav('/labs/vibin/decks/new')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-sm font-semibold shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" /> New deck
        </button>
      </header>

      <div className="px-5 py-3 space-y-4">
        {decks.length === 0 ? (
          <div className="text-center py-16">
            <Layers className="w-10 h-10 mx-auto text-[hsl(240_15%_85%)]" />
            <p className="text-sm text-[hsl(240_8%_55%)] mt-3">No decks yet — bundle some cards.</p>
          </div>
        ) : (
          decks.map((d) => (
            <DeckTile key={d.id} deck={d} cards={cards} onClick={() => nav(`/labs/vibin/decks/${d.id}`)} />
          ))
        )}
      </div>
    </div>
  );
};

export default Decks;
