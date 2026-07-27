import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TAXONOMY } from '@/lib/xrTaxonomy';

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
  // Asentio "Human Interface to AI" metadata
  company_type: string | null;
  primary_category: string | null;
  subcategories: string[] | null;
  ai_capabilities: string[] | null;
  human_interface: string[] | null;
  technologies: string[] | null;
  target_markets: string[] | null;
  products_summary: string | null;
  funding_stage: string | null;
  key_investors: string[] | null;
  key_partnerships: string[] | null;
  asentio_take: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyFilters {
  search?: string;
  sector?: string;
  /** Top-level taxonomy group slug, e.g. "devices". */
  group?: string;
  /** Leaf category, e.g. "AI Glasses". */
  category?: string;
  companyType?: string;
  aiCapability?: string;
  humanInterface?: string;
  targetMarket?: string;
  fundingStage?: string;
  region?: string;
  editorsPickOnly?: boolean;
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
      if (filters?.companyType && filters.companyType !== 'all') {
        query = query.eq('company_type', filters.companyType);
      }
      if (filters?.fundingStage && filters.fundingStage !== 'all') {
        query = query.eq('funding_stage', filters.fundingStage);
      }
      if (filters?.aiCapability && filters.aiCapability !== 'all') {
        query = query.contains('ai_capabilities', [filters.aiCapability]);
      }
      if (filters?.humanInterface && filters.humanInterface !== 'all') {
        query = query.contains('human_interface', [filters.humanInterface]);
      }
      if (filters?.targetMarket && filters.targetMarket !== 'all') {
        query = query.contains('target_markets', [filters.targetMarket]);
      }
      if (filters?.region && filters.region !== 'all') {
        query = query.ilike('hq_location', `%${filters.region}%`);
      }
      if (filters?.editorsPickOnly) {
        query = query.eq('is_editors_pick', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      let rows = (data || []) as XRCompany[];

      // Category / group filtering happens client-side so a company can match
      // on either its primary category or any of its subcategories.
      if (filters?.category && filters.category !== 'all') {
        const target = filters.category;
        rows = rows.filter(
          (c) => c.primary_category === target || (c.subcategories || []).includes(target)
        );
      }
      if (filters?.group && filters.group !== 'all') {
        const group = TAXONOMY.find((g) => g.slug === filters.group);
        if (group) {
          rows = rows.filter(
            (c) =>
              (c.primary_category && group.children.includes(c.primary_category)) ||
              (c.subcategories || []).some((s) => group.children.includes(s))
          );
        }
      }

      return rows;
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
        .maybeSingle();
      
      if (error) throw error;
      
      // Fallback: try matching by name (for derived company navigation)
      if (!data) {
        const { data: byName, error: nameError } = await supabase
          .from('xr_companies')
          .select('*')
          .eq('name', idOrSlug)
          .maybeSingle();
        if (nameError) throw nameError;
        return byName as XRCompany | null;
      }
      
      return data as XRCompany;
    },
    enabled: !!idOrSlug
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Partial<Omit<XRCompany, 'id' | 'created_at' | 'updated_at'>> & { name: string; slug: string }) => {
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
