import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Contractor, SavedSegment, SegmentFilters, ContractorType, CompanySize, BusinessMaturity, LicenseStatus, SourceBadge } from './types';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'cf:v1';

interface PersistedState {
  contractors: Contractor[];
  segments: SavedSegment[];
  flagged: string[]; // contractor ids flagged as bad data
}

interface CFStore extends PersistedState {
  isLoadingDb: boolean;
  dataSource: 'empty' | 'database';
  reloadFromDb: () => Promise<void>;
  saveSegment: (s: Omit<SavedSegment, 'id' | 'created_at'>) => SavedSegment;
  deleteSegment: (id: string) => void;
  updateSegment: (id: string, patch: Partial<SavedSegment>) => void;
  addToSegment: (segmentId: string, contractorId: string) => void;
  removeFromSegment: (segmentId: string, contractorId: string) => void;
  flagContractor: (id: string) => void;
  refreshContractor: (id: string) => void;
  applyFilters: (filters: SegmentFilters) => Contractor[];
}

// Map a DB row (cf_contractors) into the in-memory Contractor shape used by the UI
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
    source_count: r.source_count ?? 1,
    source_urls: (r.source_urls ?? ['Official License Source']) as SourceBadge[],
    years_in_business: r.issue_date ? new Date().getFullYear() - new Date(r.issue_date).getFullYear() : 0,
    estimated_company_size: (r.estimated_company_size as CompanySize) ?? 'Small Crew',
    estimated_business_maturity: (r.estimated_business_maturity as BusinessMaturity) ?? 'Established',
    service_area: r.city ? [r.city] : [],
    tags: [],
    confidence_score: r.confidence_score ?? 80,
    last_verified_date: r.last_verified_date ?? new Date().toISOString(),
    commercial_residential: 'Both',
  };
}

const Ctx = createContext<CFStore | null>(null);

const EMPTY_STATE: PersistedState = { contractors: [], segments: [], flagged: [] };

const load = (): PersistedState => {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as PersistedState;
    // Never restore stale contractors from localStorage — always pull fresh from DB.
    return {
      contractors: [],
      segments: parsed.segments ?? [],
      flagged: parsed.flagged ?? [],
    };
  } catch {
    return EMPTY_STATE;
  }
};

export function CFProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => load());
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dataSource, setDataSource] = useState<'empty' | 'database'>('empty');

  useEffect(() => {
    // Persist segments & flagged only — contractors come from DB.
    try {
      const { segments, flagged } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ contractors: [], segments, flagged }));
    } catch {}
  }, [state]);

  const reloadFromDb = useCallback(async () => {
    setIsLoadingDb(true);
    try {
      const { data, error, count } = await supabase
        .from('cf_contractors')
        .select('*', { count: 'exact' })
        .order('last_verified_date', { ascending: false })
        .limit(5000);
      if (!error && data) {
        setState((p) => ({ ...p, contractors: data.map(mapDbRow) }));
        setDataSource(data.length > 0 ? 'database' : 'empty');
        console.info(`[CF] Loaded ${data.length} contractors from database (total: ${count})`);
      } else {
        setState((p) => ({ ...p, contractors: [] }));
        setDataSource('empty');
      }
    } catch (e) {
      console.warn('[CF] DB load failed', e);
      setState((p) => ({ ...p, contractors: [] }));
      setDataSource('empty');
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    reloadFromDb();
  }, [reloadFromDb]);

  const applyFilters = useCallback(
    (f: SegmentFilters): Contractor[] => {
      let list = state.contractors;
      if (f.query) {
        const q = f.query.toLowerCase();
        list = list.filter(
          (c) =>
            c.company_name.toLowerCase().includes(q) ||
            c.contractor_type.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.specialties.some((s) => s.toLowerCase().includes(q)) ||
            c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (f.states?.length) list = list.filter((c) => f.states!.includes(c.state));
      if (f.cities?.length) list = list.filter((c) => f.cities!.some((x) => c.city.toLowerCase() === x.toLowerCase()));
      if (f.counties?.length) list = list.filter((c) => f.counties!.some((x) => c.county.toLowerCase() === x.toLowerCase()));
      if (f.zip) list = list.filter((c) => c.zip_code.startsWith(f.zip!));
      if (f.contractorTypes?.length) list = list.filter((c) => f.contractorTypes!.includes(c.contractor_type));
      if (f.licenseStatus?.length) list = list.filter((c) => f.licenseStatus!.includes(c.license_status));
      if (f.hasWebsite) list = list.filter((c) => !!c.website);
      if (f.hasEmail) list = list.filter((c) => !!c.email);
      if (f.hasVerifiedEmail) list = list.filter((c) => c.email_verified === true);
      if (f.hasPhone) list = list.filter((c) => !!c.phone);
      if (f.companySizes?.length) list = list.filter((c) => f.companySizes!.includes(c.estimated_company_size));
      if (f.maturity?.length) list = list.filter((c) => f.maturity!.includes(c.estimated_business_maturity));
      if (f.minReviews != null) list = list.filter((c) => (c.review_count ?? 0) >= f.minReviews!);
      if (f.maxReviews != null) list = list.filter((c) => (c.review_count ?? 0) <= f.maxReviews!);
      if (f.minConfidence != null) list = list.filter((c) => c.confidence_score >= f.minConfidence!);
      if (f.commercialResidential) list = list.filter((c) => c.commercial_residential === f.commercialResidential || c.commercial_residential === 'Both');
      return list;
    },
    [state.contractors]
  );

  const saveSegment: CFStore['saveSegment'] = (s) => {
    const seg: SavedSegment = {
      ...s,
      id: `s-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setState((p) => ({ ...p, segments: [seg, ...p.segments] }));
    return seg;
  };

  const deleteSegment = (id: string) => setState((p) => ({ ...p, segments: p.segments.filter((s) => s.id !== id) }));
  const updateSegment = (id: string, patch: Partial<SavedSegment>) =>
    setState((p) => ({ ...p, segments: p.segments.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const addToSegment = (segmentId: string, contractorId: string) =>
    setState((p) => ({
      ...p,
      segments: p.segments.map((s) =>
        s.id === segmentId && !s.contractor_ids.includes(contractorId)
          ? { ...s, contractor_ids: [...s.contractor_ids, contractorId] }
          : s
      ),
    }));

  const removeFromSegment = (segmentId: string, contractorId: string) =>
    setState((p) => ({
      ...p,
      segments: p.segments.map((s) =>
        s.id === segmentId ? { ...s, contractor_ids: s.contractor_ids.filter((c) => c !== contractorId) } : s
      ),
    }));

  const flagContractor = (id: string) => setState((p) => ({ ...p, flagged: [...new Set([...p.flagged, id])] }));

  const refreshContractor = (id: string) =>
    setState((p) => ({
      ...p,
      contractors: p.contractors.map((c) =>
        c.contractor_id === id
          ? { ...c, last_verified_date: new Date().toISOString(), confidence_score: Math.min(100, c.confidence_score + 2) }
          : c
      ),
    }));

  const value = useMemo<CFStore>(
    () => ({ ...state, isLoadingDb, dataSource, reloadFromDb, saveSegment, deleteSegment, updateSegment, addToSegment, removeFromSegment, flagContractor, refreshContractor, applyFilters }),
    [state, isLoadingDb, dataSource, reloadFromDb, applyFilters]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCF() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCF must be used within CFProvider');
  return ctx;
}

export function exportToCSV(contractors: Contractor[], filename = 'contractors.csv') {
  const headers = [
    'company_name', 'contractor_type', 'license_number', 'license_status', 'city', 'county', 'state',
    'zip_code', 'phone', 'email', 'website', 'review_rating', 'review_count', 'years_in_business',
    'estimated_company_size', 'estimated_business_maturity', 'confidence_score', 'last_verified_date',
  ];
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = contractors.map((c) => headers.map((h) => escape((c as any)[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
