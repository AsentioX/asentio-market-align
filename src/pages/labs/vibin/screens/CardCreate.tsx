import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, RefreshCw, X, Camera } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { categoryStyle, type Category } from '../vibinTheme';
import { toast } from 'sonner';

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=900&q=80',
];

// Mocked AI generation pools, by category
const AI_TITLES: Record<Category, string[]> = {
  food: ['Sunset Ramen Bar', 'The Corner Taquería', 'Blue Door Bakery', 'Morning Light Café', 'Little Tide Oyster Co.'],
  place: ['Quiet Overlook', 'Foggy Pier Walk', 'Hidden Garden Steps', 'North Cliff Lookout', 'Sun-soaked Plaza'],
  experience: ['Golden Hour Bike Loop', 'Twilight Kayak Drift', 'Saturday Print Workshop', 'Open Mic at the Loft', 'Tide-pool Wander'],
};

const AI_DESCRIPTIONS: Record<Category, string[]> = {
  food: [
    'Steamy bowls, low lighting, and a line worth standing in.',
    'A neighborhood gem where regulars get the off-menu treatment.',
    'Crisp edges, soft middles, and a playlist you’ll want to Shazam.',
  ],
  place: [
    'Quiet enough to think, scenic enough to remember.',
    'A landmark moment — bring your camera and stay for the light.',
    'Wind, wide views, and the kind of silence that resets you.',
  ],
  experience: [
    'Something you do, not just something you see.',
    'The kind of stop that becomes the story you tell.',
    'Hands-on, a little messy, completely worth it.',
  ],
};

const AI_TAGS: Record<Category, string[]> = {
  food: ['cozy', 'late-night', 'cheap-eats', 'date-night', 'foodie', 'hidden-gem'],
  place: ['scenic', 'photo-spot', 'meditative', 'iconic', 'sunset', 'quiet'],
  experience: ['active', 'cultural', 'group-friendly', 'romantic', 'kid-friendly', 'unique'],
};

const SF_LOCATIONS = ['Mission, SF', 'North Beach, SF', 'Outer Sunset, SF', 'Sausalito, CA', 'Berkeley, CA', 'Hayes Valley, SF'];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const sample = <T,>(arr: T[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

interface AIDraft {
  title: string;
  description: string;
  tags: string[];
  category: Category;
  image: string;
  locationName: string;
}

const generateDraft = (): AIDraft => {
  const category = pick(['food', 'place', 'experience'] as Category[]);
  return {
    category,
    title: pick(AI_TITLES[category]),
    description: pick(AI_DESCRIPTIONS[category]),
    tags: sample(AI_TAGS[category], 3),
    image: pick(STOCK_IMAGES),
    locationName: pick(SF_LOCATIONS),
  };
};

const CardCreate = () => {
  const nav = useNavigate();
  const { addCard } = useVibin();

  const [generating, setGenerating] = useState(true);
  const [draft, setDraft] = useState<AIDraft | null>(null);
  const generatedOnce = useRef(false);

  // Auto-generate immediately on mount (the "1st tap" was opening this screen)
  useEffect(() => {
    if (generatedOnce.current) return;
    generatedOnce.current = true;
    const t = setTimeout(() => {
      setDraft(generateDraft());
      setGenerating(false);
    }, 650);
    return () => clearTimeout(t);
  }, []);

  const regenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setDraft(generateDraft());
      setGenerating(false);
    }, 500);
  };

  const update = (patch: Partial<AIDraft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const toggleTag = (tag: string) => {
    if (!draft) return;
    update({
      tags: draft.tags.includes(tag) ? draft.tags.filter((t) => t !== tag) : [...draft.tags, tag],
    });
  };

  const save = () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error('Add a title first');
      return;
    }
    addCard({
      title: draft.title,
      image: draft.image,
      category: draft.category,
      description: draft.description,
      tags: draft.tags,
      durationMin: 60,
      bestTime: 'anytime',
      cost: '$$',
      locationName: draft.locationName || 'Somewhere new',
      lat: 37.77 + Math.random() * 0.1,
      lng: -122.42 + Math.random() * 0.1,
      authorName: 'You',
    });
    toast.success('Card saved ✨');
    nav('/labs/vibin/cards');
  };

  // Suggested tags excluding ones already on the card
  const suggestedTags = draft
    ? AI_TAGS[draft.category].filter((t) => !draft.tags.includes(t)).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-[hsl(20_30%_98%)]">
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={() => nav(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
        </button>
        <h1 className="font-bold text-[hsl(240_15%_10%)]">New card</h1>
        <button
          onClick={save}
          disabled={generating || !draft}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-sm font-semibold shadow-md active:scale-95 disabled:opacity-50"
        >
          Save
        </button>
      </header>

      {generating || !draft ? (
        <div className="px-5 py-10 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] flex items-center justify-center shadow-xl animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm font-semibold text-[hsl(240_15%_25%)]">AI is drafting your card…</p>
          <p className="text-xs text-[hsl(240_8%_55%)]">Title, description, and tags — ready in a sec</p>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-5 pb-12">
          {/* AI banner + regenerate */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[hsl(345_95%_60%)]/10 to-[hsl(280_90%_55%)]/10 border border-[hsl(280_90%_55%)]/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[hsl(280_90%_55%)]" />
              <p className="text-xs font-semibold text-[hsl(240_15%_25%)]">
                Drafted with AI — review and save
              </p>
            </div>
            <button
              onClick={regenerate}
              className="px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-[hsl(280_90%_55%)] flex items-center gap-1 shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3 h-3" /> Redraft
            </button>
          </div>

          {/* Photo */}
          <div>
            <div className="relative h-56 rounded-3xl overflow-hidden bg-[hsl(240_15%_92%)]">
              <img src={draft.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <button
                onClick={() => update({ image: pick(STOCK_IMAGES.filter((i) => i !== draft.image)) })}
                className="absolute bottom-3 right-3 px-3 py-2 rounded-full bg-white/95 backdrop-blur text-xs font-semibold flex items-center gap-1 shadow-lg active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" /> Change
              </button>
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${categoryStyle[draft.category].gradient}`}>
                {categoryStyle[draft.category].emoji} {categoryStyle[draft.category].label}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Title</p>
            <input
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="What is this?"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-base font-semibold outline-none focus:border-[hsl(345_95%_60%)] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Description</p>
            <textarea
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="What's the vibe?"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-sm outline-none focus:border-[hsl(345_95%_60%)] resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {draft.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-[hsl(280_90%_55%)]/10 text-[hsl(280_90%_45%)] text-xs font-semibold flex items-center gap-1"
                >
                  #{t}
                  <button onClick={() => toggleTag(t)} aria-label={`Remove ${t}`}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className="px-3 py-1 rounded-full bg-white border border-dashed border-[hsl(240_15%_85%)] text-xs text-[hsl(240_8%_55%)] active:scale-95"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Big save CTA — the "2nd tap" */}
          <button
            onClick={save}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-base font-bold shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Save card
          </button>
        </div>
      )}
    </div>
  );
};

export default CardCreate;
