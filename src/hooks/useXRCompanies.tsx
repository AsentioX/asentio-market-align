import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface XRCompany {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  hq_location: string | null;
  founded_year: number | null;
  company_size: string | null;
  sectors: string[] | null;
  launch_date: string | null;
  end_of_life_date: string | null;
  is_editors_pick: boolean;
  editors_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyFilters {
  search?: string;
  sector?: string;
}

export const useXRCompanies = (filters?: CompanyFilters) => {
  return useQuery({
    queryKey: ['xr-companies', filters],
    queryFn: async () => {
      let query = supabase
        .from('xr_companies')
        .select('*')
        .order('is_editors_pick', { ascending: false })
        .order('name', { ascending: true });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.sector && filters.sector !== 'all') {
        query = query.contains('sectors', [filters.sector]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as XRCompany[];
    }
  });
};

export const useXRCompany = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['xr-company', idOrSlug],
    queryFn: async () => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      const column = isUUID ? 'id' : 'slug';
      
      const { data, error } = await supabase
        .from('xr_companies')
        .select('*')
        .eq(column, idOrSlug)
        .single();
      
      if (error) throw error;
      return data as XRCompany;
    },
    enabled: !!idOrSlug
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Omit<XRCompany, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('xr_companies')
        .insert(company)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-companies'] });
    }
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...company }: Partial<XRCompany> & { id: string }) => {
      const { data, error } = await supabase
        .from('xr_companies')
        .update(company)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-companies'] });
    }
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('xr_companies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-companies'] });
    }
  });
};

export const COMPANY_SECTORS = [
  'AR/VR Hardware',
  'XR Software',
  'Spatial Computing',
  'AI & XR',
  'Enterprise XR',
  'Gaming & Entertainment',
  'Healthcare XR',
  'Education & Training',
  'Industrial & Manufacturing',
  'Retail & Commerce'
] as const;

export const COMPANY_SIZES = [
  'Startup (1-10)',
  'Small (11-50)',
  'Medium (51-200)',
  'Large (201-1000)',
  'Enterprise (1000+)'
] as const;
