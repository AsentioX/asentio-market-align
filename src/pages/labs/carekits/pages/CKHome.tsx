import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, EyeOff, HeartHandshake, Sparkles, Shield, Pill, Brain, Lock, Home, BellRing, HeartPulse, DollarSign, Clock, Wrench, ClipboardList, Package, ShoppingBag } from 'lucide-react';
import { fetchPublishedProducts } from '../lib/api';
import type { Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';
import { KITS, PROBLEMS } from '../lib/kits';
import heroCooking from '../assets/senior-cooking.jpg';
import gardening from '../assets/senior-gardening.jpg';

const ICONS: Record<string, React.ComponentType<any>> = {
  Shield, Pill, Brain, Lock, Home, BellRing, HeartPulse, HeartHandshake,
};

export default function CKHome() {
  const [featured, setFeatured] = useState<Product[]>([]);
  useEffect(() => {
    document.title = 'CareKits — What should I buy for my aging parent?';
    fetchPublishedProducts().then(ps => setFeatured(ps.filter(p => p.is_featured).slice(0, 6)));
  }, []);

  const featuredKits = KITS.filter(k => k.featured);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 border-b border-stone-200">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[360px] h-[360px] rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Personalized recommendations, no guesswork
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-stone-900">
              Helping families keep aging parents safe at home.
            </h1>
            <p className="mt-5 text-lg text-stone-600 leading-relaxed max-w-xl">
              Personalized recommendations for the technology that helps seniors live safely and independently — chosen by trusted editors, not an algorithm.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/labs/carekits/quiz" className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-base font-medium px-6 py-3.5 rounded-full shadow-lg shadow-emerald-700/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                Find my parent's Care Kit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/labs/carekits/kits" className="inline-flex items-center gap-2 bg-white/90 backdrop-blur text-stone-800 border border-stone-300 hover:border-emerald-400 text-base font-medium px-6 py-3.5 rounded-full transition-colors">
                Browse Care Kits
              </Link>
            </div>
            <p className="mt-5 text-sm text-stone-500">Free · 2 minutes · No account needed</p>
          </div>

          <div className="md:col-span-5 relative">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-stone-900/10 ring-1 ring-stone-200/60">
              <img src={heroCooking} alt="Senior woman smiling at home" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 ring-1 ring-stone-200">
              <div className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center">
                <HeartHandshake className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="text-xs leading-tight">
                <div className="font-semibold text-stone-900">Trusted, editorial picks</div>
                <div className="text-stone-500">Curated for real homes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-step process */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700">How it works</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">From overwhelmed to confident in 2 minutes.</h2>
          </div>
          <ol className="grid md:grid-cols-3 gap-5">
            {[
              { icon: ClipboardList, n: '01', t: 'Answer a short assessment', d: 'About 12 questions on your parent\'s home, routine, and preferences. Takes 2 minutes.' },
              { icon: Package, n: '02', t: 'Receive a personalized Care Kit', d: 'A curated bundle of trusted devices matched to fall risk, privacy, budget, and tech comfort.' },
              { icon: ShoppingBag, n: '03', t: 'Buy with no guesswork', d: 'Compare recommended products with clear pricing, setup complexity, and monthly costs.' },
            ].map(s => (
              <li key={s.n} className="group bg-stone-50 rounded-3xl p-7 border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 grid place-items-center mb-4">
                  <s.icon className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-xs font-mono text-emerald-700 mb-1">{s.n}</div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">{s.t}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Problem categories */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700">Start with the problem</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">What are you trying to solve?</h2>
          <p className="mt-3 text-stone-600">Browse by the caregiving challenge you're facing — every area has trusted product recommendations.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEMS.map(p => {
            const Icon = ICONS[p.icon] ?? Shield;
            return (
              <Link key={p.slug} to={`/labs/carekits/problems/${p.slug}`} className="group bg-white border border-stone-200 rounded-3xl p-6 hover:border-emerald-400 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 grid place-items-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-semibold text-stone-900">{p.title}</h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed line-clamp-2">{p.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Care Kits */}
      <section className="bg-stone-100/70 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="flex items-end justify-between mb-10">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700">Featured Care Kits</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">Kits our editors put together.</h2>
            </div>
            <Link to="/labs/carekits/kits" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredKits.map(k => (
              <Link key={k.slug} to={`/labs/carekits/kits/${k.slug}`} className="group bg-white border border-stone-200 rounded-3xl p-6 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col">
                <h3 className="text-xl font-semibold text-stone-900">{k.title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{k.short}</p>
                <div className="mt-5 flex flex-wrap gap-1.5 text-[11px]">
                  <Chip><DollarSign className="w-3 h-3" /> ~${k.estInitial}</Chip>
                  <Chip><DollarSign className="w-3 h-3" /> {k.estMonthly ? `$${k.estMonthly}/mo` : 'No monthly'}</Chip>
                  <Chip><Wrench className="w-3 h-3" /> {k.installDifficulty}</Chip>
                  <Chip><Clock className="w-3 h-3" /> ~{k.installMinutes}m</Chip>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 group-hover:gap-2 transition-all">
                  View kit <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-3 gap-6">
          <ValueRow icon={<HeartHandshake className="w-5 h-5 text-emerald-700" />} title="Trusted, not sponsored" desc="We recommend what works — our editors pick every product." />
          <ValueRow icon={<ShieldCheck className="w-5 h-5 text-sky-700" />} title="Help one tap away" desc="Emergency response when it truly matters." />
          <ValueRow icon={<EyeOff className="w-5 h-5 text-amber-700" />} title="Privacy-first by default" desc="Camera-free alternatives always highlighted." />
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
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">What should you buy for your aging parent?</h3>
              <p className="mt-3 text-emerald-50/90 text-lg">Take the 2-minute assessment and get a kit built around your parent's life.</p>
            </div>
            <Link to="/labs/carekits/quiz" className="self-start inline-flex items-center gap-2 bg-white text-emerald-800 font-medium px-6 py-3.5 rounded-full hover:bg-emerald-50 shadow-lg transition-all hover:-translate-y-0.5">
              Start assessment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-2 py-1 rounded-full">{children}</span>;
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
