import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import type { Duration, Vibe, Pace } from '../types';
import { toast } from 'sonner';

const TripCreate = () => {
  const nav = useNavigate();
  const { cards, addTrip } = useVibin();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [duration, setDuration] = useState<Duration>('half-day');
  const [vibe, setVibe] = useState<Vibe>('scenic');
  const [pace, setPace] = useState<Pace>('balanced');
  const [selected, setSelected] = useState<string[]>([]);

  const suggested = useMemo(() => {
    const tagMap: Record<Vibe, string[]> = {
      foodie: ['foodie', 'lunch', 'breakfast', 'cheap-eats'],
      scenic: ['scenic', 'photo-spot', 'iconic', 'sunset'],
      chill: ['meditative', 'coastal', 'scenic'],
      cultural: ['historic', 'iconic', 'cultural'],
      active: ['active', 'scenic'],
    };
    const wanted = tagMap[vibe];
    return [...cards].sort((a, b) => {
      const sA = a.tags.filter((t) => wanted.includes(t)).length;
      const sB = b.tags.filter((t) => wanted.includes(t)).length;
      return sB - sA;
    });
  }, [cards, vibe]);

  const stops = pace === 'relaxed' ? 3 : pace === 'balanced' ? 5 : 7;

  const aiSelect = () => {
    setSelected(suggested.slice(0, stops).map((c) => c.id));
    toast.success('Route optimized ✨');
  };

  const build = () => {
    if (selected.length === 0) { toast.error('Select at least one stop'); return; }
    const trip = addTrip({
      title: `${vibe.charAt(0).toUpperCase() + vibe.slice(1)} ${duration === 'multi-day' ? 'getaway' : 'day'}`,
      duration, vibe, pace, cardIds: selected, startTime: '10:00',
    });
    toast.success('Your trip is ready');
    nav(`/labs/vibin/trips/${trip.id}`);
  };

  return (
    <div>
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md flex items-center justify-between">
        <button onClick={() => step === 1 ? nav(-1) : setStep((s) => (s - 1) as 1 | 2 | 3)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
        </button>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1.5 rounded-full transition-all ${step >= n ? 'w-8 bg-[hsl(345_95%_60%)]' : 'w-4 bg-[hsl(240_15%_85%)]'}`} />
          ))}
        </div>
        <div className="w-10" />
      </header>

      <div className="px-5 py-4">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[hsl(240_15%_10%)]">How much time?</h2>
              <p className="text-sm text-[hsl(240_8%_55%)] mt-1">We'll size the day around it.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { d: '3hrs' as Duration, label: '3 hours', sub: 'Quick local loop' },
                { d: 'half-day' as Duration, label: 'Half day', sub: 'Morning or afternoon' },
                { d: 'full-day' as Duration, label: 'Full day', sub: 'Sunup to sundown' },
                { d: 'multi-day' as Duration, label: 'Multi-day', sub: 'Stretch it out' },
              ]).map(({ d, label, sub }) => {
                const active = duration === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`p-5 rounded-3xl text-left transition-all ${
                      active
                        ? 'bg-gradient-to-br from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white shadow-xl scale-[1.02]'
                        : 'bg-white border border-[hsl(240_15%_92%)] text-[hsl(240_15%_15%)]'
                    }`}
                  >
                    <p className="font-bold text-lg">{label}</p>
                    <p className={`text-xs mt-1 ${active ? 'text-white/90' : 'text-[hsl(240_8%_55%)]'}`}>{sub}</p>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-full bg-[hsl(240_15%_10%)] text-white font-semibold flex items-center justify-center gap-2 active:scale-95">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[hsl(240_15%_10%)]">What's the vibe?</h2>
              <p className="text-sm text-[hsl(240_8%_55%)] mt-1">Pick your energy and pace.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Vibe</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: 'foodie' as Vibe, emoji: '🍜' },
                  { v: 'scenic' as Vibe, emoji: '🌄' },
                  { v: 'chill' as Vibe, emoji: '🧘' },
                  { v: 'cultural' as Vibe, emoji: '🏛️' },
                  { v: 'active' as Vibe, emoji: '🥾' },
                ]).map(({ v, emoji }) => {
                  const active = vibe === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setVibe(v)}
                      className={`p-4 rounded-2xl text-left capitalize font-semibold transition-all ${
                        active ? 'bg-[hsl(240_15%_10%)] text-white shadow-lg' : 'bg-white border border-[hsl(240_15%_92%)] text-[hsl(240_15%_25%)]'
                      }`}
                    >
                      <span className="text-xl mr-2">{emoji}</span>{v}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Pace</p>
              <div className="grid grid-cols-3 gap-2">
                {(['relaxed', 'balanced', 'packed'] as Pace[]).map((p) => {
                  const active = pace === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPace(p)}
                      className={`py-3 rounded-2xl text-sm font-semibold capitalize ${
                        active ? 'bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white shadow-lg' : 'bg-white border border-[hsl(240_15%_92%)] text-[hsl(240_15%_25%)]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={() => setStep(3)} className="w-full py-3.5 rounded-full bg-[hsl(240_15%_10%)] text-white font-semibold flex items-center justify-center gap-2 active:scale-95">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[hsl(240_15%_10%)]">Pick your stops</h2>
                <p className="text-sm text-[hsl(240_8%_55%)] mt-1">~{stops} for a {pace} {duration}</p>
              </div>
              <button onClick={aiSelect} className="px-3 py-2 rounded-full bg-[hsl(280_90%_55%)]/10 text-[hsl(280_90%_45%)] text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI pick
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-4">
              {suggested.map((c) => {
                const sel = selected.includes(c.id);
                const order = selected.indexOf(c.id) + 1;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected((s) => s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id])}
                    className={`relative h-32 rounded-2xl overflow-hidden text-left transition-all ${sel ? 'ring-2 ring-[hsl(345_95%_60%)]' : ''}`}
                  >
                    <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className={`absolute inset-0 ${sel ? 'bg-gradient-to-t from-[hsl(345_95%_60%)]/60 to-transparent' : 'bg-gradient-to-t from-black/80 to-transparent'}`} />
                    <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold">{c.title}</p>
                    {sel ? (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-[hsl(345_95%_60%)] text-xs font-bold flex items-center justify-center shadow-lg">{order}</div>
                    ) : (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-white/80" />
                    )}
                  </button>
                );
              })}
            </div>
            <button onClick={build} className="w-full py-3.5 rounded-full bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white font-bold flex items-center justify-center gap-2 active:scale-95 shadow-lg">
              <Check className="w-4 h-4" /> Build my trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripCreate;
