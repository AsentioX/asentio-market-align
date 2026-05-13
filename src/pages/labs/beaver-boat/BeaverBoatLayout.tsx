import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, ChevronDown, X, Mail, Phone, Check } from 'lucide-react';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import logo from './assets/logo.png';

const RACE_DATE = new Date('2026-06-20T08:00:00-07:00').getTime();
const REG_DEADLINE = new Date('2026-05-31T23:59:59-07:00').getTime();

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
    maps: 'https://www.google.com/maps/search/?api=1&query=Lake+Merced+Park+San+Francisco',
    primary: true,
  },
  {
    title: 'Northern California International Dragon Boat Festival',
    date: 'September 12–13, 2026',
    location: 'Leo J. Ryan Park, Foster City',
    maps: 'https://www.google.com/maps/search/?api=1&query=Leo+J+Ryan+Park+Foster+City',
    primary: false,
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
  const { days, hours, mins, secs } = useCountdown(RACE_DATE);
  const regCountdown = useCountdown(REG_DEADLINE);
  const urgent = regCountdown.diff < 1000 * 60 * 60 * 24 * 30; // <30 days to reg close
  const [signupOpen, setSignupOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState(1); // 0 never, 1 once, 2 many
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sponsorMsg, setSponsorMsg] = useState({ name: '', email: '', company: '', message: '' });
  const [sponsorSent, setSponsorSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        setEmail(data.session.user.email || '');
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user);
        setEmail(session.user.email || '');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const expLabel = ['Never', 'Once Before', 'Many Times'][experience];

  const openSignup = () => {
    setSignupOpen(true);
    setStep(user ? 1 : 0);
  };

  const handleGoogle = async () => {
    await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.href });
  };
  const handleApple = async () => {
    await lovable.auth.signInWithOAuth('apple', { redirect_uri: window.location.href });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/labs" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-black">
            <ArrowLeft className="w-4 h-4" /> Labs
          </Link>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Beaver Boat Club" className="h-10 w-10 object-contain" />
            <span className="font-bold tracking-tight hidden sm:block">Beaver Boat Club</span>
          </div>
          <button
            onClick={openSignup}
            className={`px-4 py-2 rounded-md text-sm font-bold text-white transition-transform hover:scale-105 ${urgent ? 'bg-[#FF000D] animate-pulse' : 'bg-[#A31F34]'}`}
          >
            Join Us
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-[#A31F34]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-widest text-white/90 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#FF000D] animate-pulse" />
                MIT Alumni · San Francisco Bay Area
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-5">
                Beaver Boat Club
                <span className="block text-[#C0C0C0] text-2xl md:text-3xl font-bold mt-3">
                  MIT Alumni Dragonboat Team
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
                We are a novice boat — <span className="text-white font-bold">no experience necessary.</span> Just show up, paddle hard, and join a crew that competes across the Bay.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openSignup}
                  className={`px-8 py-4 rounded-xl text-lg font-black text-white shadow-2xl transition-transform hover:scale-105 ${urgent ? 'bg-[#FF000D] shadow-[#FF000D]/40 animate-pulse' : 'bg-[#A31F34] shadow-[#A31F34]/40'}`}
                >
                  Join Us →
                </button>
                <a href="#races" className="px-8 py-4 rounded-xl text-lg font-bold border-2 border-white/30 text-white hover:bg-white/10 transition">
                  See Race Calendar
                </a>
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <img src={logo} alt="" className="w-16 h-16 md:w-20 md:h-20 object-contain bg-white rounded-xl p-2" />
                <div>
                  <div className="text-xs font-bold text-[#FF000D] uppercase tracking-widest">Countdown to</div>
                  <div className="text-white font-bold text-lg leading-tight">SF Dragon Boat Festival</div>
                  <div className="text-white/60 text-sm">June 20 & 21, 2026</div>
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
      <section id="races" className="py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-bold text-[#A31F34] uppercase tracking-widest mb-3">Race Calendar</div>
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight">2026 Season</h2>
            <p className="text-neutral-600 mt-3 text-lg">Local Bay Area festivals where you'll race with the crew.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {races.map((r) => (
              <div key={r.title} className={`group rounded-2xl p-7 border-2 transition-all hover:-translate-y-1 ${r.primary ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10'}`}>
                <div className="flex items-start justify-between mb-4">
                  <Calendar className={`w-7 h-7 ${r.primary ? 'text-[#FF000D]' : 'text-[#A31F34]'}`} />
                  {r.primary && <span className="px-2 py-0.5 rounded-full bg-[#FF000D] text-white text-[10px] font-black uppercase tracking-wider">Next Up</span>}
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-3 leading-tight">{r.title}</h3>
                <div className={`flex items-center gap-2 text-sm mb-2 ${r.primary ? 'text-white/70' : 'text-neutral-600'}`}>
                  <Calendar className="w-4 h-4" /> {r.date}
                </div>
                <div className={`flex items-center gap-2 text-sm mb-6 ${r.primary ? 'text-white/70' : 'text-neutral-600'}`}>
                  <MapPin className="w-4 h-4" /> {r.location}
                </div>
                <a href={r.maps} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${r.primary ? 'bg-white text-black hover:bg-[#C0C0C0]' : 'bg-black text-white hover:bg-[#A31F34]'}`}>
                  <MapPin className="w-4 h-4" /> Get Directions
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-xs font-bold text-[#A31F34] uppercase tracking-widest mb-3">Novice FAQ</div>
          <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-10">First Time? Read This.</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border-2 border-black/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold hover:bg-[#F5F5F5]"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
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
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-xs font-bold text-[#FF000D] uppercase tracking-widest mb-3">Gallery</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Previous Races & Bay Practice</h2>
          <p className="text-white/60 mb-10 text-lg">Catch the crew in action.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryItems.map((g, i) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-20 bg-gradient-to-br from-[#A31F34] to-black text-white">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold text-[#C0C0C0] uppercase tracking-widest mb-3">Sponsorship</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">Seek Sponsors</h2>
            <p className="text-white/80 text-lg mb-6">
              Help fuel the boat. Sponsors get logo placement on team gear, the dragonboat itself, and recognition at every Bay Area festival.
            </p>
            <div className="space-y-3 text-white/80">
              {['Logo on team jerseys & paddles', 'Recognition at SF & NorCal festivals', 'Social shoutouts to MIT alumni network'].map((b) => (
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

      {/* Footer */}
      <footer className="bg-black text-white/60 py-10 text-center text-sm">
        <img src={logo} alt="" className="w-16 h-16 mx-auto mb-4 object-contain" />
        <p className="font-bold text-white">Beaver Boat Club</p>
        <p>MIT Alumni Dragonboat Team · San Francisco Bay Area</p>
      </footer>

      {/* Signup Modal */}
      {signupOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSignupOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSignupOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>

            {!user ? (
              <>
                <img src={logo} alt="" className="w-20 h-20 mx-auto object-contain mb-4" />
                <h3 className="text-2xl font-black text-center mb-2">Join the Crew</h3>
                <p className="text-center text-neutral-600 mb-6">Sign in to start your onboarding.</p>
                <div className="space-y-3">
                  <button onClick={handleGoogle} className="w-full px-4 py-3 rounded-lg border-2 border-black/10 font-bold hover:bg-[#F5F5F5] flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google
                  </button>
                  <button onClick={handleApple} className="w-full px-4 py-3 rounded-lg bg-black text-white font-bold hover:bg-neutral-800 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/></svg>
                    Continue with Apple
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1.5 w-12 rounded-full ${s <= step ? 'bg-[#A31F34]' : 'bg-black/10'}`} />
                  ))}
                </div>

                {step === 1 && (
                  <>
                    <h3 className="text-2xl font-black mb-2">Have you paddled a dragonboat before?</h3>
                    <p className="text-neutral-600 mb-8">No wrong answers — we coach all levels.</p>
                    <div className="px-2">
                      <input
                        type="range"
                        min={0}
                        max={2}
                        step={1}
                        value={experience}
                        onChange={(e) => setExperience(Number(e.target.value))}
                        className="w-full accent-[#A31F34]"
                      />
                      <div className="flex justify-between text-xs font-bold text-neutral-500 mt-3">
                        <span className={experience === 0 ? 'text-[#A31F34]' : ''}>Never</span>
                        <span className={experience === 1 ? 'text-[#A31F34]' : ''}>Once Before</span>
                        <span className={experience === 2 ? 'text-[#A31F34]' : ''}>Many Times</span>
                      </div>
                      <div className="text-center mt-6">
                        <div className="text-xs uppercase tracking-widest text-neutral-500">Selected</div>
                        <div className="text-2xl font-black text-[#A31F34]">{expLabel}</div>
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full mt-8 px-6 py-3 rounded-lg bg-[#A31F34] text-white font-black hover:bg-[#FF000D] transition">
                      Continue →
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h3 className="text-2xl font-black mb-2">How can we reach you?</h3>
                    <p className="text-neutral-600 mb-6">For practice schedules and race-day logistics.</p>
                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-3 top-3.5 text-neutral-400" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-black/10 focus:border-[#A31F34] outline-none" />
                      </div>
                      <div className="relative">
                        <Phone className="w-5 h-5 absolute left-3 top-3.5 text-neutral-400" />
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Mobile phone" className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-black/10 focus:border-[#A31F34] outline-none" />
                      </div>
                    </div>
                    <button onClick={() => setStep(3)} disabled={!email || !phone} className="w-full mt-6 px-6 py-3 rounded-lg bg-[#A31F34] text-white font-black hover:bg-[#FF000D] transition disabled:opacity-40">
                      Submit →
                    </button>
                  </>
                )}

                {step === 3 && (
                  <div className="text-center py-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#A31F34] flex items-center justify-center mb-5">
                      <Check className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-black mb-2">Welcome to the Crew</h3>
                    <p className="text-neutral-600 mb-6">
                      We'll email you practice times and race details. Get ready to paddle, {user.user_metadata?.full_name?.split(' ')[0] || 'beaver'}.
                    </p>
                    <img src={logo} alt="" className="w-24 h-24 mx-auto object-contain" />
                    <button onClick={() => setSignupOpen(false)} className="mt-6 px-8 py-3 rounded-lg bg-black text-white font-black hover:bg-[#A31F34] transition">
                      Done
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeaverBoatLayout;
