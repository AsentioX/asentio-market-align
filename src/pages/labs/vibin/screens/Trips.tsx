import { useNavigate } from 'react-router-dom';
import { Plus, Map as MapIcon, Sparkles } from 'lucide-react';
import { useVibin } from '../useVibinStore';

const Trips = () => {
  const { trips, cards } = useVibin();
  const nav = useNavigate();

  return (
    <div>
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(240_15%_10%)]">Trips</h1>
          <p className="text-xs text-[hsl(240_8%_55%)] mt-0.5">Your personalized plans</p>
        </div>
        <button
          onClick={() => nav('/labs/vibin/trips/new')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-sm font-semibold shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" /> New trip
        </button>
      </header>

      <div className="px-5 py-3 space-y-3">
        {trips.length === 0 ? (
          <button
            onClick={() => nav('/labs/vibin/trips/new')}
            className="w-full p-6 rounded-3xl bg-gradient-to-br from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-left active:scale-[0.99] transition-transform"
          >
            <Sparkles className="w-6 h-6 mb-2" />
            <p className="text-lg font-bold">Build your first trip</p>
            <p className="text-sm text-white/90 mt-1">Pick your time, vibe, and pace — we'll arrange the day.</p>
          </button>
        ) : (
          trips.map((t) => {
            const tripCards = t.cardIds.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as typeof cards;
            return (
              <button
                key={t.id}
                onClick={() => nav(`/labs/vibin/trips/${t.id}`)}
                className="w-full p-4 rounded-3xl bg-white shadow-sm border border-[hsl(240_15%_92%)] text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {tripCards.slice(0, 3).map((c) => (
                      <img key={c.id} src={c.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[hsl(240_15%_10%)] truncate">{t.title}</p>
                    <p className="text-xs text-[hsl(240_8%_55%)] capitalize mt-0.5">{t.duration} · {t.vibe} · {t.pace}</p>
                  </div>
                  <MapIcon className="w-5 h-5 text-[hsl(240_8%_55%)]" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Trips;
