import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Mail, DollarSign, Clock, Wrench, Star } from 'lucide-react';
import { fetchAssessment, fetchProductsByCategorySlugs, fetchCategories } from '../lib/api';
import type { AssessmentResult, Product, Category } from '../lib/types';
import { ProductCard } from '../components/ProductCard';
import { AffiliateDisclosure } from '../components/Disclosure';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function CKResults() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    document.title = 'Your personalized care kit · Smart Care Kits';
    (async () => {
      const r = await fetchAssessment(id);
      if (!r) return;
      setResult(r);
      const [ps, cats] = await Promise.all([
        fetchProductsByCategorySlugs(r.recommended_categories),
        fetchCategories(),
      ]);
      setProducts(ps);
      setCategories(cats);
    })();
  }, [id]);

  if (!result) {
    return <div className="max-w-3xl mx-auto px-5 py-20 text-center text-stone-500">Loading your recommendations…</div>;
  }

  const catBySlug = new Map(categories.map(c => [c.slug, c]));
  const grouped = result.recommended_categories.map(slug => ({
    cat: catBySlug.get(slug),
    slug,
    items: products.filter(p => {
      const c = categories.find(c => c.id === p.category_id);
      return c?.slug === slug;
    }),
  }));

  const privacyFirst = result.privacy_preference_score >= 4;

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const { error } = await (supabase as any).from('ck_assessment_results').update({ email }).eq('id', result!.id);
    if (error) { toast({ title: 'Could not save', description: error.message, variant: 'destructive' }); return; }
    setSaved(true);
    toast({ title: 'Results saved', description: 'Bookmark this page to come back later.' });
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-8 md:p-12">
        <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Your recommended kit
        </span>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">{result.kit_name}</h1>
        <p className="mt-3 text-emerald-50 max-w-2xl leading-relaxed">
          Based on what you shared, here's a kit built for {privacyFirst ? 'privacy-first peace of mind' : 'calm everyday safety'}.
          You'll see why each product fits — and which ones to skip.
        </p>
      </div>

      {/* Kit meta card */}
      <KitMetaCard products={products} privacyFirst={privacyFirst} techComfort={result.tech_comfort_score} />

      {/* Risk profile */}
      <section className="mt-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Your safety profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Fall risk" v={result.fall_risk_score} />
          <Stat label="Medication risk" v={result.medication_risk_score} />
          <Stat label="Cognitive risk" v={result.cognitive_risk_score} />
          <Stat label="Home safety" v={result.home_safety_risk_score} />
        </div>
        {result.risk_tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {result.risk_tags.map(t => (
              <span key={t} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </section>

      {/* Recommended categories */}
      <section className="mt-12 space-y-10">
        {grouped.map(g => (
          <div key={g.slug}>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-lg md:text-xl font-semibold text-stone-900">{g.cat?.name ?? g.slug}</h3>
              {g.cat?.description && <p className="text-sm text-stone-500 hidden md:block">{g.cat.description}</p>}
            </div>
            {g.items.length === 0 ? (
              <div className="bg-stone-100 border border-stone-200 rounded-2xl p-5 text-sm text-stone-600">
                We don't have a published recommendation in this category yet. Check back soon.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {g.items.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    why={whyForProduct(p, result)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Privacy alternatives note */}
      {!privacyFirst && grouped.some(g => g.slug === 'camera') && (
        <div className="mt-10 rounded-3xl border border-sky-200 bg-sky-50 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-sky-700 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sky-900">Privacy-first alternatives</h4>
              <p className="text-sm text-sky-900/80 mt-1">If cameras feel intrusive, radar fall detection and WiFi presence sensors offer similar peace of mind without recording video.</p>
            </div>
          </div>
        </div>
      )}

      {/* Email save */}
      <section className="mt-12 rounded-3xl bg-white border border-stone-200 p-6 md:p-8">
        <div className="flex items-center gap-2 text-emerald-700 mb-2"><Mail className="w-5 h-5" /> Save these results</div>
        <h3 className="text-xl font-semibold">Send your kit to your email</h3>
        <p className="text-sm text-stone-600 mt-1">We'll save it so you can come back, share with siblings, or print for your parent.</p>
        <form onSubmit={handleSaveEmail} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 px-4 py-3 rounded-full border border-stone-200 focus:border-emerald-500 focus:outline-none"
          />
          <button className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-3 rounded-full">
            {saved ? 'Saved ✓' : 'Save my results'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <Link to="/labs/carekits/marketplace" className="text-sm font-medium text-emerald-700 hover:underline">Or browse the full marketplace →</Link>
      </div>
      <div className="mt-8"><AffiliateDisclosure /></div>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: number }) {
  const pct = (v / 5) * 100;
  const tone = v >= 4 ? 'bg-rose-500' : v >= 2 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-2xl font-semibold mt-1 text-stone-900">{v}<span className="text-base text-stone-400">/5</span></p>
      <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function whyForProduct(p: Product, r: AssessmentResult): string {
  const reasons: string[] = [];
  if (p.risk_tags?.some(t => r.risk_tags.includes(t))) {
    const matched = p.risk_tags.filter(t => r.risk_tags.includes(t)).slice(0, 2);
    reasons.push(`addresses ${matched.join(' & ')}`);
  }
  if (r.privacy_preference_score >= 4 && p.privacy_level === 'high') reasons.push('privacy-first');
  if (r.tech_comfort_score <= 2 && p.setup_difficulty === 'easy') reasons.push('simple to set up');
  if (!reasons.length) reasons.push('a good baseline fit for your kit');
  return reasons.join(', ');
}
