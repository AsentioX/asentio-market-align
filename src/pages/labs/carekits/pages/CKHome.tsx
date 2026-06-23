import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, EyeOff, HeartHandshake, Sparkles } from 'lucide-react';
import { fetchPublishedProducts } from '../lib/api';
import type { Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

export default function CKHome() {
  const [featured, setFeatured] = useState<Product[]>([]);
  useEffect(() => {
    document.title = 'Smart Care Kits — Help your parent age safely at home';
    fetchPublishedProducts().then(ps => setFeatured(ps.filter(p => p.is_featured).slice(0, 6)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-stone-50 to-sky-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" /> A calmer, helpful home — not surveillance
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-stone-900">
              Peace of mind for the people you love.
            </h1>
            <p className="mt-5 text-lg text-stone-600 leading-relaxed max-w-xl">
              Take a 2-minute assessment about your parent's daily life. We'll recommend a curated
              kit of devices — chosen for safety, privacy, and how they actually live.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/labs/carekits/quiz" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-medium px-5 py-3 rounded-full">
                Start the assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/labs/carekits/marketplace" className="inline-flex items-center gap-2 bg-white text-stone-800 border border-stone-200 hover:border-emerald-300 text-base font-medium px-5 py-3 rounded-full">
                Browse the marketplace
              </Link>
            </div>
            <p className="mt-5 text-sm text-stone-500">Free · No account needed to start · Privacy-first recommendations</p>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[2.5rem] bg-white border border-stone-200 shadow-xl overflow-hidden grid grid-rows-3">
              <Tile color="bg-emerald-100" icon={<HeartHandshake className="w-7 h-7 text-emerald-700" />} title="Stay connected" desc="Gentle daily check-ins, not constant monitoring." />
              <Tile color="bg-sky-100" icon={<ShieldCheck className="w-7 h-7 text-sky-700" />} title="Help is one tap away" desc="Emergency response when it matters most." />
              <Tile color="bg-amber-100" icon={<EyeOff className="w-7 h-7 text-amber-700" />} title="Privacy-first by default" desc="Camera-free options highlighted." />
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">How it works</h2>
        <p className="text-stone-600 max-w-2xl mb-10">No fear-based pitches. Just clear, personalized recommendations from trusted partners — so you can make a confident choice.</p>
        <ol className="grid md:grid-cols-3 gap-5">
          {[
            { n: '1', t: 'Take the assessment', d: '12 short questions about your parent\'s routine and preferences.' },
            { n: '2', t: 'See your personalized kit', d: 'A care kit tailored to fall risk, privacy, budget, and tech comfort.' },
            { n: '3', t: 'Buy from trusted partners', d: 'We\'ve done the curating. You decide what to add to your home.' },
          ].map(s => (
            <li key={s.n} className="bg-white rounded-3xl p-6 border border-stone-200">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white grid place-items-center font-semibold mb-4">{s.n}</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-1">{s.t}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 pb-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Featured products</h2>
            <Link to="/labs/carekits/marketplace" className="text-sm font-medium text-emerald-700 hover:underline inline-flex items-center gap-1">
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
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-10 md:p-14 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">Not sure where to start?</h3>
            <p className="mt-2 text-emerald-50">Take the 2-minute assessment and get a kit built around your parent's life.</p>
          </div>
          <Link to="/labs/carekits/quiz" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-medium px-5 py-3 rounded-full hover:bg-emerald-50">
            Start now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Tile({ color, icon, title, desc }: { color: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 flex gap-4 items-start border-b last:border-b-0 border-stone-100">
      <div className={`w-14 h-14 rounded-2xl ${color} grid place-items-center shrink-0`}>{icon}</div>
      <div>
        <h4 className="font-semibold text-stone-900">{title}</h4>
        <p className="text-sm text-stone-600 mt-1">{desc}</p>
      </div>
    </div>
  );
}
