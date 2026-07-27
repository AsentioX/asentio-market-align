import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/* ------------------------------------------------------------------ */
/* Articles (Insights + Research)                                      */
/* ------------------------------------------------------------------ */

export interface AsentioArticle {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  hero_image_url: string | null;
  author: string;
  published_at: string | null;
  kind: string;
  categories: string[];
  tags: string[];
  related_company_ids: string[];
  related_directory_categories: string[];
  seo_title: string | null;
  seo_description: string | null;
  is_gated: boolean;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useArticles = (kind: 'insight' | 'research' | 'all' = 'insight', limit?: number) => {
  return useQuery({
    queryKey: ['asentio-articles', kind, limit],
    queryFn: async () => {
      let query = supabase
        .from('asentio_articles')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false, nullsFirst: false });

      if (kind !== 'all') query = query.eq('kind', kind);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AsentioArticle[];
    },
  });
};

export const useArticle = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['asentio-article', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asentio_articles')
        .select('*')
        .eq('slug', slug!)
        .maybeSingle();
      if (error) throw error;
      return data as AsentioArticle | null;
    },
  });
};

export const useUpdateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AsentioArticle> }) => {
      const { error } = await supabase.from('asentio_articles').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asentio-articles'] });
      qc.invalidateQueries({ queryKey: ['asentio-article'] });
    },
  });
};

/* ------------------------------------------------------------------ */
/* Newsletter subscribers                                              */
/* ------------------------------------------------------------------ */

export interface SubscriberInput {
  email: string;
  first_name?: string | null;
  company?: string | null;
  role?: string | null;
  source?: string;
}

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (input: SubscriberInput) => {
      const { error } = await supabase.from('asentio_subscribers').insert({
        email: input.email.trim().toLowerCase(),
        first_name: input.first_name || null,
        company: input.company || null,
        role: input.role || null,
        source: input.source || 'website',
      });
      // Treat a duplicate email as success — the visitor is already subscribed.
      if (error && !error.message.includes('duplicate')) throw error;
    },
  });
};

export const useSubscribers = () => {
  return useQuery({
    queryKey: ['asentio-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asentio_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

/* ------------------------------------------------------------------ */
/* Directory submissions and profile claims                            */
/* ------------------------------------------------------------------ */

export interface SubmissionInput {
  submission_type: 'new_company' | 'claim_profile';
  company_name: string;
  website?: string | null;
  logo_url?: string | null;
  description?: string | null;
  hq_location?: string | null;
  company_type?: string | null;
  primary_category?: string | null;
  subcategories?: string[];
  ai_capabilities?: string[];
  human_interface?: string[];
  products_summary?: string | null;
  funding_stage?: string | null;
  key_investors?: string[];
  key_partnerships?: string[];
  submitter_name?: string | null;
  submitter_email?: string | null;
  submitter_role?: string | null;
  existing_company_id?: string | null;
  source?: string;
}

export const useSubmitCompany = () => {
  return useMutation({
    mutationFn: async (input: SubmissionInput) => {
      const { error } = await supabase.from('asentio_submissions').insert(input);
      if (error) throw error;
    },
  });
};

export const useSubmissions = () => {
  return useQuery({
    queryKey: ['asentio-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asentio_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useReviewSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data: submission, error: readError } = await supabase
        .from('asentio_submissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (readError) throw readError;
      if (!submission) throw new Error('Submission not found');

      if (status === 'approved') {
        const slug = submission.company_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const payload = {
          slug,
          name: submission.company_name,
          website: submission.website,
          logo_url: submission.logo_url,
          description: submission.description,
          hq_location: submission.hq_location,
          company_type: submission.company_type,
          primary_category: submission.primary_category,
          subcategories: submission.subcategories,
          ai_capabilities: submission.ai_capabilities,
          human_interface: submission.human_interface,
          products_summary: submission.products_summary,
          funding_stage: submission.funding_stage,
          key_investors: submission.key_investors,
          key_partnerships: submission.key_partnerships,
          status: 'published',
        };

        if (submission.existing_company_id) {
          const { error } = await supabase
            .from('xr_companies')
            .update(payload)
            .eq('id', submission.existing_company_id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('xr_companies').insert(payload);
          if (error) throw error;
        }
      }

      const { error } = await supabase
        .from('asentio_submissions')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asentio-submissions'] });
      qc.invalidateQueries({ queryKey: ['xr-companies'] });
    },
  });
};
