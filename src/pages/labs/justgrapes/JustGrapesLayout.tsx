import { useEffect, useMemo, useState } from 'react';
import {
  Home, Compass, ScanLine, BookHeart, User, Sparkles, Send, ArrowRight, ArrowLeft,
  Heart, MapPin, Wine, UtensilsCrossed, Gift, Calendar, TrendingUp, Camera,
  Check, ChevronRight, MessageCircle, Star,
} from 'lucide-react';

/* =========================================================
   Savor — The AI Wine Companion (Justgrapes Labs prototype)
   Mobile-first, single-file, internal tab state
   ========================================================= */

const FONT_LINK_ID = 'savor-fonts';
const ensureFonts = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const l = document.createElement('link');
  l.id = FONT_LINK_ID;
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(l);
};

// Wine-inspired palette (hex used locally to keep prototype isolated)
const C = {
  cream: '#F7F1E8',
  creamSoft: '#FBF6EE',
  ink: '#2A1417',
  inkSoft: '#5C3A3F',
  mute: '#8B6B6F',
  line: '#E8DCC9',
  burgundy: '#6B1F2A',
  burgundyDeep: '#4A1219',
  plum: '#8B3A52',
  gold: '#B89150',
  goldSoft: '#D9B97A',
  blush: '#E8C4B8',
  leaf: '#5C6B4A',
};

const fontDisplay = '"Fraunces", Georgia, serif';
const fontBody = '"Inter", system-ui, sans-serif';

// ---------- shared atoms ----------
const Chip = ({ children, tone = 'cream' as 'cream' | 'burgundy' | 'gold' | 'leaf' | 'ink', className = '' }) => {
  const tones: Record<string, string> = {
    cream: `bg-[${C.cream}] text-[${C.inkSoft}] border border-[${C.line}]`,
    burgundy: `bg-[${C.burgundy}] text-[${C.cream}]`,
    gold: `bg-[${C.goldSoft}]/30 text-[${C.burgundyDeep}] border border-[${C.goldSoft}]`,
    leaf: `bg-[${C.leaf}]/15 text-[${C.leaf}]`,
    ink: `bg-[${C.ink}] text-[${C.cream}]`,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${tones[tone]} ${className}`} style={{ fontFamily: fontBody }}>
      {children}
    </span>
  );
};

const SectionTitle = ({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) => (
  <div className="px-5 pt-7 pb-3">
    {eyebrow && (
      <div className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5" style={{ color: C.gold, fontFamily: fontBody }}>
        {eyebrow}
      </div>
    )}
    <h2 className="text-[26px] leading-tight" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500, letterSpacing: '-0.01em' }}>
      {title}
    </h2>
    {sub && <p className="mt-1 text-sm" style={{ color: C.mute, fontFamily: fontBody }}>{sub}</p>}
  </div>
);

// ---------- IMAGES (Unsplash) ----------
const IMG = {
  hero: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=900&q=80&auto=format&fit=crop',
  shelf: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1000&q=80&auto=format&fit=crop',
  glass: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=900&q=80&auto=format&fit=crop',
  bottleRed: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600&q=80&auto=format&fit=crop',
  bottleWhite: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=80&auto=format&fit=crop',
  bottleRose: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&q=80&auto=format&fit=crop',
  vineyard: 'https://images.unsplash.com/photo-1506377711776-dbdc2f3c20d6?w=900&q=80&auto=format&fit=crop',
  dinner: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=900&q=80&auto=format&fit=crop',
  picnic: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&q=80&auto=format&fit=crop',
  steak: 'https://images.unsplash.com/photo-1558030006-450675393462?w=900&q=80&auto=format&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=80&auto=format&fit=crop',
  asian: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=900&q=80&auto=format&fit=crop',
  veg: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&q=80&auto=format&fit=crop',
  seafood: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80&auto=format&fit=crop',
  date: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=900&q=80&auto=format&fit=crop',
  anniversary: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=80&auto=format&fit=crop',
  napa: 'https://images.unsplash.com/photo-1559692048-79a3f837883d?w=900&q=80&auto=format&fit=crop',
  birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80&auto=format&fit=crop',
  fresh: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&q=80&auto=format&fit=crop',
  smooth: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80&auto=format&fit=crop',
  bold: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=800&q=80&auto=format&fit=crop',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop',
};

/* =========================================================
   JUSTGRAPES TAXONOMY
   - Wine Styles: Fresh (light-bodied) · Smooth (medium-bodied)
                  · Rich (full-bodied) · Special (fortified & other)
   - 8 Flavor descriptors: Fruity, Floral, Grassy, Minerally,
                           Oaky, Toasty, Nutty, Spicy
   ========================================================= */
const WINE_STYLES = [
  { key: 'fresh',   label: 'Fresh',   body: 'Light-bodied',      blurb: 'Bright, lively, crisp',           img: IMG.fresh },
  { key: 'smooth',  label: 'Smooth',  body: 'Medium-bodied',     blurb: 'Balanced, easygoing',             img: IMG.smooth },
  { key: 'rich',    label: 'Rich',    body: 'Full-bodied',       blurb: 'Deep, layered, intense',          img: IMG.bold },
  { key: 'special', label: 'Special', body: 'Fortified & other', blurb: 'Port, sherry, sweet, sparkling',  img: IMG.anniversary },
] as const;

const FLAVORS = [
  { key: 'fruity',    label: 'Fruity',    emoji: '🍒' },
  { key: 'floral',    label: 'Floral',    emoji: '🌸' },
  { key: 'grassy',    label: 'Grassy',    emoji: '🌿' },
  { key: 'minerally', label: 'Minerally', emoji: '🪨' },
  { key: 'oaky',      label: 'Oaky',      emoji: '🪵' },
  { key: 'toasty',    label: 'Toasty',    emoji: '🔥' },
  { key: 'nutty',     label: 'Nutty',     emoji: '🌰' },
  { key: 'spicy',     label: 'Spicy',     emoji: '🌶️' },
] as const;

/* =========================================================
   ONBOARDING
   ========================================================= */
const onboardingSteps = [
  {
    key: 'style',
    question: 'Which style draws you in tonight?',
    multi: false,
    options: WINE_STYLES.map(s => ({ label: s.label, img: s.img, sub: `${s.body} · ${s.blurb}` })),
  },
  {
    key: 'flavors',
    question: 'Which flavors do you tend to love?',
    multi: true,
    options: FLAVORS.map(f => ({ label: `${f.emoji}  ${f.label}`, img: IMG.vineyard })),
  },
  {
    key: 'food',
    question: 'Which foods do you enjoy?',
    multi: true,
    options: [
      { label: 'Seafood', img: IMG.seafood },
      { label: 'Steak', img: IMG.steak },
      { label: 'Pasta', img: IMG.pasta },
      { label: 'Asian Cuisine', img: IMG.asian },
      { label: 'Vegetarian', img: IMG.veg },
    ],
  },
  {
    key: 'occasion',
    question: 'Which occasions matter most?',
    multi: true,
    options: [
      { label: 'Everyday dinners', img: IMG.dinner },
      { label: 'Entertaining guests', img: IMG.picnic },
      { label: 'Date nights', img: IMG.date },
      { label: 'Celebrations', img: IMG.anniversary },
      { label: 'Gifts', img: IMG.napa },
    ],
  },
];

const Onboarding = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(-1); // -1 = welcome splash
  const [picks, setPicks] = useState<Record<string, string[]>>({});

  if (step === -1) {
    return (
      <div className="relative h-full" style={{ background: C.burgundyDeep }}>
        <img src={IMG.glass} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(42,20,23,0.25) 0%, ${C.burgundyDeep} 90%)` }} />
        <div className="relative h-full flex flex-col justify-end p-7 pb-12 text-[color:var(--cream)]" style={{ ['--cream' as any]: C.cream }}>
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.goldSoft, fontFamily: fontBody }}>
            Justgrapes · Savor
          </div>
          <h1 className="text-[44px] leading-[1.02]" style={{ fontFamily: fontDisplay, fontWeight: 400, letterSpacing: '-0.02em' }}>
            Welcome to <em style={{ fontStyle: 'italic', color: C.goldSoft }}>your taste.</em>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed opacity-90" style={{ fontFamily: fontBody }}>
            Wine should be relatable, enjoyable, and personal — not intimidating.
            Let's discover what <em>you</em> love.
          </p>
          <button
            onClick={() => setStep(0)}
            className="mt-8 w-full py-4 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2"
            style={{ background: C.cream, color: C.burgundyDeep, fontFamily: fontBody }}
          >
            Begin <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={onDone} className="mt-3 text-xs opacity-60 underline" style={{ fontFamily: fontBody }}>
            Skip — I've been here before
          </button>
        </div>
      </div>
    );
  }

  const s = onboardingSteps[step];
  const selected = picks[s.key] || [];
  const toggle = (label: string) => {
    if (s.multi) {
      setPicks(p => ({ ...p, [s.key]: selected.includes(label) ? selected.filter(x => x !== label) : [...selected, label] }));
    } else {
      setPicks(p => ({ ...p, [s.key]: [label] }));
    }
  };
  const canNext = selected.length > 0;
  const next = () => (step < onboardingSteps.length - 1 ? setStep(step + 1) : onDone());

  return (
    <div className="h-full flex flex-col" style={{ background: C.creamSoft }}>
      <div className="px-6 pt-12 pb-3 flex items-center gap-2">
        {onboardingSteps.map((_, i) => (
          <div key={i} className="h-[3px] flex-1 rounded-full" style={{ background: i <= step ? C.burgundy : C.line }} />
        ))}
      </div>
      <div className="px-6 pt-4">
        <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: C.gold, fontFamily: fontBody }}>
          Step {step + 1} of {onboardingSteps.length}
        </div>
        <h2 className="text-[28px] leading-tight" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500, letterSpacing: '-0.01em' }}>
          {s.question}
        </h2>
        {s.multi && <p className="mt-1 text-xs" style={{ color: C.mute, fontFamily: fontBody }}>Pick all that apply</p>}
      </div>

      <div className="flex-1 overflow-y-auto px-6 mt-5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {s.options.map(opt => {
            const on = selected.includes(opt.label);
            return (
              <button
                key={opt.label}
                onClick={() => toggle(opt.label)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden text-left transition-transform active:scale-[0.98]"
                style={{ boxShadow: on ? `0 0 0 3px ${C.burgundy}` : `0 1px 0 ${C.line}` }}
              >
                <img src={opt.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)' }} />
                {on && (
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C.cream, color: C.burgundy }}>
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="text-[15px] leading-tight" style={{ fontFamily: fontDisplay, fontWeight: 500 }}>{opt.label}</div>
                  {(opt as any).sub && <div className="text-[11px] opacity-85 mt-0.5" style={{ fontFamily: fontBody }}>{(opt as any).sub}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-8 pt-2 flex items-center gap-3" style={{ background: C.creamSoft }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-12 h-12 rounded-full flex items-center justify-center border" style={{ borderColor: C.line, color: C.inkSoft }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={next}
          disabled={!canNext}
          className="flex-1 py-4 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition-opacity"
          style={{ background: C.burgundy, color: C.cream, fontFamily: fontBody, opacity: canNext ? 1 : 0.4 }}
        >
          {step === onboardingSteps.length - 1 ? 'See my taste' : 'Continue'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   HOME — Taste Profile + Today
   ========================================================= */
const TasteAxis = ({ left, right, value }: { left: string; right: string; value: number }) => (
  <div>
    <div className="flex items-center justify-between text-[11px] mb-1.5" style={{ color: C.mute, fontFamily: fontBody }}>
      <span>{left}</span><span>{right}</span>
    </div>
    <div className="relative h-[6px] rounded-full" style={{ background: C.line }}>
      <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2" style={{ left: `calc(${value}% - 7px)`, background: C.burgundy, borderColor: C.cream }} />
    </div>
  </div>
);

const HomeScreen = ({ goto }: { goto: (t: Tab) => void }) => (
  <div className="pb-28">
    {/* Greeting */}
    <div className="px-5 pt-10 pb-2 flex items-center justify-between">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.gold, fontFamily: fontBody }}>Tuesday evening</div>
        <h1 className="text-[30px] leading-tight mt-1" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500, letterSpacing: '-0.01em' }}>
          Hello, Maya
        </h1>
      </div>
      <img src={IMG.avatar} className="w-11 h-11 rounded-full object-cover ring-2" style={{ ['--tw-ring-color' as any]: C.line }} alt="" />
    </div>

    {/* Taste card */}
    <div className="mx-5 mt-5 rounded-[28px] overflow-hidden relative" style={{ background: C.burgundyDeep, color: C.cream }}>
      <img src={IMG.vineyard} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
      <div className="relative p-6">
        <div className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: C.goldSoft, fontFamily: fontBody }}>Your taste · this season</div>
        <p className="text-[20px] leading-snug" style={{ fontFamily: fontDisplay, fontWeight: 400, letterSpacing: '-0.005em' }}>
          You tend to enjoy <em style={{ color: C.goldSoft }}>smooth, fruit-forward</em> wines that pair well with dinner gatherings.
        </p>
        <div className="mt-5 space-y-3.5">
          <TasteAxis left="Fresh" right="Rich" value={62} />
          <TasteAxis left="Fruit" right="Earth" value={35} />
          <TasteAxis left="Light" right="Bold" value={55} />
          <TasteAxis left="Classic" right="Adventurous" value={70} />
        </div>
        <button onClick={() => goto('me')} className="mt-5 text-[12px] inline-flex items-center gap-1.5 underline-offset-4" style={{ color: C.goldSoft, fontFamily: fontBody }}>
          See full taste profile <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Quick actions */}
    <div className="px-5 mt-5 grid grid-cols-2 gap-3">
      <QuickAction onClick={() => goto('scan')} icon={<ScanLine className="w-5 h-5" />} title="At the shop" sub="Scan a shelf" tint={C.burgundy} />
      <QuickAction onClick={() => goto('discover')} icon={<UtensilsCrossed className="w-5 h-5" />} title="Tonight's dinner" sub="Suggest a pairing" tint={C.plum} />
    </div>

    {/* Companion teaser */}
    <SectionTitle eyebrow="Companion" title="Ask anything, anytime." />
    <button onClick={() => goto('chat')} className="mx-5 w-[calc(100%-2.5rem)] flex items-center gap-3 p-4 rounded-2xl text-left" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.burgundy, color: C.cream }}>
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-[13px]" style={{ color: C.mute, fontFamily: fontBody }}>Try saying</div>
        <div className="text-[15px]" style={{ color: C.ink, fontFamily: fontDisplay, fontWeight: 500 }}>"What should I bring to dinner Friday?"</div>
      </div>
      <ChevronRight className="w-5 h-5" style={{ color: C.mute }} />
    </button>

    {/* For you */}
    <SectionTitle eyebrow="Picked for you" title="Three wines you'll love this week" />
    <div className="px-5 flex gap-3 overflow-x-auto -mx-1 pl-5 pr-5 pb-2" style={{ scrollbarWidth: 'none' }}>
      {discoverCards.slice(0, 3).map(card => (
        <DiscoverCard key={card.name} card={card} small />
      ))}
    </div>

    {/* Memory teaser */}
    <SectionTitle eyebrow="A memory" title="One year ago: Anniversary dinner" />
    <div className="mx-5 rounded-2xl overflow-hidden relative aspect-[16/10]">
      <img src={IMG.anniversary} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="text-[12px] opacity-80" style={{ fontFamily: fontBody }}>Nov 12 · Quince, SF</div>
        <div className="text-[18px]" style={{ fontFamily: fontDisplay, fontWeight: 500 }}>The Pinot you both loved.</div>
      </div>
    </div>
  </div>
);

const QuickAction = ({ icon, title, sub, tint, onClick }: any) => (
  <button onClick={onClick} className="rounded-2xl p-4 text-left flex flex-col gap-3" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: tint, color: C.cream }}>{icon}</div>
    <div>
      <div className="text-[15px]" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>{title}</div>
      <div className="text-[12px]" style={{ color: C.mute, fontFamily: fontBody }}>{sub}</div>
    </div>
  </button>
);

/* =========================================================
   DISCOVER FEED
   ========================================================= */
const discoverCards = [
  { name: 'Domaine Verde', kind: 'Smooth red · Pinot vibe', img: IMG.bottleRed, match: 94, price: '$24', reason: "Because you enjoy smooth red wines with pasta.", occasion: 'Pasta night', pairing: 'Wild mushroom rigatoni' },
  { name: 'Côte Lumière', kind: 'Crisp white', img: IMG.bottleWhite, match: 91, price: '$19', reason: 'Because you liked last month\'s seaside white.', occasion: 'Friday dinner', pairing: 'Pan-seared salmon' },
  { name: 'Maison Belle', kind: 'Bright rosé', img: IMG.bottleRose, match: 88, price: '$17', reason: 'Perfect for entertaining a group on the patio.', occasion: 'Sunday picnic', pairing: 'Charcuterie & olives' },
  { name: 'Quinta Rosso', kind: 'Bold & berry-forward', img: IMG.bottleRed, match: 96, price: '$32', reason: 'Perfect for your anniversary dinner next week.', occasion: 'Celebration', pairing: 'Ribeye & roasted root veg' },
  { name: 'Vigna Antica', kind: 'Smooth & balanced', img: IMG.bottleRed, match: 89, price: '$22', reason: 'Because you\'ve been exploring Italian reds.', occasion: 'Date night', pairing: 'Truffle pasta' },
];

const DiscoverCard = ({ card, small = false }: { card: typeof discoverCards[number]; small?: boolean }) => (
  <div
    className={`rounded-3xl overflow-hidden flex-shrink-0 ${small ? 'w-[68%]' : 'w-full'}`}
    style={{ background: C.cream, border: `1px solid ${C.line}` }}
  >
    <div className="relative aspect-[4/3] overflow-hidden" style={{ background: C.burgundyDeep }}>
      <img src={card.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)' }} />
      <div className="absolute top-3 left-3 flex gap-1.5">
        <Chip tone="ink"><Sparkles className="w-3 h-3" /> {card.match}% match</Chip>
      </div>
      <div className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', color: C.burgundy }}>
        <Heart className="w-4 h-4" />
      </div>
      <div className="absolute bottom-3 left-3 right-3 text-white">
        <div className="text-[11px] opacity-90" style={{ fontFamily: fontBody }}>{card.kind}</div>
        <div className="text-[19px] leading-tight" style={{ fontFamily: fontDisplay, fontWeight: 500 }}>{card.name}</div>
      </div>
    </div>
    <div className="p-4">
      <p className="text-[13px] leading-snug" style={{ color: C.inkSoft, fontFamily: fontBody }}>{card.reason}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip tone="gold"><Calendar className="w-3 h-3" /> {card.occasion}</Chip>
        <Chip tone="cream"><UtensilsCrossed className="w-3 h-3" /> {card.pairing}</Chip>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[15px]" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 600 }}>{card.price}</div>
        <button className="text-[12px] font-semibold inline-flex items-center gap-1" style={{ color: C.burgundy, fontFamily: fontBody }}>
          Save to list <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

const DiscoverScreen = () => {
  const [mode, setMode] = useState<'feed' | 'restaurant'>('feed');
  return (
    <div className="pb-28">
      <div className="px-5 pt-10">
        <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.gold, fontFamily: fontBody }}>Discover</div>
        <h1 className="text-[30px] leading-tight mt-1" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>
          Wines made for you.
        </h1>
      </div>

      <div className="mx-5 mt-4 p-1 rounded-full flex" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
        {(['feed', 'restaurant'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 py-2.5 rounded-full text-[13px] font-semibold capitalize transition-colors"
            style={{
              background: mode === m ? C.burgundy : 'transparent',
              color: mode === m ? C.cream : C.inkSoft,
              fontFamily: fontBody,
            }}
          >
            {m === 'feed' ? 'For you' : 'Restaurant mode'}
          </button>
        ))}
      </div>

      {mode === 'feed' ? (
        <div className="px-5 mt-5 space-y-4">
          {discoverCards.map(c => <DiscoverCard key={c.name} card={c} />)}
        </div>
      ) : (
        <RestaurantMode />
      )}
    </div>
  );
};

const RestaurantMode = () => {
  const tags = [
    { label: 'Best Match', tone: 'burgundy', icon: <Sparkles className="w-3 h-3" /> },
    { label: 'Best Value', tone: 'gold', icon: <Gift className="w-3 h-3" /> },
    { label: 'Something New', tone: 'leaf', icon: <Compass className="w-3 h-3" /> },
    { label: 'Date Night', tone: 'burgundy', icon: <Heart className="w-3 h-3" /> },
    { label: 'Safe Choice', tone: 'cream', icon: <Check className="w-3 h-3" /> },
  ] as const;
  const menu = [
    { name: 'Domaine Verde, Pinot 2021', region: 'Sonoma', price: '$58 / btl', tag: 'Best Match', why: 'Smooth and food-friendly — exactly your zone.' },
    { name: 'Quinta Rosso, Reserva', region: 'Douro', price: '$74 / btl', tag: 'Date Night', why: 'Rich & berry-forward. Loves your ribeye.' },
    { name: 'Maison Belle Rosé', region: 'Provence', price: '$42 / btl', tag: 'Best Value', why: 'Bright and easy. Great glass for the table.' },
    { name: 'Tenuta Antica Sangiovese', region: 'Chianti', price: '$52 / btl', tag: 'Something New', why: 'A small stretch — a touch more earthy.' },
  ];
  return (
    <div className="px-5 mt-5">
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ background: C.burgundy, color: C.cream }}>
        <Camera className="w-5 h-5" />
        <div className="flex-1">
          <div className="text-[13px] opacity-85" style={{ fontFamily: fontBody }}>Quince · San Francisco</div>
          <div className="text-[15px]" style={{ fontFamily: fontDisplay, fontWeight: 500 }}>4 wines on this menu match your taste.</div>
        </div>
      </div>
      <div className="space-y-3">
        {menu.map(item => (
          <div key={item.name} className="rounded-2xl p-4" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Chip tone={tags.find(t => t.label === item.tag)!.tone as any}>{tags.find(t => t.label === item.tag)!.icon} {item.tag}</Chip>
                <div className="mt-2 text-[16px] leading-tight" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>{item.name}</div>
                <div className="text-[12px]" style={{ color: C.mute, fontFamily: fontBody }}>{item.region} · {item.price}</div>
                <p className="mt-2 text-[13px] leading-snug" style={{ color: C.inkSoft, fontFamily: fontBody }}>{item.why}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   SCAN — Smart Glasses Live
   ========================================================= */
const ScanScreen = () => (
  <div className="pb-28">
    <div className="px-5 pt-10">
      <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.gold, fontFamily: fontBody }}>Smart glasses · Live</div>
      <h1 className="text-[30px] leading-tight mt-1" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>
        Looking at a shelf.
      </h1>
      <p className="text-sm mt-1" style={{ color: C.mute, fontFamily: fontBody }}>What Maya sees right now.</p>
    </div>

    <div className="mx-5 mt-5 relative rounded-[28px] overflow-hidden" style={{ background: '#111' }}>
      <img src={IMG.shelf} alt="" className="w-full h-[440px] object-cover opacity-95" />
      {/* HUD frame */}
      <div className="absolute inset-0 pointer-events-none">
        {/* corner brackets */}
        {[
          'top-3 left-3 border-l-2 border-t-2',
          'top-3 right-3 border-r-2 border-t-2',
          'bottom-3 left-3 border-l-2 border-b-2',
          'bottom-3 right-3 border-r-2 border-b-2',
        ].map(c => <div key={c} className={`absolute w-5 h-5 ${c}`} style={{ borderColor: C.goldSoft }} />)}
        {/* Highlight bottle 1 */}
        <div className="absolute" style={{ left: '18%', top: '24%', width: '14%', height: '58%' }}>
          <div className="absolute inset-0 rounded-xl" style={{ border: `2px solid ${C.goldSoft}`, boxShadow: `0 0 0 9999px rgba(0,0,0,0.35)` }} />
        </div>
        {/* Callout card */}
        <div className="absolute" style={{ left: '34%', top: '14%', width: '60%' }}>
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(247,241,232,0.96)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-center gap-2">
              <Chip tone="burgundy"><Sparkles className="w-3 h-3" /> Highly Recommended</Chip>
              <Chip tone="gold">92% match</Chip>
            </div>
            <div className="mt-2 text-[16px] leading-tight" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 600 }}>
              Domaine Verde · Pinot
            </div>
            <div className="text-[11px]" style={{ color: C.inkSoft, fontFamily: fontBody }}>
              Smooth · Black cherry · Dinner party
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip tone="cream">Pairs with salmon</Chip>
              <Chip tone="leaf">$24</Chip>
            </div>
            <p className="mt-2 text-[11px] italic" style={{ color: C.mute, fontFamily: fontBody }}>
              Because you enjoyed similar wines.
            </p>
          </div>
        </div>
        {/* Bottle 2 small badge */}
        <div className="absolute" style={{ left: '54%', top: '60%' }}>
          <div className="rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1" style={{ background: C.gold, color: '#fff' }}>
            <Star className="w-3 h-3" /> 84% · $19
          </div>
        </div>
        {/* Voice mic */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'rgba(20,10,12,0.7)', color: C.cream, backdropFilter: 'blur(6px)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.goldSoft }} />
          <span className="text-[11px]" style={{ fontFamily: fontBody }}>Say "what should I bring to dinner?"</span>
        </div>
      </div>
    </div>

    {/* Detected list */}
    <SectionTitle eyebrow="On this shelf" title="3 more you might enjoy" />
    <div className="px-5 space-y-2">
      {[
        { n: 'Côte Lumière Blanc', m: 88, p: '$19', why: 'Bright & crisp · seafood night' },
        { n: 'Maison Belle Rosé', m: 84, p: '$17', why: 'Easy patio sipper' },
        { n: 'Vigna Antica', m: 81, p: '$22', why: 'A small adventure' },
      ].map(r => (
        <div key={r.n} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: C.burgundy, color: C.cream, fontFamily: fontDisplay, fontWeight: 600 }}>
            {r.m}
          </div>
          <div className="flex-1">
            <div className="text-[15px]" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>{r.n}</div>
            <div className="text-[12px]" style={{ color: C.mute, fontFamily: fontBody }}>{r.why}</div>
          </div>
          <div className="text-[13px] font-semibold" style={{ color: C.burgundy, fontFamily: fontBody }}>{r.p}</div>
        </div>
      ))}
    </div>
  </div>
);

/* =========================================================
   MEMORIES
   ========================================================= */
const memories = [
  { title: 'Anniversary Dinner', date: 'Nov 12, 2024', place: 'Quince, SF', wine: 'Domaine Verde Pinot', food: 'Tasting menu', people: 'with David', img: IMG.anniversary, note: '"The Pinot we both fell in love with."' },
  { title: 'Napa Weekend', date: 'Sep 28, 2024', place: 'Stags Leap, Napa', wine: 'Quinta Rosso Reserva', food: 'Vineyard lunch', people: 'with Sarah & Jon', img: IMG.napa, note: '"Golden hour. Long table. Easy laughter."' },
  { title: 'Birthday Celebration', date: 'Jun 4, 2024', place: 'Home', wine: 'Maison Belle Rosé', food: 'Garden dinner', people: 'with family', img: IMG.birthday, note: '"Mom\'s 60th. A perfect bottle."' },
  { title: 'Restaurant Discovery', date: 'Mar 22, 2024', place: 'Octavia, SF', wine: 'Côte Lumière Blanc', food: 'Halibut crudo', people: 'date night', img: IMG.date, note: '"Surprised by how much I loved a white."' },
];

const MemoriesScreen = () => (
  <div className="pb-28">
    <div className="px-5 pt-10">
      <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.gold, fontFamily: fontBody }}>Wine memories</div>
      <h1 className="text-[30px] leading-tight mt-1" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>
        A year of moments.
      </h1>
      <p className="text-sm mt-1" style={{ color: C.mute, fontFamily: fontBody }}>
        Wine isn't data. It's the people, places, and meals it lived inside.
      </p>
    </div>

    <div className="mt-6 relative">
      <div className="absolute left-[34px] top-0 bottom-0 w-px" style={{ background: C.line }} />
      <div className="space-y-5">
        {memories.map((m, i) => (
          <div key={i} className="pl-16 pr-5 relative">
            <div className="absolute left-[27px] top-3 w-4 h-4 rounded-full ring-4" style={{ background: C.burgundy, ['--tw-ring-color' as any]: C.creamSoft }} />
            <div className="rounded-2xl overflow-hidden" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
              <div className="relative aspect-[16/9]">
                <img src={m.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="text-[11px] opacity-80" style={{ fontFamily: fontBody }}>{m.date} · {m.place}</div>
                  <div className="text-[20px] leading-tight" style={{ fontFamily: fontDisplay, fontWeight: 500 }}>{m.title}</div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5">
                  <Chip tone="burgundy"><Wine className="w-3 h-3" /> {m.wine}</Chip>
                  <Chip tone="cream"><UtensilsCrossed className="w-3 h-3" /> {m.food}</Chip>
                  <Chip tone="gold"><MapPin className="w-3 h-3" /> {m.people}</Chip>
                </div>
                <p className="mt-3 text-[14px] italic leading-snug" style={{ color: C.inkSoft, fontFamily: fontDisplay }}>
                  {m.note}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* =========================================================
   ME — Taste Evolution Dashboard
   ========================================================= */
const MeScreen = ({ goto }: { goto: (t: Tab) => void }) => (
  <div className="pb-28">
    <div className="px-5 pt-10 flex items-center gap-4">
      <img src={IMG.avatar} alt="" className="w-16 h-16 rounded-full object-cover ring-2" style={{ ['--tw-ring-color' as any]: C.line }} />
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.gold, fontFamily: fontBody }}>Member since 2024</div>
        <h1 className="text-[26px] leading-tight" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>Maya Chen</h1>
      </div>
    </div>

    {/* Big insight */}
    <div className="mx-5 mt-5 rounded-3xl p-6" style={{ background: C.burgundyDeep, color: C.cream }}>
      <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: C.goldSoft, fontFamily: fontBody }}>This year</div>
      <p className="mt-2 text-[22px] leading-snug" style={{ fontFamily: fontDisplay, fontWeight: 400 }}>
        You've become more <em style={{ color: C.goldSoft }}>adventurous</em> — exploring richer reds and earthier whites.
      </p>
    </div>

    {/* Evolution chips */}
    <SectionTitle eyebrow="Taste evolution" title="What's changing for you" />
    <div className="px-5 space-y-2.5">
      {[
        { i: <TrendingUp className="w-4 h-4" />, t: 'Exploring richer wines', s: 'Up 32% from last season' },
        { i: <Heart className="w-4 h-4" />, t: 'Consistently love bright fruit notes', s: '14 wines saved this year' },
        { i: <Calendar className="w-4 h-4" />, t: 'You prefer wine in social settings', s: '78% of saved wines tied to gatherings' },
        { i: <Compass className="w-4 h-4" />, t: 'New region appearing: Douro', s: '3 Portuguese reds in the last month' },
      ].map((row, i) => (
        <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.burgundy, color: C.cream }}>{row.i}</div>
          <div className="flex-1">
            <div className="text-[14px]" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>{row.t}</div>
            <div className="text-[12px]" style={{ color: C.mute, fontFamily: fontBody }}>{row.s}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Full taste profile */}
    <SectionTitle eyebrow="Taste profile" title="The shape of what you love" />
    <div className="mx-5 rounded-3xl p-6 space-y-4" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
      <TasteAxis left="Fresh" right="Rich" value={62} />
      <TasteAxis left="Fruit" right="Earth" value={35} />
      <TasteAxis left="Light" right="Bold" value={55} />
      <TasteAxis left="Classic" right="Adventurous" value={70} />
      <TasteAxis left="Casual" right="Special Occasion" value={48} />
    </div>

    {/* Companion entry */}
    <div className="px-5 mt-6">
      <button onClick={() => goto('chat')} className="w-full rounded-2xl p-4 flex items-center gap-3" style={{ background: C.burgundy, color: C.cream }}>
        <MessageCircle className="w-5 h-5" />
        <span className="text-[14px] font-semibold flex-1 text-left" style={{ fontFamily: fontBody }}>Chat with your wine companion</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/* =========================================================
   COMPANION CHAT
   ========================================================= */
type ChatMsg = { who: 'me' | 'ai'; text: string; chips?: string[] };
const seedChat: ChatMsg[] = [
  { who: 'ai', text: "Hi Maya — what are we thinking about tonight?" , chips: ['A bottle under $30 for steak', "I'm bringing wine to a dinner party", 'Help me choose between two'] },
];
const aiReplyFor = (q: string): ChatMsg => {
  const t = q.toLowerCase();
  if (t.includes('steak') || t.includes('$30')) return { who: 'ai', text: "Easy. Try the Quinta Rosso Reserva — $28, bold and berry-forward, exactly your zone. It'll sing next to a ribeye.", chips: ['Show me the bottle', 'Something a little lighter?'] };
  if (t.includes('dinner party') || t.includes('bringing')) return { who: 'ai', text: "How about Domaine Verde Pinot? It's smooth, food-friendly, and pleases almost everyone — including the friend who 'only drinks white.'", chips: ['Add to my list', 'Suggest a backup white'] };
  if (t.includes('between')) return { who: 'ai', text: "Tell me the two and I'll pick the one closer to your taste — or snap a photo and I'll handle it." };
  return { who: 'ai', text: "Got it. Want me to suggest something from your usual zone, or push you a little outside it?" , chips: ['My usual zone', 'Push me a little'] };
};

const CompanionScreen = ({ back }: { back: () => void }) => {
  const [messages, setMessages] = useState<ChatMsg[]>(seedChat);
  const [text, setText] = useState('');
  const send = (q?: string) => {
    const v = (q ?? text).trim();
    if (!v) return;
    setMessages(m => [...m, { who: 'me', text: v }]);
    setText('');
    setTimeout(() => setMessages(m => [...m, aiReplyFor(v)]), 450);
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.creamSoft }}>
      <div className="px-5 pt-10 pb-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.line}` }}>
        <button onClick={back} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.cream, border: `1px solid ${C.line}`, color: C.inkSoft }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.gold, fontFamily: fontBody }}>Your wine companion</div>
          <div className="text-[18px] leading-tight" style={{ fontFamily: fontDisplay, color: C.ink, fontWeight: 500 }}>Savor</div>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.burgundy, color: C.cream }}>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.who === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[82%]">
              <div
                className="rounded-2xl px-4 py-2.5 text-[14px] leading-snug"
                style={{
                  background: m.who === 'me' ? C.burgundy : C.cream,
                  color: m.who === 'me' ? C.cream : C.ink,
                  border: m.who === 'me' ? 'none' : `1px solid ${C.line}`,
                  fontFamily: fontBody,
                  borderBottomRightRadius: m.who === 'me' ? 6 : 16,
                  borderBottomLeftRadius: m.who === 'me' ? 16 : 6,
                }}
              >
                {m.text}
              </div>
              {m.chips && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.chips.map(c => (
                    <button key={c} onClick={() => send(c)} className="text-[12px] px-3 py-1.5 rounded-full" style={{ background: C.cream, border: `1px solid ${C.line}`, color: C.inkSoft, fontFamily: fontBody }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-2 pb-6" style={{ borderTop: `1px solid ${C.line}`, background: C.creamSoft }}>
        <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about wine…"
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: C.ink, fontFamily: fontBody }}
          />
          <button onClick={() => send()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.burgundy, color: C.cream }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   BOTTOM NAV + SHELL
   ========================================================= */
type Tab = 'home' | 'discover' | 'scan' | 'memories' | 'me' | 'chat';

const BottomTabs = ({ tab, set }: { tab: Tab; set: (t: Tab) => void }) => {
  const items: { key: Tab; label: string; icon: any }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'discover', label: 'Discover', icon: Compass },
    { key: 'scan', label: 'Scan', icon: ScanLine },
    { key: 'memories', label: 'Memories', icon: BookHeart },
    { key: 'me', label: 'Me', icon: User },
  ];
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom)]"
      style={{ background: 'rgba(251,246,238,0.92)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${C.line}` }}
    >
      <div className="grid grid-cols-5">
        {items.map(({ key, label, icon: Icon }) => {
          const active = tab === key || (key === 'me' && tab === 'chat');
          const isScan = key === 'scan';
          return (
            <button
              key={key}
              onClick={() => set(key)}
              className="flex flex-col items-center gap-1 py-2.5 transition-colors"
              style={{ color: active ? C.burgundy : C.mute }}
            >
              {isScan ? (
                <div className="w-11 h-11 -mt-5 rounded-full flex items-center justify-center shadow-lg" style={{ background: C.burgundy, color: C.cream }}>
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
              )}
              <span className="text-[10px] font-semibold" style={{ fontFamily: fontBody }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const JustGrapesLayout = () => {
  useEffect(() => { ensureFonts(); }, []);
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<Tab>('home');

  const screen = useMemo(() => {
    switch (tab) {
      case 'home': return <HomeScreen goto={setTab} />;
      case 'discover': return <DiscoverScreen />;
      case 'scan': return <ScanScreen />;
      case 'memories': return <MemoriesScreen />;
      case 'me': return <MeScreen goto={setTab} />;
      case 'chat': return <CompanionScreen back={() => setTab('me')} />;
    }
  }, [tab]);

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: '#1a0d10', fontFamily: fontBody }}>
      <div
        className="relative w-full max-w-md min-h-screen overflow-hidden shadow-2xl"
        style={{ background: C.creamSoft }}
      >
        {!onboarded ? (
          <div className="absolute inset-0">
            <Onboarding onDone={() => setOnboarded(true)} />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 overflow-y-auto">
              {screen}
            </div>
            {tab !== 'chat' && <BottomTabs tab={tab} set={setTab} />}
          </>
        )}
      </div>
    </div>
  );
};

export default JustGrapesLayout;
