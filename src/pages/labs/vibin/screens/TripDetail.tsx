import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon, List, Clock, MapPin, AlertCircle, Trash2 } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { categoryStyle } from '../vibinTheme';
import { toast } from 'sonner';

const formatTime = (start: string, addMin: number) => {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + addMin;
  const hh = Math.floor((total / 60) % 24);
  const mm = total % 60;
  const ampm = hh >= 12 ? 'pm' : 'am';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${mm.toString().padStart(2, '0')}${ampm}`;
};

const TripDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { trips, cards, updateTrip, deleteTrip } = useVibin();
  const trip = trips.find((t) => t.id === id);
  const [view, setView] = useState<'timeline' | 'map'>('timeline');

  if (!trip) {
    return (
      <div className="p-8 text-center">
        <p className="text-[hsl(240_8%_55%)]">Trip not found.</p>
        <button onClick={() => nav('/labs/vibin/trips')} className="mt-4 text-[hsl(345_95%_60%)] font-semibold">Back to trips</button>
      </div>
    );
  }

  const tripCards = trip.cardIds.map((cid) => cards.find((c) => c.id === cid)).filter(Boolean) as typeof cards;

  const runningLate = () => {
    if (tripCards.length < 2) return;
    // skip the card with the lowest "must-see" score (proxy: shortest duration & no liked flag)
    const skip = [...tripCards].sort((a, b) => a.durationMin - b.durationMin)[0];
    updateTrip(trip.id, { cardIds: trip.cardIds.filter((x) => x !== skip.id) });
    toast.success(`Suggested skipping ${skip.title} to stay on time`);
  };

  // Compute timeline times
  let cursor = 0;
  const TRAVEL = 15;

  return (
    <div>
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
          </button>
          <div className="flex bg-white rounded-full shadow-sm border border-[hsl(240_15%_92%)] p-0.5">
            <button onClick={() => setView('timeline')} className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${view === 'timeline' ? 'bg-[hsl(240_15%_10%)] text-white' : 'text-[hsl(240_15%_25%)]'}`}>
              <List className="w-3 h-3" /> Timeline
            </button>
            <button onClick={() => setView('map')} className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${view === 'map' ? 'bg-[hsl(240_15%_10%)] text-white' : 'text-[hsl(240_15%_25%)]'}`}>
              <MapIcon className="w-3 h-3" /> Map
            </button>
          </div>
          <button onClick={() => { if (confirm('Delete this trip?')) { deleteTrip(trip.id); nav('/labs/vibin/trips'); }}} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-[hsl(240_15%_25%)]" />
          </button>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[hsl(240_15%_10%)]">{trip.title}</h1>
          <p className="text-xs text-[hsl(240_8%_55%)] capitalize">{trip.duration} · {trip.vibe} · {trip.pace} pace · starts {trip.startTime}</p>
        </div>
      </header>

      <div className="px-5 py-3">
        <button
          onClick={runningLate}
          className="w-full mb-4 p-3 rounded-2xl bg-[hsl(45_95%_55%)]/15 border border-[hsl(45_95%_55%)]/40 text-[hsl(35_85%_35%)] text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <AlertCircle className="w-4 h-4" /> Running late — adjust trip
        </button>

        {view === 'timeline' ? (
          <div className="space-y-2">
            {tripCards.map((c, i) => {
              const cat = categoryStyle[c.category];
              const arrive = formatTime(trip.startTime, cursor);
              const leave = formatTime(trip.startTime, cursor + c.durationMin);
              const blockMin = c.durationMin;
              const travelLine = i < tripCards.length - 1 ? formatTime(trip.startTime, cursor + blockMin + TRAVEL) : null;
              cursor += blockMin + TRAVEL;
              return (
                <div key={c.id}>
                  <div className="flex gap-3">
                    <div className="w-14 pt-3 text-right">
                      <p className="text-xs font-bold text-[hsl(240_15%_25%)]">{arrive}</p>
                      <p className="text-[10px] text-[hsl(240_8%_55%)]">{leave}</p>
                    </div>
                    <button
                      onClick={() => nav(`/labs/vibin/cards/${c.id}`)}
                      className="flex-1 flex gap-3 p-3 rounded-2xl bg-white shadow-sm border border-[hsl(240_15%_92%)] active:scale-[0.99] transition-transform text-left"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={c.image} alt="" className="w-full h-full object-cover" />
                        <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full ${cat.gradient} text-white text-[10px] font-bold flex items-center justify-center shadow-md`}>{i + 1}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[hsl(240_15%_10%)] truncate">{c.title}</p>
                        <p className="text-xs text-[hsl(240_8%_55%)] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{c.locationName.split(',')[0]}</p>
                        <p className="text-xs text-[hsl(240_8%_55%)] flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{blockMin}m · {c.cost}</p>
                      </div>
                    </button>
                  </div>
                  {travelLine && (
                    <div className="flex gap-3 my-1 ml-14">
                      <div className="flex-1 px-3 py-1.5 text-[11px] text-[hsl(240_8%_55%)] flex items-center gap-2">
                        <div className="w-0.5 h-4 bg-[hsl(240_15%_85%)]" />
                        <span>~{TRAVEL} min travel · arrive next at {travelLine}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative h-[480px] rounded-3xl overflow-hidden border border-[hsl(240_15%_92%)]">
            {/* Mock map */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 30%, hsl(160_60%_75%) 0%, transparent 35%),
                                radial-gradient(circle at 75% 65%, hsl(190_70%_80%) 0%, transparent 45%),
                                radial-gradient(circle at 50% 80%, hsl(45_85%_85%) 0%, transparent 30%),
                                linear-gradient(135deg, hsl(190_50%_90%) 0%, hsl(170_45%_85%) 100%)`,
            }} />
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 480">
              {tripCards.length > 1 && (
                <path
                  d={tripCards.map((c, i) => {
                    // pseudo-positions based on index for visual route
                    const x = 60 + ((i * 73) % 280);
                    const y = 70 + ((i * 91) % 320);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="hsl(345 95% 60%)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
              )}
              {tripCards.map((c, i) => {
                const x = 60 + ((i * 73) % 280);
                const y = 70 + ((i * 91) % 320);
                return (
                  <g key={c.id}>
                    <circle cx={x} cy={y} r="18" fill="white" stroke="hsl(345 95% 60%)" strokeWidth="3" />
                    <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="hsl(240 15% 10%)">{i + 1}</text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/95 backdrop-blur shadow-xl">
              <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider">Route</p>
              <p className="text-sm font-bold text-[hsl(240_15%_10%)] mt-1">
                {tripCards.length} stops · ~{Math.round(tripCards.reduce((s, c) => s + c.durationMin, 0) / 60)}h + travel
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetail;
