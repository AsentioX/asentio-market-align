import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchArticleBySlug } from '../lib/api';
import type { Article } from '../lib/types';

export default function CKArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchArticleBySlug(slug).then(a => {
      if (!a || !a.is_published) { setMissing(true); return; }
      setArticle(a);
      document.title = `${a.title} · Smart Care Kits`;
    });
  }, [slug]);

  if (missing) return (
    <div className="max-w-2xl mx-auto px-5 py-20 text-center">
      <p className="text-stone-600 mb-4">Article not found.</p>
      <Link to="/labs/carekits" className="text-emerald-700 underline">Back home</Link>
    </div>
  );
  if (!article) return <div className="max-w-2xl mx-auto px-5 py-20 text-stone-500 text-center">Loading…</div>;

  return (
    <article className="max-w-3xl mx-auto px-5 py-12">
      <Link to="/labs/carekits" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>
      <h1 className="text-4xl font-semibold tracking-tight">{article.title}</h1>
      {article.summary && <p className="mt-3 text-lg text-stone-600 leading-relaxed">{article.summary}</p>}
      {article.cover_image_url && (
        <img src={article.cover_image_url} alt={article.title} className="mt-6 rounded-3xl border border-stone-200 w-full" />
      )}
      <div className="mt-8 prose prose-stone max-w-none whitespace-pre-line">{article.body}</div>
    </article>
  );
}
