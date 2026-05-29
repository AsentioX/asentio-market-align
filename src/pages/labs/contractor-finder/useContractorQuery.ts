import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contractor, SegmentFilters, ContractorType, CompanySize, BusinessMaturity, LicenseStatus, SourceBadge } from './types';

const PAGE_SIZE = 200;

// UI status -> DB license_status values (CSLB raw values)
const STATUS_MAP: Record<LicenseStatus, string[]> = {
  Active: ['CLEAR', 'ACTIVE'],
  Suspended: ['SUSPENDED', 'SUSPND'],
  Expired: ['EXPIRED'],
  Inactive: ['INACTIVE', 'INACT'],
};

function mapDbRow(r: any): Contractor {
  const status: LicenseStatus = (() => {
    const s = (r.license_status || '').toUpperCase();
    if (s.startsWith('CLEAR') || s.startsWith('ACTIVE')) return 'Active';
    if (s.startsWith('SUSP')) return 'Suspended';
    if (s.startsWith('EXPIR')) return 'Expired';
    return 'Inactive';
  })();
  return {
    contractor_id: r.id,
    company_name: r.business_name || 'Unknown',
    contractor_type: (r.contractor_type as ContractorType) || ('General Contractor' as ContractorType),
    specialties: r.classifications ?? [],
    license_number: r.license_number,
    license_classification: r.primary_classification ?? '',
    license_status: status,
    license_issue_date: r.issue_date ?? '',
    license_expiration_date: r.expiration_date ?? '',
    bond_status: r.bond_amount ? 'Active' : 'None',
    insurance_status: r.wc_company ? 'Active' : 'None',
    address: r.address ?? '',
    city: r.city ?? '',
    county: r.county ?? '',
    state: r.state ?? 'CA',
    zip_code: r.zip_code ?? '',
    latitude: 0,
    longitude: 0,
    phone: r.phone ?? '',
    website: r.website ?? undefined,
    email: r.email ?? undefined,
    email_verified: undefined,
    source_count: r.source_count ?? 1,
    source_urls: (r.source_urls ?? ['Official License Source']) as SourceBadge[],
    years_in_business: r.years_in_business ?? (r.issue_date ? new Date().getFullYear() - new Date(r.issue_date).getFullYear() : 0),
    estimated_company_size: (r.estimated_company_size as CompanySize) ?? 'Small Crew',
    estimated_business_maturity: (r.estimated_business_maturity as BusinessMaturity) ?? 'Established',
    service_area: r.city ? [r.city] : [],
    tags: [],
    confidence_score: r.confidence_score ?? 80,
    last_verified_date: r.last_verified_date ?? new Date().toISOString(),
    commercial_residential: 'Both',
  };
}

export type SortKey = 'confidence' | 'rating' | 'reviews' | 'recent';

// Build a base query (counted) with all filters applied. Caller adds order/range/select.
function buildQuery(filters: SegmentFilters, opts: { head?: boolean; selectCols?: string } = {}) {
  let q: any = supabase
    .from('cf_contractors')
    .select(opts.selectCols ?? '*', { count: 'exact', head: !!opts.head });

  if (filters.query) {
    const raw = filters.query.trim();
    const safe = raw.replace(/[%,()]/g, ' ');
    // OR across business_name + license_number
    q = q.or(`business_name.ilike.%${safe}%,license_number.ilike.%${safe}%`);
  }
  if (filters.states?.length) q = q.in('state', filters.states);
  if (filters.cities?.length) q = q.in('city', filters.cities);
  if (filters.counties?.length) q = q.in('county', filters.counties);
  if (filters.zip) q = q.ilike('zip_code', `${filters.zip}%`);
  if (filters.contractorTypes?.length) q = q.in('contractor_type', filters.contractorTypes);
  if (filters.licenseStatus?.length) {
    const raw = filters.licenseStatus.flatMap((s) => STATUS_MAP[s] ?? []);
    if (raw.length) q = q.in('license_status', raw);
  }
  if (filters.companySizes?.length) q = q.in('estimated_company_size', filters.companySizes);
  if (filters.maturity?.length) q = q.in('estimated_business_maturity', filters.maturity);
  if (filters.hasWebsite) q = q.not('website', 'is', null);
  if (filters.hasEmail) q = q.not('email', 'is', null);
  if (filters.hasPhone) q = q.not('phone', 'is', null);
  if (filters.minConfidence != null && filters.minConfidence > 0) q = q.gte('confidence_score', filters.minConfidence);
  return q;
}

function applyOrder(q: any, sortBy: SortKey) {
  switch (sortBy) {
    case 'recent': return q.order('last_verified_date', { ascending: false });
    case 'rating':
    case 'reviews':
    case 'confidence':
    default:
      return q.order('confidence_score', { ascending: false, nullsFirst: false });
  }
}

export interface ContractorQueryResult {
  rows: Contractor[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
}

export function useContractorQuery(filters: SegmentFilters, sortBy: SortKey): ContractorQueryResult {
  const [rows, setRows] = useState<Contractor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const reqId = useRef(0);

  // Reset whenever filters/sort change
  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    setPage(0);
    (async () => {
      try {
        const q = applyOrder(buildQuery(filters), sortBy).range(0, PAGE_SIZE - 1);
        const { data, error, count } = await q;
        if (id !== reqId.current) return;
        if (error) throw error;
        setRows((data ?? []).map(mapDbRow));
        setTotal(count ?? 0);
      } catch (e: any) {
        if (id !== reqId.current) return;
        console.warn('[CF] query failed', e);
        setError(e?.message ?? 'Query failed');
        setRows([]);
        setTotal(0);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    })();
  }, [JSON.stringify(filters), sortBy]);

  const loadMore = () => {
    if (loadingMore || loading) return;
    if (rows.length >= total) return;
    const nextPage = page + 1;
    const id = reqId.current;
    setLoadingMore(true);
    (async () => {
      try {
        const from = nextPage * PAGE_SIZE;
        const q = applyOrder(buildQuery(filters), sortBy).range(from, from + PAGE_SIZE - 1);
        const { data, error } = await q;
        if (id !== reqId.current) return;
        if (error) throw error;
        setRows((prev) => [...prev, ...(data ?? []).map(mapDbRow)]);
        setPage(nextPage);
      } catch (e: any) {
        if (id !== reqId.current) return;
        console.warn('[CF] loadMore failed', e);
      } finally {
        if (id === reqId.current) setLoadingMore(false);
      }
    })();
  };

  return {
    rows,
    total,
    loading,
    loadingMore,
    hasMore: rows.length < total,
    loadMore,
    error,
  };
}

// Fetch ALL matching rows by paging server-side. Caps at hardMax to avoid runaway.
export async function fetchAllMatching(filters: SegmentFilters, sortBy: SortKey, hardMax = 25000): Promise<Contractor[]> {
  const all: any[] = [];
  let from = 0;
  while (from < hardMax) {
    const to = Math.min(from + PAGE_SIZE - 1, hardMax - 1);
    const q = applyOrder(buildQuery(filters), sortBy).range(from, to);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all.map(mapDbRow);
}
