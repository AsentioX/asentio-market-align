import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { fetchAllProducts, deleteProduct } from '../../lib/api';
import type { Product } from '../../lib/types';
import { useToast } from '@/hooks/use-toast';

export default function CKAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    setProducts(await fetchAllProducts());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || (p.brand ?? '').toLowerCase().includes(q.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast({ title: 'Deleted' });
      load();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link to="/labs/carekits/admin/products/new" className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm">
          <Plus className="w-4 h-4" /> Add product
        </Link>
      </div>

      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search by name or brand"
        className="w-full max-w-md mb-4 px-4 py-2 rounded-full border border-stone-200 bg-white"
      />

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Affiliate</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-6 text-center text-stone-500">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-stone-500">No products yet.</td></tr>}
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-stone-100">
                <td className="px-4 py-3 font-medium">{p.name}{p.is_featured && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Featured</span>}</td>
                <td className="px-4 py-3 text-stone-600">{p.brand ?? '—'}</td>
                <td className="px-4 py-3">{p.price != null ? `$${p.price}` : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.affiliate_url
                    ? <a href={p.affiliate_url} target="_blank" rel="noopener" className="text-emerald-700 hover:underline inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Link</a>
                    : <span className="text-amber-700 text-xs">Missing</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/labs/carekits/admin/products/${p.id}`} className="text-stone-500 hover:text-stone-900 inline-block mr-2"><Pencil className="w-4 h-4" /></Link>
                  <button onClick={() => handleDelete(p.id)} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
