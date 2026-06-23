import { Link } from 'react-router-dom';
import { Shield, Wrench, ArrowRight, Star } from 'lucide-react';
import type { Product } from '../lib/types';
import { fmtPrice, privacyLabel, setupLabel } from '../lib/format';

export function ProductCard({ product, why }: { product: Product; why?: string }) {
  return (
    <Link
      to={`/labs/carekits/product/${product.id}`}
      className="group flex flex-col bg-white rounded-3xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-emerald-50 to-sky-50 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">No image</div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="uppercase tracking-wide">{product.brand ?? 'Partner brand'}</span>
          {product.overall_score != null && (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
              {product.overall_score}/5
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-stone-900 leading-tight">{product.name}</h3>
        <p className="text-sm text-stone-600 line-clamp-2">{product.short_description ?? ''}</p>
        {why && (
          <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-3 py-2 leading-relaxed">
            <strong className="font-semibold">Why we recommend it: </strong>{why}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {product.privacy_level && (
            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-100 px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" /> {privacyLabel[product.privacy_level]}
            </span>
          )}
          {product.setup_difficulty && (
            <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-2 py-1 rounded-full">
              <Wrench className="w-3 h-3" /> {setupLabel[product.setup_difficulty]}
            </span>
          )}
          {product.best_for_tags.slice(0, 2).map(t => (
            <span key={t} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full">{t}</span>
          ))}
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-stone-100">
          <div className="text-stone-900">
            <span className="font-semibold">{fmtPrice(product.price, product.price_max)}</span>
            {product.monthly_cost != null && product.monthly_cost > 0 && (
              <span className="text-xs text-stone-500"> · ${product.monthly_cost.toFixed(0)}/mo</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 group-hover:gap-2 transition-all">
            View product <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
