import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TAXONOMY } from '@/lib/xrTaxonomy';
import { HAIDimensionKey, HAI_DIMENSIONS, HAI_CATEGORIES } from '@/lib/haiFramework';

export interface XRCompany {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  mission: string | null;
  hq_location: string | null;
  founded_year: number | null;
  company_size: string | null;
  launch_date: string | null;
  end_of_life_date: string | null;
  is_editors_pick: boolean;
  editors_note: string | null;
  // Human-AI Framework
  human_activities: string[] | null;
  human_capabilities: string[] | null;
  ai_capabilities: string[] | null;
  human_interface: string[] | null;
  industry_focus: string[] | null;
  ecosystem_roles: string[] | null;
  asentio_perspective: string | null;
  created_at: string;
  updated_at: string;
}

export type HAISelections = Partial<Record<HAIDimensionKey, string[]>>;

export interface CompanyFilters {
  search?: string;
  /** Human-AI Framework multi-select selections. */
  selections?: HAISelections;
  /** Whether selections within/across dimensions must all match. */
  logic?: 'AND' | 'OR';
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

export const companyValues = (company: XRCompany, key: HAIDimensionKey): string[] =>
  ((company as unknown as Record<string, string[] | null>)[key] || []) as string[];

/** A company matches a Category when it touches any of the category's interfaces or AI capabilities. */
const matchesCategory = (company: XRCompany, categoryValue: string): boolean => {
  const category = HAI_CATEGORIES.find((c) => c.value === categoryValue);
  if (!category) return false;
  const interfaces = company.human_interface || [];
  const aiCaps = company.ai_capabilities || [];
  return (
    category.human_interface.some((v) => interfaces.includes(v)) ||
    (category.ai_capabilities || []).some((v) => aiCaps.includes(v))
  );
};

/** Client-side matcher for the Human-AI Framework selections. */
export const matchesSelections = (
  company: XRCompany,
  selections?: HAISelections,
  logic: 'AND' | 'OR' = 'AND'
): boolean => {
  const active = Object.entries(selections || {}).filter(([, v]) => v && v.length > 0) as [
    HAIDimensionKey,
    string[]
  ][];
  if (active.length === 0) return true;

  const results = active.map(([key, values]) => {
    if (key === 'hai_category') {
      return values.some((v) => matchesCategory(company, v));
    }
    const owned = companyValues(company, key);
    return logic === 'AND'
      ? values.every((v) => owned.includes(v))
      : values.some((v) => owned.includes(v));
  });

  return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
};

const searchHaystack = (c: XRCompany) =>
  [
    c.name,
    c.description,
    c.mission,
    c.products_summary,
    ...HAI_DIMENSIONS.flatMap((d) => companyValues(c, d.key)),
    ...(c.technologies || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const useXRCompanies = (filters?: CompanyFilters) => {
  return useQuery({
    queryKey: ['xr-companies', filters],
    queryFn: async () => {
      const query = supabase
        .from('xr_companies')
        .select('*')
        .order('is_editors_pick', { ascending: false })
        .order('name', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      let rows = (data || []) as unknown as XRCompany[];

      if (filters?.search) {
        const term = filters.search.toLowerCase().trim();
        rows = rows.filter((c) => searchHaystack(c).includes(term));
      }
      if (filters?.selections) {
        rows = rows.filter((c) => matchesSelections(c, filters.selections, filters.logic || 'AND'));
      }
      if (filters?.sector && filters.sector !== 'all') {
        rows = rows.filter((c) => (c.sectors || []).includes(filters.sector!));
      }
      if (filters?.companyType && filters.companyType !== 'all') {
        rows = rows.filter((c) => c.company_type === filters.companyType);
      }
      if (filters?.fundingStage && filters.fundingStage !== 'all') {
        rows = rows.filter((c) => c.funding_stage === filters.fundingStage);
      }
      if (filters?.aiCapability && filters.aiCapability !== 'all') {
        rows = rows.filter((c) => (c.ai_capabilities || []).includes(filters.aiCapability!));
      }
      if (filters?.humanInterface && filters.humanInterface !== 'all') {
        rows = rows.filter((c) => (c.human_interface || []).includes(filters.humanInterface!));
      }
      if (filters?.targetMarket && filters.targetMarket !== 'all') {
        rows = rows.filter(
          (c) =>
            (c.target_markets || []).includes(filters.targetMarket!) ||
            (c.industry_focus || []).includes(filters.targetMarket!)
        );
      }
      if (filters?.region && filters.region !== 'all') {
        rows = rows.filter((c) =>
          (c.hq_location || '').toLowerCase().includes(filters.region!.toLowerCase())
        );
      }
      if (filters?.editorsPickOnly) {
        rows = rows.filter((c) => c.is_editors_pick);
      }
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
        return (byName as unknown as XRCompany) || null;
      }
      
      return data as unknown as XRCompany;
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
