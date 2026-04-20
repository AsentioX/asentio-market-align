import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ClipboardList, Sparkles, X, Check, Pencil } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { categoryStyle } from '../vibinTheme';
import { toast } from 'sonner';

type Source = 'google' | 'paste' | 'fresh' | null;

const draftPool = [
  { title: 'Bi-Rite Creamery', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80', category: 'food' as const, locationName: 'Mission, SF' },
  { title: 'Dolores Park', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80', category: 'place' as const, locationName: 'Mission, SF' },
  { title: 'Alcatraz Tour', image: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=900&q=80', category: 'experience' as const, locationName: 'Alcatraz Island' },
  { title: 'Swan Oyster Depot', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=80', category: 'food' as const, locationName: 'Polk St, SF' },
  { title: 'Presidio Tunnel Tops', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', category: 'place' as const, locationName: 'Presidio, SF' },
];

const Onboarding = () => {
  const nav = useNavigate();
  const { addCard } = useVibin();
  const [source, setSource] = useState<Source>(null);
  const [drafts, setDrafts] = useState(draftPool);
  const [idx, setIdx] = useState(0);

  const start = (s: Source) => {
    if (s === 'fresh') { nav('/labs/vibin'); return; }
    setSource(s);
    setDrafts(draftPool);
    setIdx(0);
  };

  const current = drafts[idx];

  const keep = () => {
    if (!current) return;
    addCard({
      ...current,
      description: 'Added from your import.',
      tags: ['imported'],
      durationMin: 60,
      bestTime: 'anytime',
      cost: '$$',
      lat: 37.77, lng: -122.42,
      authorName: 'You',
    });
    next();
  };
  const skip = () => next();
  const next = () => {
    if (idx + 1 >= drafts.length) {
      toast.success('All caught up — welcome to Vibin');
      nav('/labs/vibin');
    } else {
      setIdx(idx + 1);
    }
  };

  if (!source) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 px-5 pt-16">
          <button onClick={() => nav('/labs/vibin')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center mb-8">
            <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
          </button>
          <p className="text-xs font-bold text-[hsl(345_95%_60%)] uppercase tracking-wider">Welcome</p>
          <h1 className="text-3xl font-bold text-[hsl(240_15%_10%)] mt-1 leading-tight">Bring in places<br />you already love</h1>
          <p className="text-[hsl(240_8%_55%)] mt-3">We'll turn your saves into rich, swipeable cards. Keep the gems, lose the rest.</p>

          <div className="space-y-3 mt-8">
            <Choice icon={MapPin} title="Import from Google Maps" sub="Pull in your saved places" onClick={() => start('google')} accent />
            <Choice icon={ClipboardList} title="Paste a list" sub="One place per line" onClick={() => start('paste')} />
            <Choice icon={Sparkles} title="Start fresh" sub="Build your collection from scratch" onClick={() => start('fresh')} />
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;
  const cat = categoryStyle[current.category];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 pt-12 pb-3 flex items-center justify-between">
        <button onClick={() => nav('/labs/vibin')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <X className="w-5 h-5 text-[hsl(240_15%_15%)]" />
        </button>
        <p className="text-sm font-semibold text-[hsl(240_15%_25%)]">{idx + 1} / {drafts.length}</p>
        <div className="w-10" />
      </header>

      <div className="flex-1 px-5 flex flex-col">
        <p className="text-xs text-[hsl(240_8%_55%)] text-center mb-3">Swipe right to keep · left to skip</p>

        <div className="relative flex-1 max-h-[520px] rounded-3xl overflow-hidden shadow-2xl">
          <img src={current.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={`${cat.gradient} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg`}>
              {cat.emoji} {cat.label}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h2 className="text-2xl font-bold leading-tight">{current.title}</h2>
            <p className="text-sm text-white/90 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {current.locationName}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 my-6">
          <button onClick={skip} className="w-16 h-16 rounded-full bg-white shadow-lg border border-[hsl(240_15%_92%)] flex items-center justify-center active:scale-90 transition-transform">
            <X className="w-7 h-7 text-[hsl(345_75%_50%)]" strokeWidth={2.5} />
          </button>
          <button onClick={() => toast('Tap edit later from Cards')} className="w-12 h-12 rounded-full bg-white shadow-lg border border-[hsl(240_15%_92%)] flex items-center justify-center active:scale-90 transition-transform">
            <Pencil className="w-5 h-5 text-[hsl(240_15%_25%)]" />
          </button>
          <button onClick={keep} className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] shadow-lg flex items-center justify-center active:scale-90 transition-transform">
            <Check className="w-7 h-7 text-white" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Choice = ({ icon: Icon, title, sub, onClick, accent }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-2xl active:scale-[0.99] transition-transform text-left ${
      accent
        ? 'bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white shadow-lg'
        : 'bg-white border border-[hsl(240_15%_92%)] text-[hsl(240_15%_10%)]'
    }`}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent ? 'bg-white/20' : 'bg-[hsl(240_15%_96%)]'}`}>
      <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-[hsl(240_15%_25%)]'}`} />
    </div>
    <div className="flex-1">
      <p className="font-bold">{title}</p>
      <p className={`text-xs mt-0.5 ${accent ? 'text-white/85' : 'text-[hsl(240_8%_55%)]'}`}>{sub}</p>
    </div>
  </button>
);

export default Onboarding;
