import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { fetchCategories, fetchProduct, upsertProduct } from '../../lib/api';
import type { Category, Product } from '../../lib/types';
import { useToast } from '@/hooks/use-toast';

const empty: Partial<Product> = {
  name: '', brand: '', category_id: null, short_description: '', long_description: '',
  image_url: '', price: null, price_max: null, monthly_cost: null,
  affiliate_url: '', partner_name: '', setup_difficulty: 'easy', privacy_level: 'medium',
  requires_wearable: false, uses_camera: false, requires_subscription: false,
  best_for_tags: [], risk_tags: [], pros: [], cons: [],
  senior_comfort_score: 4, caregiver_peace_of_mind_score: 4, overall_score: 4,
  is_featured: false, is_published: false,
};

export default function CKAdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const [p, setP] = useState<Partial<Product>>(empty);
  const [cats, setCats] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories().then(setCats);
    if (!isNew) fetchProduct(id!).then(d => { if (d) setP(d); });
  }, [id, isNew]);

  function set<K extends keyof Product>(k: K, v: Product[K]) { setP(prev => ({ ...prev, [k]: v })); }
  function setTags(k: 'best_for_tags' | 'risk_tags' | 'pros' | 'cons', val: string) {
    set(k as any, val.split('\n').map(s => s.trim()).filter(Boolean));
  }

  async function save() {
    setBusy(true);
    try {
      await upsertProduct(p);
      toast({ title: 'Saved' });
      nav('/labs/carekits/admin/products');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Link to="/labs/carekits/admin/products" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-4">
        <ArrowLeft className="w-4 h-4" /> All products
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{isNew ? 'Add product' : 'Edit product'}</h1>
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-full text-sm">
          <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Basics">
            <Field label="Name"><Inp value={p.name ?? ''} onChange={v => set('name', v)} /></Field>
            <Field label="Brand"><Inp value={p.brand ?? ''} onChange={v => set('brand', v)} /></Field>
            <Field label="Category">
              <select value={p.category_id ?? ''} onChange={e => set('category_id', e.target.value || null as any)} className={inp}>
                <option value="">—</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Short description"><Inp value={p.short_description ?? ''} onChange={v => set('short_description', v)} /></Field>
            <Field label="Long description"><TA value={p.long_description ?? ''} onChange={v => set('long_description', v)} rows={6} /></Field>
            <Field label="Image URL"><Inp value={p.image_url ?? ''} onChange={v => set('image_url', v)} /></Field>
          </Card>

          <Card title="Pricing & affiliate">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Price"><Num value={p.price} onChange={v => set('price', v)} /></Field>
              <Field label="Price max (range)"><Num value={p.price_max} onChange={v => set('price_max', v)} /></Field>
              <Field label="Monthly cost"><Num value={p.monthly_cost} onChange={v => set('monthly_cost', v)} /></Field>
            </div>
            <Field label="Affiliate URL"><Inp value={p.affiliate_url ?? ''} onChange={v => set('affiliate_url', v)} /></Field>
            <Field label="Retail partner name"><Inp value={p.partner_name ?? ''} onChange={v => set('partner_name', v)} /></Field>
          </Card>

          <Card title="Tags">
            <Field label="Best for (one per line)"><TA value={(p.best_for_tags ?? []).join('\n')} onChange={v => setTags('best_for_tags', v)} /></Field>
            <Field label="Risk tags addressed (one per line)"><TA value={(p.risk_tags ?? []).join('\n')} onChange={v => setTags('risk_tags', v)} /></Field>
            <Field label="Pros (one per line)"><TA value={(p.pros ?? []).join('\n')} onChange={v => setTags('pros', v)} /></Field>
            <Field label="Cons (one per line)"><TA value={(p.cons ?? []).join('\n')} onChange={v => setTags('cons', v)} /></Field>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Publishing">
            <Toggle label="Published" v={!!p.is_published} onChange={v => set('is_published', v)} />
            <Toggle label="Featured" v={!!p.is_featured} onChange={v => set('is_featured', v)} />
          </Card>
          <Card title="Attributes">
            <Field label="Setup difficulty">
              <select value={p.setup_difficulty ?? 'easy'} onChange={e => set('setup_difficulty', e.target.value as any)} className={inp}>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="professional">Professional</option>
              </select>
            </Field>
            <Field label="Privacy level">
              <select value={p.privacy_level ?? 'medium'} onChange={e => set('privacy_level', e.target.value as any)} className={inp}>
                <option value="high">High (privacy-first)</option>
                <option value="medium">Medium</option>
                <option value="low">Low (camera / cloud)</option>
              </select>
            </Field>
            <Toggle label="Requires wearable" v={!!p.requires_wearable} onChange={v => set('requires_wearable', v)} />
            <Toggle label="Uses camera" v={!!p.uses_camera} onChange={v => set('uses_camera', v)} />
            <Toggle label="Requires subscription" v={!!p.requires_subscription} onChange={v => set('requires_subscription', v)} />
          </Card>
          <Card title="Scores (1–5)">
            <Field label="Senior comfort"><Num value={p.senior_comfort_score} onChange={v => set('senior_comfort_score', v)} /></Field>
            <Field label="Caregiver peace of mind"><Num value={p.caregiver_peace_of_mind_score} onChange={v => set('caregiver_peace_of_mind_score', v)} /></Field>
            <Field label="Overall recommendation"><Num value={p.overall_score} onChange={v => set('overall_score', v)} /></Field>
          </Card>
        </div>
      </div>
    </div>
  );
}

const inp = 'w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm';
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="bg-white rounded-2xl border border-stone-200 p-5"><h2 className="font-semibold mb-3">{title}</h2><div className="space-y-3">{children}</div></section>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="text-stone-500 text-xs uppercase tracking-wide block mb-1">{label}</span>{children}</label>;
}
function Inp({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} className={inp} />;
}
function TA({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className={inp} />;
}
function Num({ value, onChange }: { value: number | null | undefined; onChange: (v: number | null) => void }) {
  return <input type="number" step="0.01" value={value ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))} className={inp} />;
}
function Toggle({ label, v, onChange }: { label: string; v: boolean; onChange: (v: boolean) => void }) {
  return <label className="flex items-center justify-between text-sm py-1.5">
    <span>{label}</span>
    <input type="checkbox" checked={v} onChange={e => onChange(e.target.checked)} className="rounded text-emerald-600" />
  </label>;
}
