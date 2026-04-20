import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mic, MapPin, Sparkles, X } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { categoryStyle, type Category } from '../vibinTheme';
import { toast } from 'sonner';
import type { CostLevel, BestTime } from '../types';

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=900&q=80',
];

const SUGGESTED_TAGS = ['scenic', 'foodie', 'meditative', 'iconic', 'photo-spot', 'cheap-eats', 'romantic', 'kid-friendly', 'cultural', 'active'];

const aiDescriptions: Record<Category, string[]> = {
  food: ['A neighborhood gem with crave-worthy plates and warm vibes.', 'Local-favorite spot where the food does the talking.'],
  place: ['A landmark moment — bring your camera and stay for the light.', 'Quiet enough to think, scenic enough to remember.'],
  experience: ['Something you do, not just something you see.', 'The kind of stop that becomes the story you tell.'],
};

const CardCreate = () => {
  const nav = useNavigate();
  const { addCard } = useVibin();

  const [step, setStep] = useState<'capture' | 'edit'>('capture');
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(STOCK_IMAGES[0]);
  const [category, setCategory] = useState<Category>('place');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [durationMin, setDurationMin] = useState(60);
  const [bestTime, setBestTime] = useState<BestTime>('anytime');
  const [cost, setCost] = useState<CostLevel>('$$');
  const [locationName, setLocationName] = useState('');
  const [tip, setTip] = useState('');

  const aiFillDescription = () => {
    const opts = aiDescriptions[category];
    setDescription(opts[Math.floor(Math.random() * opts.length)]);
    toast.success('AI drafted a description ✨');
  };

  const aiSuggestTags = () => {
    const picks = [...SUGGESTED_TAGS].sort(() => Math.random() - 0.5).slice(0, 3);
    setTags((t) => Array.from(new Set([...t, ...picks])));
    toast.success('Tags suggested');
  };

  const mockGPS = () => {
    const places = ['Mission, SF', 'North Beach, SF', 'Outer Sunset, SF', 'Sausalito, CA', 'Berkeley, CA'];
    setLocationName(places[Math.floor(Math.random() * places.length)]);
    toast.success('Location pinned');
  };

  const mockVoice = () => {
    setNote('Loved the light here — felt completely off-grid for an hour.');
    toast.success('Voice note transcribed');
  };

  const save = () => {
    if (!title.trim()) { toast.error('Add a title first'); return; }
    addCard({
      title, image, category,
      description: description || aiDescriptions[category][0],
      note: note || undefined,
      tags,
      durationMin,
      bestTime,
      cost,
      locationName: locationName || 'Somewhere new',
      lat: 37.77 + Math.random() * 0.1,
      lng: -122.42 + Math.random() * 0.1,
      tip: tip || undefined,
      authorName: 'You',
    });
    toast.success('Card saved to your collection');
    nav('/labs/vibin/cards');
  };

  return (
    <div>
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md flex items-center justify-between">
        <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
        </button>
        <h1 className="font-bold text-[hsl(240_15%_10%)]">{step === 'capture' ? 'Quick capture' : 'Edit card'}</h1>
        <button
          onClick={save}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-sm font-semibold shadow-md active:scale-95"
        >
          Save
        </button>
      </header>

      <div className="px-5 py-4 space-y-5">
        {/* Image picker */}
        <div>
          <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Photo</p>
          <div className="relative h-56 rounded-3xl overflow-hidden bg-[hsl(240_15%_92%)]">
            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <button className="absolute bottom-3 right-3 px-3 py-2 rounded-full bg-white/95 backdrop-blur text-xs font-semibold flex items-center gap-1 shadow-lg">
              <Camera className="w-3.5 h-3.5" /> Change
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1.5 mt-2">
            {STOCK_IMAGES.map((img) => (
              <button
                key={img}
                onClick={() => setImage(img)}
                className={`aspect-square rounded-lg overflow-hidden ${image === img ? 'ring-2 ring-[hsl(345_95%_60%)] ring-offset-1' : ''}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Title</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is this place called?"
            className="w-full px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-base font-medium outline-none focus:border-[hsl(345_95%_60%)] transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Category</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(categoryStyle) as Category[]).map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`py-3 rounded-2xl text-sm font-semibold transition-all ${
                    active
                      ? `${categoryStyle[c].gradient} text-white shadow-lg`
                      : 'bg-white border border-[hsl(240_15%_92%)] text-[hsl(240_15%_25%)]'
                  }`}
                >
                  <span className="block text-lg">{categoryStyle[c].emoji}</span>
                  {categoryStyle[c].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Location</p>
          <div className="flex gap-2">
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Neighborhood or address"
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-sm outline-none focus:border-[hsl(345_95%_60%)]"
            />
            <button
              onClick={mockGPS}
              className="px-4 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-[hsl(240_15%_25%)]"
              aria-label="Use current location"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider">Description</p>
            <button onClick={aiFillDescription} className="text-xs font-semibold text-[hsl(280_90%_55%)] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI draft
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the vibe?"
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-sm outline-none focus:border-[hsl(345_95%_60%)] resize-none"
          />
        </div>

        {/* Personal note */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider">Personal note</p>
            <button onClick={mockVoice} className="text-xs font-semibold text-[hsl(280_90%_55%)] flex items-center gap-1">
              <Mic className="w-3 h-3" /> Voice
            </button>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why does this matter to you?"
            rows={2}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-sm outline-none focus:border-[hsl(345_95%_60%)] resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider">Tags</p>
            <button onClick={aiSuggestTags} className="text-xs font-semibold text-[hsl(280_90%_55%)] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Suggest
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-[hsl(280_90%_55%)]/10 text-[hsl(280_90%_45%)] text-xs font-semibold flex items-center gap-1">
                #{t}
                <button onClick={() => setTags((tt) => tt.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 6).map((t) => (
              <button
                key={t}
                onClick={() => setTags((tt) => [...tt, t])}
                className="px-3 py-1 rounded-full bg-white border border-dashed border-[hsl(240_15%_85%)] text-xs text-[hsl(240_8%_55%)]"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-1">Duration</p>
            <select value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[hsl(240_15%_92%)] text-sm font-medium outline-none">
              {[30, 45, 60, 90, 120, 180].map((m) => <option key={m} value={m}>{m}m</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-1">Cost</p>
            <select value={cost} onChange={(e) => setCost(e.target.value as CostLevel)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[hsl(240_15%_92%)] text-sm font-medium outline-none">
              <option value="$">$</option><option value="$$">$$</option><option value="$$$">$$$</option>
            </select>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-1">Best time</p>
            <select value={bestTime} onChange={(e) => setBestTime(e.target.value as BestTime)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[hsl(240_15%_92%)] text-sm font-medium outline-none">
              <option value="morning">Morning</option><option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option><option value="anytime">Anytime</option>
            </select>
          </div>
        </div>

        {/* Tip */}
        <div>
          <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Tip (optional)</p>
          <input
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            placeholder="Parking, reservations, secret menu…"
            className="w-full px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-sm outline-none focus:border-[hsl(345_95%_60%)]"
          />
        </div>
      </div>
    </div>
  );
};

export default CardCreate;
