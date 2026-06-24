import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, EyeOff, HeartHandshake, Sparkles, Quote } from 'lucide-react';
import { fetchPublishedProducts } from '../lib/api';
import type { Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';
import heroCooking from '../assets/senior-cooking.jpg';
import gardening from '../assets/senior-gardening.jpg';
import videocall from '../assets/senior-videocall.jpg';
import yoga from '../assets/senior-yoga.jpg';

export default function CKHome() {
  const [featured, setFeatured] = useState<Product[]>([]);
  useEffect(() => {
    document.title = 'Smart Care Kits — Help your parent age safely at home';
    fetchPublishedProducts().then(ps => setFeatured(ps.filter(p => p.is_featured).slice(0, 6)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 border-b border-stone-200">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[360px] h-[360px] rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> A helpful home — not surveillance
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.02] text-stone-900">
              Help mom and dad keep living the life they love.
            </h1>
            <p className="mt-5 text-lg text-stone-600 leading-relaxed max-w-xl">
              Take a 2-minute assessment about your parent's daily life. We'll recommend a curated
              kit of devices — chosen for safety, privacy, and how they actually live.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/labs/carekits/quiz" className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-base font-medium px-6 py-3.5 rounded-full shadow-lg shadow-emerald-700/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                Start the assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/labs/carekits/marketplace" className="inline-flex items-center gap-2 bg-white/90 backdrop-blur text-stone-800 border border-stone-300 hover:border-emerald-400 text-base font-medium px-6 py-3.5 rounded-full transition-colors">
                Browse the marketplace
              </Link>
            </div>
            <p className="mt-5 text-sm text-stone-500">Free · No account needed · Privacy-first recommendations</p>
          </div>

          <div className="md:col-span-6 relative">
            <div className="relative grid grid-cols-5 grid-rows-6 gap-3 h-[520px]">
              <div className="col-span-3 row-span-4 rounded-[2rem] overflow-hidden shadow-2xl shadow-stone-900/10 ring-1 ring-stone-200/60">
                <img src={heroCooking} alt="Senior woman laughing while cooking at home" width={1024} height={1536} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 rounded-[1.5rem] overflow-hidden shadow-xl shadow-stone-900/10 ring-1 ring-stone-200/60">
                <img src={yoga} alt="Senior woman doing morning yoga" width={1024} height={1536} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 rounded-[1.5rem] overflow-hidden shadow-xl shadow-stone-900/10 ring-1 ring-stone-200/60">
                <img src={videocall} alt="Senior man on a video call with family" width={1024} height={1536} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-3 row-span-2 rounded-[1.5rem] overflow-hidden shadow-xl shadow-stone-900/10 ring-1 ring-stone-200/60">
                <img src={gardening} alt="Senior couple gardening together" width={1536} height={1024} loading="lazy" className="w-full h-full object-cover" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 ring-1 ring-stone-200">
                <div className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center">
                  <HeartHandshake className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-xs leading-tight">
                  <div className="font-semibold text-stone-900">12,000+ families</div>
                  <div className="text-stone-500">building calmer homes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-10 grid sm:grid-cols-3 gap-6">
          <ValueRow icon={<HeartHandshake className="w-5 h-5 text-emerald-700" />} title="Connection over monitoring" desc="Gentle daily check-ins, not constant surveillance." />
          <ValueRow icon={<ShieldCheck className="w-5 h-5 text-sky-700" />} title="Help one tap away" desc="Emergency response when it truly matters." />
          <ValueRow icon={<EyeOff className="w-5 h-5 text-amber-700" />} title="Privacy-first by default" desc="Camera-free options always highlighted." />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700">How it works</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">From overwhelmed to confident in 2 minutes.</h2>
          <p className="mt-3 text-stone-600">No fear-based pitches. Just clear, personalized recommendations from trusted partners.</p>
        </div>
        <ol className="grid md:grid-cols-3 gap-5">
          {[
            { n: '01', t: 'Take the assessment', d: '12 short questions about your parent\'s routine, home, and preferences.' },
            { n: '02', t: 'See a personalized kit', d: 'A care kit tailored to fall risk, privacy, budget, and tech comfort.' },
            { n: '03', t: 'Buy from trusted partners', d: 'We\'ve curated the best. You choose what belongs in their home.' },
          ].map(s => (
            <li key={s.n} className="group bg-white rounded-3xl p-7 border border-stone-200 hover:border-emerald-300 hover:shadow-lg transition-all">
              <div className="text-xs font-mono text-emerald-700 mb-4">{s.n}</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">{s.t}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Editorial: independence story */}
      <section className="bg-stone-100/70 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-stone-900/10 ring-1 ring-stone-200">
              <img src={gardening} alt="Independent senior couple gardening" width={1536} height={1024} loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden md:block bg-white rounded-2xl shadow-xl p-5 max-w-[260px] ring-1 ring-stone-200">
              <Quote className="w-5 h-5 text-emerald-700 mb-2" />
              <p className="text-sm text-stone-700 leading-relaxed">"My parents kept their garden, their routine, and their dignity. We just got peace of mind."</p>
              <p className="mt-2 text-xs text-stone-500">— Sara, daughter</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700">Our philosophy</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">Aging at home, not aged out of it.</h2>
            <p className="mt-4 text-stone-600 leading-relaxed">
              The best technology disappears into a life. We recommend devices that help your parent
              stay independent — cooking the meals they love, calling the people they love, keeping the
              hobbies that make a house feel like home.
            </p>
            <ul className="mt-6 space-y-3 text-stone-700">
              {[
                'Cameras and trackers only when truly needed',
                'Curated for real homes, not catalogs',
                'Vetted brands, transparent affiliate links',
              ].map(t => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700">Curated picks</span>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">Loved by families like yours</h2>
            </div>
            <Link to="/labs/carekits/marketplace" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-700 to-emerald-900 p-10 md:p-16 text-white">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">Not sure where to start?</h3>
              <p className="mt-3 text-emerald-50/90 text-lg">Take the 2-minute assessment and get a kit built around your parent's life — not a generic checklist.</p>
            </div>
            <Link to="/labs/carekits/quiz" className="self-start inline-flex items-center gap-2 bg-white text-emerald-800 font-medium px-6 py-3.5 rounded-full hover:bg-emerald-50 shadow-lg transition-all hover:-translate-y-0.5">
              Start now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-2xl bg-stone-100 grid place-items-center shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-stone-900">{title}</h4>
        <p className="text-sm text-stone-600 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
