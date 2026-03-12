import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CaseStudy {
  id: string;
  company: string;
  website: string | null;
  description: string;
  image: string | null;
  image_zoom: number | null;
  image_position: string | null;
  challenge: string | null;
  what_we_did: string | null;
  tags: string[] | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCaseStudies = (activeOnly = false) => {
  return useQuery({
    queryKey: ['case-studies', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('case_studies')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (activeOnly) query = query.eq('is_active', true);

      const { data, error } = await query;
      if (error) throw error;
      return data as CaseStudy[];
    }
  });
};

export const useCreateCaseStudy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cs: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('case_studies')
        .insert(cs)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case-studies'] })
  });
};

export const useUpdateCaseStudy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...cs }: Partial<CaseStudy> & { id: string }) => {
      const { data, error } = await supabase
        .from('case_studies')
        .update(cs)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case-studies'] })
  });
};

export const useDeleteCaseStudy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('case_studies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case-studies'] })
  });
};

export const CASE_STUDY_TAGS = [
  'Product-Market Fit',
  'Go-To-Market',
  'Retail Channel',
  'Marketing',
  'Enterprise Sales',
  'Brand & Narrative',
  'Developer Ecosystem',
  'Platform Partnerships',
  'CES / Trade Show',
  'Sales Enablement',
] as const;
