import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, DollarSign, Clock, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { getKit, PROBLEMS } from '../lib/kits';
import { fetchProductsByCategorySlugs } from '../lib/api';
import type { Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

export default function CKKitDetail() {
  const { slug } = useParams<{ slug: string }>();
  const kit = slug ? getKit(slug) : undefined;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!kit) return;
    document.title = `${kit.title} · Smart Care Kits`;
    fetchProductsByCategorySlugs(kit.categories).then(setProducts);
  }, [kit]);

  if (!kit) {
    return <div className="max-w-3xl mx-auto px-5 py-20 text-center text-stone-500">Kit not found. <Link to="/labs/carekits/kits" className="text-emerald-700 underline">Browse all kits</Link></div>;
  }

  const problems = PROBLEMS.filter(p => kit.problems.includes(p.slug));
  const actualInitial = products.reduce((s, p) => s + (p.price ?? 0), 0);
  const actualMonthly = products.reduce((s, p) => s + (p.monthly_cost ?? 0), 0);
  const initial = actualInitial > 0 ? actualInitial : kit.estInitial;
  const monthly = actualMonthly > 0 ? actualMonthly : kit.estMonthly;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-8 md:p-12">
        <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Care Kit
        </span>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">{kit.title}</h1>
        <p className="mt-3 text-emerald-50 max-w-2xl leading-relaxed">{kit.short}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>Confidence ★★★★★</Badge>
          <Badge><DollarSign className="w-3 h-3" /> ~${initial} initial</Badge>
          <Badge><DollarSign className="w-3 h-3" /> {monthly ? `~$${monthly.toFixed(0)}/mo` : 'No monthly fee'}</Badge>
          <Badge><Clock className="w-3 h-3" /> ~{kit.installMinutes} min setup</Badge>
          <Badge><Wrench className="w-3 h-3" /> {kit.installDifficulty}</Badge>
        </div>
      </div>

      <section className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Who this is for</h2>
          <p className="text-stone-700 leading-relaxed">{kit.who}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-stone-900 mb-3 inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-700" /> Problems it solves</h3>
          <ul className="space-y-2 text-sm">
            {problems.map(p => (
              <li key={p.slug}>
                <Link className="text-emerald-700 hover:underline" to={`/labs/carekits/problems/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-5">Products included</h2>
        {products.length === 0 ? (
          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-5 text-sm text-stone-600">We're curating the products for this kit — check back soon.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="mt-14 rounded-3xl bg-emerald-50 border border-emerald-100 p-8 md:p-10 text-center">
        <h3 className="text-2xl font-semibold text-emerald-900">Not sure this is the right kit?</h3>
        <p className="mt-2 text-emerald-800/80">Take the 2-minute assessment for a fully personalized recommendation.</p>
        <Link to="/labs/carekits/quiz" className="mt-5 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6 py-3 rounded-full">
          Find my parent's Care Kit <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 px-3 py-1.5 rounded-full">{children}</span>;
}
