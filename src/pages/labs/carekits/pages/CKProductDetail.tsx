import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, X as XIcon, Shield, Wrench, Heart, Smile } from 'lucide-react';
import { fetchProduct, fetchCategories, recordOutboundClick } from '../lib/api';
import type { Product, Category } from '../lib/types';
import { AffiliateDisclosure, MedicalDisclaimer } from '../components/Disclosure';
import { fmtPrice, privacyLabel, setupLabel } from '../lib/format';

export default function CKProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const p = await fetchProduct(id);
      setProduct(p);
      if (p) {
        document.title = `${p.name} · Smart Care Kits`;
        if (p.category_id) {
          const cats = await fetchCategories();
          setCategory(cats.find(c => c.id === p.category_id) ?? null);
        }
      }
    })();
  }, [id]);

  if (!product) return <div className="max-w-3xl mx-auto px-5 py-20 text-stone-500 text-center">Loading…</div>;

  function handleBuy() {
    if (!product || !product.affiliate_url) return;
    let assessmentId: string | null = null;
    try { assessmentId = localStorage.getItem('ck:lastAssessment'); } catch {}
    recordOutboundClick({
      product_id: product.id,
      affiliate_url: product.affiliate_url,
      partner_name: product.partner_name,
      assessment_result_id: assessmentId,
    }).catch(() => {});
    window.open(product.affiliate_url, '_blank', 'noopener');
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <Link to="/labs/carekits/marketplace" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-[4/5] bg-gradient-to-br from-emerald-50 to-sky-50 rounded-3xl overflow-hidden border border-stone-200">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-stone-300">No image</div>
          )}
        </div>

        <div>
          {category && <p className="text-sm text-emerald-700 font-medium">{category.name}</p>}
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mt-1">{product.name}</h1>
          {product.brand && <p className="text-stone-500 mt-1">by {product.brand}</p>}

          <p className="mt-4 text-stone-700 leading-relaxed">{product.short_description}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {product.privacy_level && (
              <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" /> {privacyLabel[product.privacy_level]}
              </span>
            )}
            {product.setup_difficulty && (
              <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full">
                <Wrench className="w-3.5 h-3.5" /> {setupLabel[product.setup_difficulty]}
              </span>
            )}
            {product.requires_subscription && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full">Subscription required</span>
            )}
            {product.uses_camera && (
              <span className="bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full">Includes camera</span>
            )}
            {product.requires_wearable && (
              <span className="bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full">Wearable device</span>
            )}
          </div>

          <div className="mt-7 p-5 rounded-3xl border border-emerald-200 bg-emerald-50/60">
            <div className="text-3xl font-semibold text-stone-900">{fmtPrice(product.price, product.price_max)}</div>
            {product.monthly_cost != null && product.monthly_cost > 0 && (
              <div className="text-sm text-stone-600 mt-1">+ ${product.monthly_cost.toFixed(0)}/month service</div>
            )}
            <button
              onClick={handleBuy}
              disabled={!product.affiliate_url}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-5 py-3 rounded-full"
            >
              Buy from {product.partner_name ?? 'partner'} <ArrowUpRight className="w-4 h-4" />
            </button>
            <p className="mt-3 text-xs text-stone-500">Opens the partner's site in a new tab.</p>
          </div>

          {/* Scores */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {product.senior_comfort_score != null && (
              <Score icon={<Smile className="w-4 h-4" />} label="Senior comfort" v={product.senior_comfort_score} />
            )}
            {product.caregiver_peace_of_mind_score != null && (
              <Score icon={<Heart className="w-4 h-4" />} label="Caregiver peace of mind" v={product.caregiver_peace_of_mind_score} />
            )}
          </div>
        </div>
      </div>

      {/* Long description */}
      {product.long_description && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-semibold mb-3">Why we recommend it</h2>
          <p className="text-stone-700 leading-relaxed whitespace-pre-line">{product.long_description}</p>
        </section>
      )}

      {/* Pros / cons */}
      {(product.pros.length > 0 || product.cons.length > 0) && (
        <section className="mt-10 grid md:grid-cols-2 gap-5 max-w-3xl">
          <ProsCons title="Pros" items={product.pros} positive />
          <ProsCons title="Things to consider" items={product.cons} />
        </section>
      )}

      {/* Best for / risks */}
      {(product.best_for_tags.length > 0 || product.risk_tags.length > 0) && (
        <section className="mt-10 max-w-3xl">
          {product.best_for_tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm uppercase tracking-wide text-stone-500 mb-2">Best for</h3>
              <div className="flex flex-wrap gap-2">{product.best_for_tags.map(t => <span key={t} className="text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full">{t}</span>)}</div>
            </div>
          )}
          {product.risk_tags.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-wide text-stone-500 mb-2">Addresses</h3>
              <div className="flex flex-wrap gap-2">{product.risk_tags.map(t => <span key={t} className="text-sm bg-sky-50 text-sky-800 border border-sky-100 px-3 py-1 rounded-full">{t}</span>)}</div>
            </div>
          )}
        </section>
      )}

      <div className="mt-12 space-y-2">
        <AffiliateDisclosure />
        <MedicalDisclaimer />
      </div>
    </div>
  );
}

function Score({ icon, label, v }: { icon: React.ReactNode; label: string; v: number }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      <div className="flex items-center gap-1.5 text-stone-500 text-xs">{icon}{label}</div>
      <div className="text-xl font-semibold mt-1">{v}<span className="text-sm text-stone-400">/5</span></div>
    </div>
  );
}

function ProsCons({ title, items, positive }: { title: string; items: string[]; positive?: boolean }) {
  if (!items.length) return null;
  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 text-sm text-stone-700">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            {positive
              ? <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              : <XIcon className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />}
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
