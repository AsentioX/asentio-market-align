import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HAIUseCase {
  id: string;
  slug: string;
  name: string;
  domain: string;
  summary: string | null;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_featured: boolean;
  human_activities: string[] | null;
  human_capabilities: string[] | null;
  ai_capabilities: string[] | null;
  human_interface: string[] | null;
  industry_focus: string[] | null;
  ecosystem_roles: string[] | null;
  created_at: string;
  updated_at: string;
}

export type HAIUseCaseInput = Omit<HAIUseCase, 'id' | 'created_at' | 'updated_at'>;

export const useHAIUseCases = () => {
  return useQuery({
    queryKey: ['hai-use-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hai_use_cases')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as HAIUseCase[];
    },
  });
};

export const useHAIUseCase = (slug?: string) => {
  return useQuery({
    queryKey: ['hai-use-case', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hai_use_cases')
        .select('*')
        .eq('slug', slug!)
        .maybeSingle();
      if (error) throw error;
      return data as HAIUseCase | null;
    },
    enabled: !!slug,
  });
};

export const useUpsertUseCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (useCase: Partial<HAIUseCase> & { slug: string; name: string; domain: string }) => {
      const { data, error } = await supabase
        .from('hai_use_cases')
        .upsert(useCase, { onConflict: 'slug' })
        .select()
        .single();
      if (error) throw error;
      return data as HAIUseCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hai-use-cases'] });
    },
  });
};

export const useDeleteUseCaseRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hai_use_cases').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hai-use-cases'] });
    },
  });
};

/** Use cases grouped by their domain, preserving display order. */
export const groupByDomain = (useCases?: HAIUseCase[]) => {
  const groups: { domain: string; useCases: HAIUseCase[] }[] = [];
  (useCases || []).forEach((uc) => {
    const existing = groups.find((g) => g.domain === uc.domain);
    if (existing) existing.useCases.push(uc);
    else groups.push({ domain: uc.domain, useCases: [uc] });
  });
  return groups;
};
