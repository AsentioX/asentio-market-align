import { useEffect, useMemo, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { fetchCategories, fetchPublishedProducts } from '../lib/api';
import type { Category, Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

export default function CKMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catId, setCatId] = useState<string>('');
  const [privacyFirst, setPrivacyFirst] = useState(false);
  const [noCamera, setNoCamera] = useState(false);
  const [noWearable, setNoWearable] = useState(false);
  const [easy, setEasy] = useState(false);
  const [noSub, setNoSub] = useState(false);
  const [budget, setBudget] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [riskTag, setRiskTag] = useState('');

  useEffect(() => {
    document.title = 'Marketplace · Smart Care Kits';
    Promise.all([fetchPublishedProducts(), fetchCategories()]).then(([p, c]) => {
      setProducts(p); setCategories(c);
    });
  }, []);

  const allRisk = useMemo(() => {
    const s = new Set<string>();
    products.forEach(p => p.risk_tags.forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [products]);

  const filtered = useMemo(() => products.filter(p => {
    if (catId && p.category_id !== catId) return false;
    if (privacyFirst && p.privacy_level !== 'high') return false;
    if (noCamera && p.uses_camera) return false;
    if (noWearable && p.requires_wearable) return false;
    if (easy && p.setup_difficulty !== 'easy') return false;
    if (noSub && p.requires_subscription) return false;
    if (riskTag && !p.risk_tags.includes(riskTag)) return false;
    if (budget !== 'all') {
      const price = p.price ?? 0;
      if (budget === 'low' && price > 300) return false;
      if (budget === 'mid' && (price < 200 || price > 800)) return false;
      if (budget === 'high' && price < 600) return false;
    }
    return true;
  }), [products, catId, privacyFirst, noCamera, noWearable, easy, noSub, budget, riskTag]);

  const anyFilter = catId || privacyFirst || noCamera || noWearable || easy || noSub || riskTag || budget !== 'all';

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Curated marketplace</h1>
        <p className="mt-2 text-stone-600 max-w-2xl">Every product here was reviewed for senior comfort, privacy, and caregiver peace of mind. We earn referrals if you buy — never paid placement.</p>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="lg:sticky lg:top-20 self-start bg-white rounded-3xl border border-stone-200 p-5 space-y-5 text-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold inline-flex items-center gap-1.5"><Filter className="w-4 h-4" /> Filters</h3>
            {anyFilter && (
              <button onClick={() => { setCatId(''); setPrivacyFirst(false); setNoCamera(false); setNoWearable(false); setEasy(false); setNoSub(false); setBudget('all'); setRiskTag(''); }} className="text-xs text-stone-500 inline-flex items-center gap-1 hover:text-stone-800">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-stone-500 mb-1">Category</label>
            <select value={catId} onChange={e => setCatId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white">
              <option value="">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-stone-500 mb-1">Risk addressed</label>
            <select value={riskTag} onChange={e => setRiskTag(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white">
              <option value="">Any</option>
              {allRisk.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-stone-500 mb-1">Budget</label>
            <select value={budget} onChange={e => setBudget(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white">
              <option value="all">Any budget</option>
              <option value="low">Under $300</option>
              <option value="mid">$200 – $800</option>
              <option value="high">$600+</option>
            </select>
          </div>
          <div className="space-y-2">
            <Toggle on={privacyFirst} onChange={setPrivacyFirst}>Privacy-first only</Toggle>
            <Toggle on={noCamera} onChange={setNoCamera}>No camera</Toggle>
            <Toggle on={noWearable} onChange={setNoWearable}>No wearable required</Toggle>
            <Toggle on={easy} onChange={setEasy}>Easy setup</Toggle>
            <Toggle on={noSub} onChange={setNoSub}>No subscription</Toggle>
          </div>
        </aside>

        <section>
          <p className="text-sm text-stone-500 mb-4">{filtered.length} products</p>
          {filtered.length === 0 ? (
            <div className="bg-stone-100 border border-stone-200 rounded-3xl p-10 text-center text-stone-600">
              No products match those filters yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={on} onChange={e => onChange(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
      <span>{children}</span>
    </label>
  );
}
