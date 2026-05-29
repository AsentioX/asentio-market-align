import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, ChevronDown, X, Mail, Phone, Check, Globe, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGallery } from './useGallery';
import logo from './assets/logo.png';
import raceFestivalBg from '@/assets/beaver-boat/race-festival.jpg';

const RACE_DATE = new Date('2026-06-20T08:00:00-07:00').getTime();
const REG_DEADLINE = new Date('2026-05-31T23:59:59-07:00').getTime();

const useBeaverBoatSEO = () => {
  useEffect(() => {
    const isOwnDomain = typeof window !== 'undefined' &&
      (window.location.hostname === 'beaverboatclub.org' || window.location.hostname === 'www.beaverboatclub.org');
    const canonicalUrl = isOwnDomain
      ? 'https://beaverboatclub.org/'
      : 'https://asentio-website.lovable.app/labs/beaver-boat';
    const title = 'Beaver Boat Club — MIT Alumni Dragon Boat Crew, San Francisco';
    const description = 'Beaver Boat Club is a San Francisco Bay Area dragon boat crew anchored by MIT alumni. Join us for the 2026 SF Dragon Boat Festival — no experience required.';

    const prevTitle = document.title;
    document.title = title;

    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      return el;
    };

    const metas = [
      setMeta('meta[name="description"]', 'name', 'description', description),
      setMeta('meta[property="og:title"]', 'property', 'og:title', title),
      setMeta('meta[property="og:description"]', 'property', 'og:description', description),
      setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl),
      setMeta('meta[property="og:type"]', 'property', 'og:type', 'website'),
    ];

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const hadCanonical = !!canonical;
    const prevCanonical = canonical?.href;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    return () => {
      document.title = prevTitle;
      if (hadCanonical && canonical && prevCanonical) canonical.href = prevCanonical;
    };
  }, []);
};

const useCountdown = (target: number) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, diff };
};

const races = [
  {
    title: '2026 San Francisco Dragon Boat Festival',
    date: 'June 20–21, 2026',
    location: 'Lake Merced Park, San Francisco',
    maps: 'https://maps.app.goo.gl/v4oGVuHdx9eFBe9SA',
    primary: true,
  },
];

const faqs = [
  {
    q: 'Do I need any prior paddling experience?',
    a: "Absolutely not. We are a novice boat — most of our crew started with zero experience. Our coaches teach you the stroke, timing, and safety from day one.",
  },
  {
    q: 'What should I wear for Bay Area practice?',
    a: 'Layers! Mornings on the bay can be 50°F and windy. Bring moisture-wicking athletic wear, a windbreaker, sunglasses with strap, sunscreen, and shoes that can get wet. Bring a change of clothes — you will get splashed.',
  },
  {
    q: 'How often do you practice?',
    a: 'Weekend morning practices on the Bay, plus optional weekday land workouts leading up to race day.',
  },
  {
    q: 'Do I need to be an MIT alum?',
    a: 'The crew is anchored by MIT alumni, but friends, partners, and fellow tech-community paddlers are warmly welcome to fill the boat.',
  },
];

const galleryItems = [
  { type: 'race', label: 'SF Festival 2024 — Final Heat' },
  { type: 'race', label: 'Treasure Island Sprint' },
  { type: 'race', label: 'NorCal International 2024' },
  { type: 'practice', label: 'Sunday Practice — Lake Merced' },
  { type: 'practice', label: 'Drone Footage — Bay Run' },
  { type: 'practice', label: 'New Crew Orientation' },
];

const BeaverBoatLayout = () => {
  useBeaverBoatSEO();
  const { days, hours, mins, secs } = useCountdown(RACE_DATE);
  const regCountdown = useCountdown(REG_DEADLINE);
  const { items: galleryDb } = useGallery();
  const urgent = regCountdown.diff < 1000 * 60 * 60 * 24 * 30; // <30 days to reg close
  const [signupOpen, setSignupOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sponsorMsg, setSponsorMsg] = useState({ name: '', email: '', company: '', message: '' });
  const [sponsorSent, setSponsorSent] = useState(false);
  const [contactMsg, setContactMsg] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState('');
  const [joinMsg, setJoinMsg] = useState({ name: '', email: '', message: '' });
  const [joinSent, setJoinSent] = useState(false);
  const [joinSending, setJoinSending] = useState(false);
  const [joinError, setJoinError] = useState('');

  const sendNotification = (kind: string, p: { name: string; email: string; message: string }) => {
    supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'beaver-boat-contact',
        recipientEmail: p.email,
        idempotencyKey: `bb-${kind}-${p.email}-${Date.now()}`,
        templateData: { name: p.name, message: p.message, kind },
      },
    }).catch(() => {});
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    setContactSending(true);
    const payload = {
      name: contactMsg.name.trim(),
      email: contactMsg.email.trim(),
      message: contactMsg.message.trim(),
    };
    const { error } = await supabase.from('beaver_boat_messages').insert(payload);
    setContactSending(false);
    if (error) {
      setContactError(error.message);
      return;
    }
    sendNotification('Contact', payload);
    setContactSent(true);
    setContactMsg({ name: '', email: '', message: '' });
  };

  const submitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSending(true);
    const payload = {
      name: joinMsg.name.trim(),
      email: joinMsg.email.trim(),
      message: joinMsg.message.trim() || 'Interested in joining the crew.',
    };
    const { error } = await supabase.from('beaver_boat_messages').insert(payload);
    setJoinSending(false);
    if (error) {
      setJoinError(error.message);
      return;
    }
    sendNotification('Join', payload);
    setJoinSent(true);
  };

  const openSignup = () => {
    setSignupOpen(true);
    setJoinSent(false);
    setJoinError('');
    setJoinMsg({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/10">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src={logo} alt="Beaver Boat Club" className="h-8 w-8 sm:h-10 sm:w-10 object-contain shrink-0" />
            <span className="font-bold tracking-tight truncate text-sm sm:text-base">Beaver Boat Club</span>
          </div>
          <button
            onClick={openSignup}
            className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-bold text-white transition-transform hover:scale-105 ${urgent ? 'bg-[#FF000D] animate-pulse' : 'bg-[#A31F34]'}`}
          >
            Join Us
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-[#A31F34]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 py-14 sm:py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/90 mb-5 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-[#FF000D] animate-pulse" />
                MIT Alumni · SF Bay Area
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-4 sm:mb-5">
                Beaver Boat Club
                <span className="block text-[#C0C0C0] text-xl sm:text-2xl md:text-3xl font-bold mt-2 sm:mt-3">
                  MIT Alumni Dragonboat Team
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-lg">
                We are a novice boat — <span className="text-white font-bold">no experience necessary.</span> Just show up, paddle hard, and join a crew that competes across the Bay.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <button
                  onClick={openSignup}
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-black text-white shadow-2xl transition-transform hover:scale-105 ${urgent ? 'bg-[#FF000D] shadow-[#FF000D]/40 animate-pulse' : 'bg-[#A31F34] shadow-[#A31F34]/40'}`}
                >
                  Join Us →
                </button>
                <a href="#races" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold border-2 border-white/30 text-white hover:bg-white/10 transition text-center">
                  See Race Calendar
                </a>
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <img src={logo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain bg-white rounded-xl p-2 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-bold text-[#FF000D] uppercase tracking-widest">Countdown to</div>
                  <div className="text-white font-bold text-base sm:text-lg leading-tight">SF Dragon Boat Festival</div>
                  <div className="text-white/60 text-xs sm:text-sm">June 20 & 21, 2026</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {[
                  { v: days, l: 'Days' },
                  { v: hours, l: 'Hrs' },
                  { v: mins, l: 'Min' },
                  { v: secs, l: 'Sec' },
                ].map((u) => (
                  <div key={u.l} className="bg-black/40 border border-white/10 rounded-xl p-3 md:p-4 text-center">
                    <div className="text-2xl md:text-4xl font-black text-white tabular-nums">{String(u.v).padStart(2, '0')}</div>
                    <div className="text-[10px] md:text-xs text-white/60 uppercase tracking-wider mt-1">{u.l}</div>
                  </div>
                ))}
              </div>
              <div className={`mt-6 p-3 rounded-lg border text-center ${urgent ? 'bg-[#FF000D]/20 border-[#FF000D] text-white' : 'bg-white/5 border-white/10 text-white/80'}`}>
                <span className="text-sm font-bold">⚠ Registration closes May 31, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Races */}
      <section id="races" className="py-14 sm:py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-8 sm:mb-12">
            <div className="text-xs font-bold text-[#A31F34] uppercase tracking-widest mb-3">Race Calendar</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">2026 Season</h2>
            <p className="text-neutral-600 mt-3 text-base sm:text-lg">Local Bay Area festivals where you'll race with the crew.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {races.map((r) => (
              <div
                key={r.title}
                className={`group relative overflow-hidden rounded-2xl p-5 sm:p-7 border-2 transition-all hover:-translate-y-1 ${r.primary ? 'text-white border-black' : 'bg-white text-black border-black/10'}`}
                style={r.primary ? { backgroundImage: `url(${raceFestivalBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                {r.primary && <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-black/40" aria-hidden />}
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <Calendar className={`w-7 h-7 ${r.primary ? 'text-[#FF000D]' : 'text-[#A31F34]'}`} />
                    {r.primary && <span className="px-2 py-0.5 rounded-full bg-[#FF000D] text-white text-[10px] font-black uppercase tracking-wider">Next Up</span>}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-3 leading-tight">{r.title}</h3>
                  <div className={`flex items-center gap-2 text-sm mb-2 ${r.primary ? 'text-white/80' : 'text-neutral-600'}`}>
                    <Calendar className="w-4 h-4" /> {r.date}
                  </div>
                  <a href={r.maps} target="_blank" rel="noreferrer" className={`flex items-center gap-2 text-sm hover:underline ${r.primary ? 'text-white/80 mb-2' : 'text-neutral-600 mb-6'}`}>
                    <MapPin className="w-4 h-4" /> {r.location}
                  </a>
                  {r.primary && (
                    <>
                      <div className="flex items-start gap-2 text-sm text-white/80 flex-wrap mb-2">
                        <Clock className="w-4 h-4 shrink-0 text-[#FF000D] mt-0.5" />
                        <span className="font-bold text-[#FF000D]">Registration deadline:</span>
                        <span className="text-[#FF000D]">May 31, 2026</span>
                      </div>
                      <div className="border-t border-white/20 my-2" />
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="flex items-start gap-2 text-sm text-white/80">
                            <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Practice: June 7 (Sun)</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-white/80 flex-wrap mt-1">
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                            <a href="https://maps.app.goo.gl/cE7qAEukWG8Qv1RZ9" target="_blank" rel="noreferrer" className="underline hover:text-white break-words">Bair Island Aquatic Center</a>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-start gap-2 text-sm text-white/80">
                            <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Practice: June 13 (Sat)</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-white/80 flex-wrap mt-1">
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                            <a href="https://maps.app.goo.gl/v4oGVuHdx9eFBe9SA" target="_blank" rel="noreferrer" className="underline hover:text-white break-words">Lake Merced</a>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2 text-sm text-white/80">
                          <Globe className="w-4 h-4 shrink-0 mt-0.5" />
                          <a href="https://www.dragonboatsf.com/" target="_blank" rel="noreferrer" className="underline hover:text-white">SF Dragon Boat Festival Website</a>
                        </div>
                        <a
                          href="https://www.mitcnc.org/events/249348"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF000D] hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                          SIGN UP
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-xs font-bold text-[#A31F34] uppercase tracking-widest mb-3">Novice FAQ</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight mb-8 sm:mb-10">First Time? Read This.</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border-2 border-black/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left font-bold hover:bg-[#F5F5F5] text-sm sm:text-base"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-neutral-700 leading-relaxed">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-14 sm:py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-3 gap-4 flex-wrap">
            <div>
              <div className="text-xs font-bold text-[#FF000D] uppercase tracking-widest mb-3">Gallery</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">Previous Races & Bay Practice</h2>
              <p className="text-white/60 text-base sm:text-lg">Catch the crew in action.</p>
            </div>
            <Link
              to="/labs/beaver-boat/admin"
              className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white border border-white/15 hover:border-white/40 px-3 py-2 rounded-lg transition"
            >
              CMS Login
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-7">
            {galleryDb.length > 0 ? (
              galleryDb.map((g) => (
                <div key={g.id} className="aspect-[4/3] rounded-xl bg-neutral-900 border border-white/10 overflow-hidden relative group">
                  {g.media_kind === 'video' ? (
                    <video
                      src={g.media_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                      onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                    />
                  ) : (
                    <img src={g.media_url} alt={g.label} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="text-sm text-white font-bold truncate">{g.label}</span>
                    <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${g.item_type === 'race' ? 'bg-[#FF000D] text-white' : 'bg-[#C0C0C0] text-black'}`}>
                      {g.item_type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              galleryItems.map((g, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A31F34]/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <img src={logo} alt="" className="w-16 h-16 object-contain opacity-30 mb-3" />
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${g.type === 'race' ? 'bg-[#FF000D] text-white' : 'bg-[#C0C0C0] text-black'}`}>
                      {g.type === 'race' ? 'Race' : 'Practice'}
                    </span>
                    <span className="text-sm text-white/80 mt-2 text-center font-medium">{g.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-[#A31F34] to-black text-white">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="text-xs font-bold text-[#C0C0C0] uppercase tracking-widest mb-3">Sponsorship</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 sm:mb-5">Seeking Sponsors</h2>
            <p className="text-white/80 text-base sm:text-lg mb-6">
              Help fuel the boat. Sponsors get logo placement on team gear and recognition with the alumni club.
            </p>
            <div className="space-y-3 text-white/80">
              {['Logo on team jerseys', 'Social shoutouts to MIT alumni network'].map((b) => (
                <div key={b} className="flex items-center gap-3"><Check className="w-5 h-5 text-[#FF000D]" />{b}</div>
              ))}
            </div>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setSponsorSent(true); }}
            className="bg-white text-black rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl"
          >
            <h3 className="text-2xl font-black">Become a Sponsor</h3>
            {sponsorSent ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#A31F34] flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-black mb-2">Thanks!</h4>
                <p className="text-neutral-600">The crew captain will reach out within 48 hours.</p>
              </div>
            ) : (
              <>
                <input required value={sponsorMsg.name} onChange={(e) => setSponsorMsg({ ...sponsorMsg, name: e.target.value })} placeholder="Your name" className="w-full px-4 py-3 rounded-lg border-2 border-black/10 focus:border-[#A31F34] outline-none" />
                <input required type="email" value={sponsorMsg.email} onChange={(e) => setSponsorMsg({ ...sponsorMsg, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 rounded-lg border-2 border-black/10 focus:border-[#A31F34] outline-none" />
                <input value={sponsorMsg.company} onChange={(e) => setSponsorMsg({ ...sponsorMsg, company: e.target.value })} placeholder="Company" className="w-full px-4 py-3 rounded-lg border-2 border-black/10 focus:border-[#A31F34] outline-none" />
                <textarea value={sponsorMsg.message} onChange={(e) => setSponsorMsg({ ...sponsorMsg, message: e.target.value })} placeholder="How would you like to support the crew?" rows={3} className="w-full px-4 py-3 rounded-lg border-2 border-black/10 focus:border-[#A31F34] outline-none resize-none" />
                <button type="submit" className="w-full px-6 py-4 rounded-lg bg-[#A31F34] text-white font-black text-lg hover:bg-[#FF000D] transition">
                  Become a Sponsor
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* Contact Us */}
      <section id="contact" className="py-14 sm:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-xs font-bold text-[#A31F34] uppercase tracking-widest mb-3">Contact</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight mb-3">Get in Touch</h2>
          <p className="text-neutral-600 text-base sm:text-lg mb-6 sm:mb-8">
            Questions about practice, partnerships, or paddling with us? Send a note straight to the captain's inbox.
          </p>

          {contactSent ? (
            <div className="bg-[#F5F5F5] border-2 border-[#A31F34]/20 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#A31F34] flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">Message Received</h3>
              <p className="text-neutral-600 mb-5">Thanks! A crew admin will get back to you shortly.</p>
              <button
                onClick={() => setContactSent(false)}
                className="text-sm font-bold text-[#A31F34] hover:text-[#FF000D]"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submitContact} className="bg-[#F5F5F5] rounded-2xl p-6 md:p-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  required
                  maxLength={120}
                  value={contactMsg.name}
                  onChange={(e) => setContactMsg({ ...contactMsg, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg border-2 border-black/10 bg-white focus:border-[#A31F34] outline-none"
                />
                <input
                  required
                  type="email"
                  maxLength={255}
                  value={contactMsg.email}
                  onChange={(e) => setContactMsg({ ...contactMsg, email: e.target.value })}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border-2 border-black/10 bg-white focus:border-[#A31F34] outline-none"
                />
              </div>
              <textarea
                required
                maxLength={4000}
                rows={5}
                value={contactMsg.message}
                onChange={(e) => setContactMsg({ ...contactMsg, message: e.target.value })}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 rounded-lg border-2 border-black/10 bg-white focus:border-[#A31F34] outline-none resize-none"
              />
              {contactError && <div className="text-sm text-[#A31F34]">{contactError}</div>}
              <button
                type="submit"
                disabled={contactSending}
                className="w-full md:w-auto px-8 py-4 rounded-lg bg-[#A31F34] text-white font-black text-lg hover:bg-[#FF000D] transition disabled:opacity-60"
              >
                {contactSending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white/60 py-10 text-center text-sm">
        <img src={logo} alt="" className="w-16 h-16 mx-auto mb-4 object-contain" />
        <p className="font-bold text-white">Beaver Boat Club</p>
        <p>MIT Alumni Dragonboat Team · San Francisco Bay Area</p>
      </footer>

      {/* Join Us Modal — Contact form, no sign-in */}
      {signupOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSignupOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSignupOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>

            {joinSent ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#A31F34] flex items-center justify-center mb-5">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-2">Thanks!</h3>
                <p className="text-neutral-600 mb-6">
                  We got your message and will be in touch soon with practice times and next steps.
                </p>
                <img src={logo} alt="" className="w-24 h-24 mx-auto object-contain" />
                <button onClick={() => setSignupOpen(false)} className="mt-6 px-8 py-3 rounded-lg bg-black text-white font-black hover:bg-[#A31F34] transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                <img src={logo} alt="" className="w-16 h-16 mx-auto object-contain mb-3" />
                <h3 className="text-2xl font-black text-center mb-2">Join the Crew</h3>
                <p className="text-center text-neutral-600 mb-6">No experience needed. Drop us a note and we'll get you in the boat.</p>
                <form onSubmit={submitJoin} className="space-y-3">
                  <input
                    required
                    maxLength={120}
                    value={joinMsg.name}
                    onChange={(e) => setJoinMsg({ ...joinMsg, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg border-2 border-black/10 bg-white focus:border-[#A31F34] outline-none"
                  />
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-3.5 text-neutral-400" />
                    <input
                      required
                      type="email"
                      maxLength={255}
                      value={joinMsg.email}
                      onChange={(e) => setJoinMsg({ ...joinMsg, email: e.target.value })}
                      placeholder="Email"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-black/10 bg-white focus:border-[#A31F34] outline-none"
                    />
                  </div>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={joinMsg.message}
                    onChange={(e) => setJoinMsg({ ...joinMsg, message: e.target.value })}
                    placeholder="Tell us a bit about yourself (optional)"
                    className="w-full px-4 py-3 rounded-lg border-2 border-black/10 bg-white focus:border-[#A31F34] outline-none resize-none"
                  />
                  {joinError && <div className="text-sm text-[#A31F34]">{joinError}</div>}
                  <button
                    type="submit"
                    disabled={joinSending || !joinMsg.name.trim() || !joinMsg.email.trim()}
                    className="w-full px-6 py-3 rounded-lg bg-[#A31F34] text-white font-black hover:bg-[#FF000D] transition disabled:opacity-50"
                  >
                    {joinSending ? 'Sending…' : 'Send'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeaverBoatLayout;
