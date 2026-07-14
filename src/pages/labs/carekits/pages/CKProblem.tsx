import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getProblem, KITS } from '../lib/kits';
import { fetchProductsByCategorySlugs } from '../lib/api';
import type { Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

export default function CKProblem() {
  const { slug } = useParams<{ slug: string }>();
  const problem = slug ? getProblem(slug) : undefined;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!problem) return;
    document.title = `${problem.title} · Smart Care Kits`;
    fetchProductsByCategorySlugs(problem.categories).then(setProducts);
  }, [problem]);

  if (!problem) {
    return <div className="max-w-3xl mx-auto px-5 py-20 text-center text-stone-500">Problem area not found. <Link to="/labs/carekits" className="text-emerald-700 underline">Back home</Link></div>;
  }

  const kits = KITS.filter(k => problem.relatedKits.includes(k.slug));

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-8 md:p-12">
        <span className="text-xs uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full">Problem area</span>
        <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">{problem.title}</h1>
        <p className="mt-3 text-emerald-50 max-w-2xl leading-relaxed">{problem.short}</p>
      </div>

      <section className="mt-10 max-w-3xl">
        <p className="text-stone-700 leading-relaxed">{problem.long}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-5">Recommended products</h2>
        {products.length === 0 ? (
          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-5 text-sm text-stone-600">Our editors are curating products for this area. Take the assessment for a personalized kit.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {kits.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl md:text-2xl font-semibold mb-5">Care Kits that help</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {kits.map(k => (
              <Link key={k.slug} to={`/labs/carekits/kits/${k.slug}`} className="group bg-white border border-stone-200 rounded-2xl p-5 hover:border-emerald-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-900">{k.title}</h3>
                  <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="mt-1 text-sm text-stone-600">{k.short}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 rounded-3xl bg-emerald-50 border border-emerald-100 p-8 md:p-10 text-center">
        <h3 className="text-2xl font-semibold text-emerald-900">Not sure which is right?</h3>
        <p className="mt-2 text-emerald-800/80">Take the 2-minute assessment to get a Care Kit tailored to your parent.</p>
        <Link to="/labs/carekits/quiz" className="mt-5 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6 py-3 rounded-full">
          Find my parent's Care Kit <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
