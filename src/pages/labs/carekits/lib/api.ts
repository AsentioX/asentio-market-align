import { supabase } from '@/integrations/supabase/client';
import type { Category, Product, AssessmentResult, Article } from './types';

const db = supabase as any;

export async function fetchPublishedProducts(): Promise<Product[]> {
  const { data, error } = await db.from('ck_products').select('*').eq('is_published', true).order('is_featured', { ascending: false }).order('overall_score', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await db.from('ck_products').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await db.from('ck_products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Product | null;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await db.from('ck_categories').select('*').order('sort_order');
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const { data, error } = await db.from('ck_products').select('*').in('id', ids).eq('is_published', true);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchProductsByCategorySlugs(slugs: string[]): Promise<Product[]> {
  if (!slugs.length) return [];
  const { data: cats } = await db.from('ck_categories').select('id, slug').in('slug', slugs);
  const ids = (cats ?? []).map((c: any) => c.id);
  if (!ids.length) return [];
  const { data, error } = await db.from('ck_products').select('*').in('category_id', ids).eq('is_published', true);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function saveAssessment(payload: Partial<AssessmentResult>): Promise<AssessmentResult> {
  const { data, error } = await db.from('ck_assessment_results').insert(payload).select('*').single();
  if (error) throw error;
  return data as AssessmentResult;
}

export async function fetchAssessment(id: string): Promise<AssessmentResult | null> {
  const { data, error } = await db.from('ck_assessment_results').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as AssessmentResult | null;
}

export async function recordOutboundClick(payload: {
  product_id: string;
  affiliate_url: string;
  partner_name?: string | null;
  assessment_result_id?: string | null;
  user_email?: string | null;
}) {
  await db.from('ck_outbound_clicks').insert(payload);
}

// Admin
export async function upsertProduct(p: Partial<Product>) {
  if (p.id) {
    const { error } = await db.from('ck_products').update(p).eq('id', p.id);
    if (error) throw error;
  } else {
    const { error } = await db.from('ck_products').insert(p);
    if (error) throw error;
  }
}
export async function deleteProduct(id: string) {
  const { error } = await db.from('ck_products').delete().eq('id', id);
  if (error) throw error;
}
export async function upsertCategory(c: Partial<Category>) {
  if (c.id) await db.from('ck_categories').update(c).eq('id', c.id);
  else await db.from('ck_categories').insert(c);
}
export async function deleteCategory(id: string) {
  await db.from('ck_categories').delete().eq('id', id);
}
export async function fetchAssessmentsAdmin(): Promise<AssessmentResult[]> {
  const { data } = await db.from('ck_assessment_results').select('*').order('created_at', { ascending: false }).limit(200);
  return (data ?? []) as AssessmentResult[];
}
export async function fetchClicksAdmin(): Promise<any[]> {
  const { data } = await db.from('ck_outbound_clicks').select('*, ck_products(name, brand, partner_name, affiliate_url)').order('clicked_at', { ascending: false }).limit(500);
  return data ?? [];
}
export async function fetchArticles(): Promise<Article[]> {
  const { data } = await db.from('ck_articles').select('*').order('updated_at', { ascending: false });
  return (data ?? []) as Article[];
}
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data } = await db.from('ck_articles').select('*').eq('slug', slug).maybeSingle();
  return (data ?? null) as Article | null;
}
export async function upsertArticle(a: Partial<Article>) {
  if (a.id) await db.from('ck_articles').update(a).eq('id', a.id);
  else await db.from('ck_articles').insert(a);
}
export async function deleteArticle(id: string) {
  await db.from('ck_articles').delete().eq('id', id);
}
