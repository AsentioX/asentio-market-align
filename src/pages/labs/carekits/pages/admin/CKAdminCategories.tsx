import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { deleteCategory, fetchCategories, upsertCategory } from '../../lib/api';
import type { Category } from '../../lib/types';
import { useToast } from '@/hooks/use-toast';

export default function CKAdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const { toast } = useToast();

  async function load() { setCats(await fetchCategories()); }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!name || !slug) return;
    try {
      await upsertCategory({ name, slug, sort_order: cats.length + 1 });
      setName(''); setSlug('');
      load();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  }
  async function save(c: Category) {
    await upsertCategory(c);
    toast({ title: 'Saved' });
  }
  async function remove(id: string) {
    if (!confirm('Delete category?')) return;
    await deleteCategory(id);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Categories</h1>

      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 flex flex-col sm:flex-row gap-2">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-stone-200" />
        <input placeholder="slug" value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-stone-200" />
        <button onClick={add} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {cats.map(c => (
          <div key={c.id} className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center gap-2">
            <input value={c.name} onChange={e => setCats(s => s.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))} className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm" />
            <input value={c.slug} onChange={e => setCats(s => s.map(x => x.id === c.id ? { ...x, slug: e.target.value } : x))} className="w-44 px-3 py-2 rounded-lg border border-stone-200 text-sm" />
            <input type="number" value={c.sort_order} onChange={e => setCats(s => s.map(x => x.id === c.id ? { ...x, sort_order: Number(e.target.value) } : x))} className="w-20 px-3 py-2 rounded-lg border border-stone-200 text-sm" />
            <button onClick={() => save(c)} className="text-stone-500 hover:text-emerald-700"><Save className="w-4 h-4" /></button>
            <button onClick={() => remove(c.id)} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
