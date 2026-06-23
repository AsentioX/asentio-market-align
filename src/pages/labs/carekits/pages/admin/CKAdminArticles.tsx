import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { deleteArticle, fetchArticles, upsertArticle } from '../../lib/api';
import type { Article } from '../../lib/types';
import { useToast } from '@/hooks/use-toast';

const empty: Partial<Article> = { title: '', slug: '', summary: '', body: '', cover_image_url: '', related_categories: [], is_published: false };

export default function CKAdminArticles() {
  const [items, setItems] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const { toast } = useToast();

  async function load() { setItems(await fetchArticles()); }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing?.slug) return;
    try {
      await upsertArticle(editing);
      toast({ title: 'Saved' });
      setEditing(null); load();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm">
          <Plus className="w-4 h-4" /> New article
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6 space-y-3">
          <input placeholder="Title" value={editing.title ?? ''} onChange={e => setEditing(s => ({ ...s, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200" />
          <input placeholder="slug (used in URL)" value={editing.slug ?? ''} onChange={e => setEditing(s => ({ ...s, slug: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200" />
          <input placeholder="Cover image URL" value={editing.cover_image_url ?? ''} onChange={e => setEditing(s => ({ ...s, cover_image_url: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200" />
          <textarea placeholder="Summary" value={editing.summary ?? ''} onChange={e => setEditing(s => ({ ...s, summary: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200" rows={2} />
          <textarea placeholder="Body (plain text or markdown)" value={editing.body ?? ''} onChange={e => setEditing(s => ({ ...s, body: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono text-sm" rows={10} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.is_published} onChange={e => setEditing(s => ({ ...s, is_published: e.target.checked }))} className="rounded text-emerald-600" /> Published</label>
          <div className="flex gap-2">
            <button onClick={save} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm"><Save className="w-4 h-4" /> Save</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-stone-500">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(a => (
          <div key={a.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-stone-500">/labs/carekits/learn/{a.slug}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${a.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
              {a.is_published ? 'Published' : 'Draft'}
            </span>
            <button onClick={() => setEditing(a)} className="text-stone-500 hover:text-stone-900 text-sm">Edit</button>
            <button onClick={async () => { if (confirm('Delete?')) { await deleteArticle(a.id); load(); } }} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
