import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Droplets, Brain, Check, Sparkles, Plane, Salad, Clock, ArrowLeft } from 'lucide-react';
import heroImg from './assets/hero.jpg';
import leavesPattern from './assets/leaves-pattern.png';
import lifestyleWindow from './assets/lifestyle-window.jpg';
import setupHand from './assets/setup-hand.jpg';
import herbsOverhead from './assets/herbs-overhead.jpg';
import lifestylePerson from './assets/lifestyle-person.jpg';

const VerdantLanding = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/75 border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-lg">Verdant</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-600">
            <a href="#how" className="hover:text-neutral-900 transition">How it works</a>
            <a href="#why" className="hover:text-neutral-900 transition">Why now</a>
            <a href="#benefits" className="hover:text-neutral-900 transition">Benefits</a>
            <a href="#waitlist" className="hover:text-neutral-900 transition">Pricing</a>
          </nav>
          <a href="#waitlist" className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-neutral-800 transition">
            Get early access
          </a>
        </div>
      </header>

      {/* Back to Labs (subtle) */}
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <Link to="/labs" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition">
          <ArrowLeft className="w-3 h-3" /> Asentio Labs
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-[fadeInUp_0.8s_ease-out]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" /> Now accepting waitlist
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
              Your plants.<br />
              <span className="text-emerald-600">Alive.</span> Automatically.
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-8 max-w-xl">
              Stop guessing when to water. Verdant senses your plant's needs and waters it for you — so your plants thrive, even when life gets busy.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#waitlist" className="inline-flex items-center gap-2 bg-emerald-600 text-white font-medium px-6 py-3.5 rounded-full hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">
                Get early access <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#how" className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-900 font-medium px-6 py-3.5 rounded-full hover:bg-neutral-200 transition">
                See how it works
              </a>
            </div>
          </div>
          <div className="relative animate-[fadeIn_1.2s_ease-out]">
            <div className="absolute inset-0 bg-emerald-100/50 rounded-[2.5rem] blur-3xl" />
            <img
              src={heroImg}
              alt="Verdant self-watering plant device on a wooden table"
              width={1920}
              height={1080}
              className="relative rounded-[2rem] shadow-2xl shadow-neutral-900/10 w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section id="why" className="bg-neutral-50 py-24 md:py-32 border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-4">Why now</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-8 leading-[1.1]">
                Why keeping plants alive is still so hard.
              </h2>
              <div className="space-y-6 text-lg text-neutral-600 leading-relaxed">
                <p>More people than ever are bringing plants into their homes. But plant care hasn't evolved — it still relies on guesswork.</p>
                <p>Overwatering and underwatering are the <span className="text-neutral-900 font-medium">#1 reasons plants die</span>. Smart home tech has transformed everything from lights to locks. Plant care got left behind.</p>
              </div>
            </div>
            <div className="relative">
              <img
                src={lifestyleWindow}
                alt="Sunlit windowsill with thriving potted houseplants"
                loading="lazy"
                width={1280}
                height={896}
                className="rounded-[2rem] shadow-xl shadow-neutral-900/10 w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-4">
            {[
              "Most people don't know when to water",
              "Timers don't adapt to real conditions",
              "Plant apps tell you what to do — but don't do it for you",
            ].map((t) => (
              <div key={t} className="bg-white rounded-2xl p-6 border border-neutral-100">
                <p className="text-neutral-700">"{t}"</p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-2xl md:text-3xl font-medium tracking-tight text-neutral-900">
            It's time for plant care to become automatic.
          </p>
        </div>
      </section>

      {/* Solution */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: `url(${leavesPattern})`, backgroundSize: '380px', backgroundRepeat: 'repeat', filter: 'invert(64%) sepia(38%) saturate(420%) hue-rotate(85deg) brightness(95%) contrast(85%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-4">The solution</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Verdant does the thinking for you.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: 'Senses your plant', desc: 'Detects real soil moisture — not guesswork.' },
              { icon: Droplets, title: 'Waters automatically', desc: 'Delivers the right amount of water, at the right time.' },
              { icon: Brain, title: 'Learns over time', desc: 'Adapts to your plant, your home, and your routine.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group bg-white border border-neutral-100 rounded-3xl p-8 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 tracking-tight">{title}</h3>
                <p className="text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative bg-emerald-600 text-white py-24 md:py-32 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-screen"
          style={{ backgroundImage: `url(${leavesPattern})`, backgroundSize: '420px', backgroundRepeat: 'repeat' }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-emerald-200 uppercase tracking-wider mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Set it up in under 2 minutes.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Insert into soil', desc: 'Slide Verdant into the pot, next to your plant.' },
              { n: '02', title: 'Attach water source', desc: 'Use any bottle or refillable tank you have.' },
              { n: '03', title: 'Turn it on', desc: "That's it. No schedules. No apps required." },
            ].map((s) => (
              <div key={s.n} className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/10">
                <div className="text-emerald-200 text-sm font-mono mb-4">{s.n}</div>
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">{s.title}</h3>
                <p className="text-emerald-50/90 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <img
              src={setupHand}
              alt="Hand inserting a Verdant probe into the soil of a potted monstera"
              loading="lazy"
              width={1280}
              height={896}
              className="rounded-[2rem] shadow-2xl shadow-black/30 w-full object-cover aspect-[16/10] border border-white/10"
            />
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: `url(${leavesPattern})`, backgroundSize: '380px', backgroundRepeat: 'repeat', filter: 'invert(64%) sepia(38%) saturate(420%) hue-rotate(85deg) brightness(95%) contrast(85%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2">
              <img
                src={lifestylePerson}
                alt="Person caring for indoor plants in a sunlit living room"
                loading="lazy"
                width={1280}
                height={896}
                className="rounded-[2rem] shadow-xl shadow-neutral-900/10 w-full object-cover aspect-[4/5]"
              />
            </div>
            <div className="md:col-span-3">
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-4">You're not alone</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-10">
                Sound familiar?
              </h2>
              <div className="grid sm:grid-cols-1 gap-4">
                {[
                  { quote: 'I always forget to water…', meta: 'Sarah, Brooklyn' },
                  { quote: 'I think I overwatered again.', meta: 'Marcus, Austin' },
                  { quote: 'I travel and come back to dead plants.', meta: 'Aiko, Seattle' },
                ].map((q) => (
                  <div key={q.quote} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                    <p className="text-lg font-medium tracking-tight text-neutral-900 mb-1 leading-snug">"{q.quote}"</p>
                    <p className="text-sm text-neutral-500">— {q.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="bg-neutral-50 py-24 md:py-32 border-y border-neutral-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-4">Beyond plant care</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              More than plant care — peace of mind.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Check, title: 'Never worry about watering again', desc: 'Set it, and let your plants take care of themselves.' },
              { icon: Plane, title: 'Travel without coming home to disaster', desc: 'Two weeks away? Your plants will be waiting, healthy.' },
              { icon: Salad, title: 'Grow herbs and vegetables with confidence', desc: 'Fresh basil and tomatoes, no green thumb required.' },
              { icon: Clock, title: 'Built for busy lifestyles', desc: "Skip the routine. Verdant has it handled." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 flex gap-5 items-start border border-neutral-100">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 tracking-tight">{title}</h3>
                  <p className="text-neutral-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future vision */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: `url(${leavesPattern})`, backgroundSize: '380px', backgroundRepeat: 'repeat', filter: 'invert(64%) sepia(38%) saturate(420%) hue-rotate(85deg) brightness(95%) contrast(85%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-4">What's next</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 leading-[1.1]">
              This is just the beginning.
            </h2>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
              Verdant is the first step toward a fully autonomous home garden — a future where growing your own food is effortless, intelligent, and accessible to everyone.
            </p>
          </div>
          <img
            src={herbsOverhead}
            alt="Fresh herbs and cherry tomatoes growing in terracotta pots"
            loading="lazy"
            width={1280}
            height={896}
            className="rounded-[2rem] shadow-xl shadow-neutral-900/10 w-full object-cover aspect-[16/9]"
          />
        </div>
      </section>

      {/* Waitlist / Pricing */}
      <section id="waitlist" className="py-24 md:py-32 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-xl shadow-emerald-600/5 p-10 md:p-14 text-center">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-4">Limited first batch</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 leading-[1.1]">
              Be first to experience effortless plant care.
            </h2>
            <p className="text-neutral-600 text-lg mb-8 max-w-xl mx-auto">
              Reserve your Verdant at early-access pricing. We'll reach out when your batch is ready to ship.
            </p>

            <div className="flex items-baseline justify-center gap-2 mb-10">
              <span className="text-5xl font-semibold tracking-tight">$89</span>
              <span className="text-neutral-400 line-through text-lg">$129</span>
              <span className="text-sm text-emerald-600 font-medium ml-2">Early access</span>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 px-5 py-3.5 rounded-full bg-neutral-100 border border-transparent focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                />
                <button type="submit" className="bg-emerald-600 text-white font-medium px-6 py-3.5 rounded-full hover:bg-emerald-700 transition whitespace-nowrap">
                  Join the waitlist
                </button>
              </form>
            ) : (
              <div className="max-w-md mx-auto bg-emerald-50 text-emerald-700 rounded-full py-4 px-6 font-medium">
                ✓ You're on the list. We'll be in touch soon.
              </div>
            )}
            <p className="text-xs text-neutral-400 mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold tracking-tight">Verdant</span>
            <span className="text-neutral-400 text-sm ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition">About</a>
            <a href="#" className="hover:text-neutral-900 transition">Contact</a>
            <a href="#" className="hover:text-neutral-900 transition">Privacy</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default VerdantLanding;
