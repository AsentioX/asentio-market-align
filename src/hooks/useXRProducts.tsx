import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface XRProduct {
  id: string;
  slug: string;
  name: string;
  company: string;
  company_hq: string | null;
  category: string;
  ai_integration: string;
  price_range: string | null;
  shipping_status: string;
  region: string;
  description: string | null;
  key_features: string[] | null;
  link: string | null;
  image_url: string | null;
  is_editors_pick: boolean;
  editors_note: string | null;
  open_ecosystem_score: number | null;
  ai_access_score: number | null;
  spatial_capability_score: number | null;
  monetization_score: number | null;
  platform_viability_score: number | null;
  developer_resources_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  ai_integration?: string;
  shipping_status?: string;
  search?: string;
  sort?: string;
}

export const useXRProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['xr-products', filters],
    queryFn: async () => {
      let query = supabase
        .from('xr_products')
        .select('*');

      // Apply sorting (non-price sorts handled by DB)
      const sort = filters?.sort || 'default';
      if (sort === 'company') {
        query = query.order('company', { ascending: true }).order('name', { ascending: true });
      } else if (sort === 'product') {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('is_editors_pick', { ascending: false }).order('created_at', { ascending: false });
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.ai_integration && filters.ai_integration !== 'all') {
        query = query.eq('ai_integration', filters.ai_integration);
      }
      if (filters?.shipping_status && filters.shipping_status !== 'all') {
        query = query.eq('shipping_status', filters.shipping_status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Client-side price sorting (parse numeric values from text like "$299", "$1,299")
      if (sort === 'price_asc' || sort === 'price_desc') {
        const parsePrice = (p: string | null): number => {
          if (!p) return sort === 'price_asc' ? Infinity : -Infinity;
          const match = p.replace(/,/g, '').match(/[\d.]+/);
          return match ? parseFloat(match[0]) : (sort === 'price_asc' ? Infinity : -Infinity);
        };
        (data as XRProduct[]).sort((a, b) => {
          const diff = parsePrice(a.price_range) - parsePrice(b.price_range);
          return sort === 'price_asc' ? diff : -diff;
        });
      }
      
      return data as XRProduct[];
    }
  });
};

export const useXRProduct = (slug: string) => {
  return useQuery({
    queryKey: ['xr-product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xr_products')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as XRProduct;
    },
    enabled: !!slug
  });
};

export const useXRProductById = (id: string) => {
  return useQuery({
    queryKey: ['xr-product-id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xr_products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as XRProduct;
    },
    enabled: !!id
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<XRProduct, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('xr_products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-products'] });
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<XRProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from('xr_products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-products'] });
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('xr_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-products'] });
    }
  });
};

export const CATEGORIES = [
  'AR Glasses',
  'VR Headsets', 
  'AI Glasses',
  'Smart Glasses',
  'Spatial Apps',
  'AR Entertainment Glasses',
  'Services',
  'AI Smartglasses',
  'AR Smartglasses',
  'AI/AR Hybrid',
  'Full AR',
  'Mixed Reality',
  'Enterprise AR',
  'Standalone AR'
] as const;

export const AI_INTEGRATIONS = ['Yes', 'No', 'Partial'] as const;

export const SHIPPING_STATUSES = [
  'Available',
  'Shipping',
  'Preorder',
  'Concept',
  'CES prototype',
  'CES preview',
  'CES 2026 launch',
  'Dev Only',
  'Dev Only ($99/mo)',
  'Announced',
  'Beta',
  'Discontinued'
] as const;
