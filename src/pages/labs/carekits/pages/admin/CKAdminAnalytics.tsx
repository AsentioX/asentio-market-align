import { useEffect, useMemo, useState } from 'react';
import { fetchAllProducts, fetchClicksAdmin, fetchAssessmentsAdmin, fetchCategories } from '../../lib/api';
import type { Product, AssessmentResult, Category } from '../../lib/types';

export default function CKAdminAnalytics() {
  const [clicks, setClicks] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([fetchClicksAdmin(), fetchAllProducts(), fetchAssessmentsAdmin(), fetchCategories()])
      .then(([c, p, a, ct]) => { setClicks(c); setProducts(p); setAssessments(a); setCats(ct); });
  }, []);

  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const catById = useMemo(() => new Map(cats.map(c => [c.id, c])), [cats]);

  const clicksByProduct = useMemo(() => {
    const m = new Map<string, number>();
    clicks.forEach(c => { if (c.product_id) m.set(c.product_id, (m.get(c.product_id) ?? 0) + 1); });
    return Array.from(m.entries()).map(([id, n]) => ({ product: productById.get(id), count: n }))
      .filter(x => x.product).sort((a, b) => b.count - a.count).slice(0, 15);
  }, [clicks, productById]);

  const clicksByCategory = useMemo(() => {
    const m = new Map<string, number>();
    clicks.forEach(c => {
      const p = c.product_id ? productById.get(c.product_id) : null;
      if (p?.category_id) m.set(p.category_id, (m.get(p.category_id) ?? 0) + 1);
    });
    return Array.from(m.entries()).map(([id, n]) => ({ cat: catById.get(id), count: n }))
      .filter(x => x.cat).sort((a, b) => b.count - a.count);
  }, [clicks, productById, catById]);

  const recommendedCounts = useMemo(() => {
    const m = new Map<string, number>();
    assessments.forEach(a => a.recommended_product_ids?.forEach(id => m.set(id, (m.get(id) ?? 0) + 1)));
    return Array.from(m.entries()).map(([id, n]) => ({ product: productById.get(id), count: n }))
      .filter(x => x.product).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [assessments, productById]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Click analytics</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Total assessments" v={assessments.length} />
        <Stat label="Total clicks" v={clicks.length} />
        <Stat label="Clicks / assessment" v={assessments.length ? (clicks.length / assessments.length).toFixed(2) : '0'} />
      </div>

      <Section title="Most clicked products">
        <Bars rows={clicksByProduct.map(r => ({ label: `${r.product!.brand ? r.product!.brand + ' · ' : ''}${r.product!.name}`, value: r.count }))} />
      </Section>

      <Section title="Clicks by category">
        <Bars rows={clicksByCategory.map(r => ({ label: r.cat!.name, value: r.count }))} />
      </Section>

      <Section title="Most recommended products">
        <Bars rows={recommendedCounts.map(r => ({ label: r.product!.name, value: r.count }))} />
      </Section>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: any }) {
  return <div className="bg-white border border-stone-200 rounded-2xl p-5">
    <p className="text-sm text-stone-500">{label}</p>
    <p className="text-3xl font-semibold mt-1">{v}</p>
  </div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
    <h2 className="font-semibold mb-4">{title}</h2>
    {children}
  </section>;
}
function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  if (!rows.length) return <p className="text-sm text-stone-500">No data yet.</p>;
  return <div className="space-y-2">
    {rows.map((r, i) => (
      <div key={i} className="flex items-center gap-3 text-sm">
        <div className="w-56 truncate text-stone-700">{r.label}</div>
        <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${(r.value / max) * 100}%` }} />
        </div>
        <div className="w-10 text-right text-stone-600">{r.value}</div>
      </div>
    ))}
  </div>;
}
