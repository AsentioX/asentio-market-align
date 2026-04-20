import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCF, exportToCSV } from './useCFStore';
import { Contractor, ContractorType, SegmentFilters, LicenseStatus, CompanySize, BusinessMaturity } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Search, Filter, MapPin, Sparkles, Download, Save, X, Star, Phone, Globe, Mail,
  ChevronDown, MapPinned, List, LayoutGrid, BookmarkPlus, Loader2, Users, Bookmark
} from 'lucide-react';
import { ConfidenceMeter, LicenseStatusBadge, SourceBadgePill, CompletenessIcons, relativeTime } from './components/Atoms';
import { ContractorDetailDrawer } from './components/ContractorDetailDrawer';

const ALL_TYPES: ContractorType[] = [
  'General Contractor', 'Flooring Installer', 'Painter', 'Electrician', 'Plumber',
  'Roofer', 'Kitchen / Bath Remodeler', 'HVAC', 'Cabinet Installer', 'Tile Installer',
  'Landscaping', 'Handyman',
];
const ALL_STATUS: LicenseStatus[] = ['Active', 'Inactive', 'Expired', 'Suspended'];
const ALL_SIZES: CompanySize[] = ['Solo Operator', 'Small Crew', 'Growing Local', 'Mid-Sized', 'Multi-Location'];
const ALL_MATURITY: BusinessMaturity[] = ['Premium / Design-Forward', 'Established', 'Value / Budget', 'Low-Tech'];

type ViewMode = 'cards' | 'list' | 'map';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { contractors, applyFilters, saveSegment } = useCF();
  const [filters, setFilters] = useState<SegmentFilters>({});
  const [view, setView] = useState<ViewMode>('cards');
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('id'));
  const [nlQuery, setNlQuery] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlRationale, setNlRationale] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'reviews' | 'confidence' | 'recent'>('confidence');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  const results = useMemo(() => {
    let list = applyFilters(filters);
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'rating': return (b.review_rating ?? 0) - (a.review_rating ?? 0);
        case 'reviews': return (b.review_count ?? 0) - (a.review_count ?? 0);
        case 'recent': return new Date(b.last_verified_date).getTime() - new Date(a.last_verified_date).getTime();
        case 'confidence':
        default:
          return b.confidence_score - a.confidence_score;
      }
    });
    return list;
  }, [filters, applyFilters, sortBy]);

  const selected = useMemo(() => contractors.find((c) => c.contractor_id === selectedId) ?? null, [contractors, selectedId]);

  const toggleArr = <T,>(arr: T[] | undefined, v: T): T[] => {
    const cur = arr ?? [];
    return cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
  };

  const runNLSearch = async () => {
    if (!nlQuery.trim()) return;
    setNlLoading(true);
    setNlRationale(null);
    try {
      const { data, error } = await supabase.functions.invoke('contractor-ai', {
        body: { mode: 'segment', query: nlQuery },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const result = (data as any)?.result ?? {};
      const { rationale, ...applied } = result;
      setFilters(applied as SegmentFilters);
      setNlRationale(rationale ?? null);
      toast.success('AI applied filters', { description: rationale ?? undefined });
    } catch (e: any) {
      toast.error('AI search failed', { description: e?.message });
    } finally {
      setNlLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setNlQuery('');
    setNlRationale(null);
  };

  const activeFilterCount =
    (filters.contractorTypes?.length ?? 0) +
    (filters.licenseStatus?.length ?? 0) +
    (filters.companySizes?.length ?? 0) +
    (filters.maturity?.length ?? 0) +
    (filters.cities?.length ?? 0) +
    (filters.states?.length ?? 0) +
    (filters.counties?.length ?? 0) +
    (filters.hasWebsite ? 1 : 0) +
    (filters.hasEmail ? 1 : 0) +
    (filters.hasVerifiedEmail ? 1 : 0) +
    (filters.hasPhone ? 1 : 0) +
    (filters.minConfidence ? 1 : 0);

  const handleSaveSegment = () => {
    if (!segmentName.trim()) return;
    saveSegment({
      name: segmentName.trim(),
      filters,
      contractor_ids: results.map((r) => r.contractor_id),
    });
    toast.success(`Saved "${segmentName}"`, { description: `${results.length} contractors in segment.` });
    setSegmentName('');
    setShowSaveModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Explore Contractors</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--cf-text-muted))' }}>
            Search across {contractors.length.toLocaleString()} licensed contractors. Showing <strong>{results.length}</strong> matches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={results.length === 0}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-50"
            style={{ border: '1px solid hsl(var(--cf-border))', background: 'hsl(var(--cf-surface))' }}
          >
            <BookmarkPlus className="w-4 h-4" /> Save Segment
          </button>
          <button
            onClick={() => exportToCSV(results)}
            disabled={results.length === 0}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-50"
            style={{ background: 'hsl(var(--cf-primary))' }}
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* AI Natural-language bar */}
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--cf-primary-soft)), hsl(var(--cf-purple-soft)))',
          border: '1px solid hsl(var(--cf-primary) / 0.2)',
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ background: 'hsl(var(--cf-primary))' }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <input
          value={nlQuery}
          onChange={(e) => setNlQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runNLSearch()}
          placeholder='Try: "Licensed flooring installers within 25 miles of San Jose with a website and verified email"'
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-[hsl(var(--cf-text-subtle))]"
        />
        <button
          onClick={runNLSearch}
          disabled={nlLoading || !nlQuery.trim()}
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50 shrink-0"
          style={{ background: 'hsl(var(--cf-primary))' }}
        >
          {nlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Build with AI'}
        </button>
      </div>
      {nlRationale && (
        <div className="text-xs px-3 py-2 rounded-md" style={{ background: 'hsl(var(--cf-success-soft))', color: 'hsl(var(--cf-success))' }}>
          <strong>AI interpretation:</strong> {nlRationale}
        </div>
      )}

      <div className="grid grid-cols-12 gap-5">
        {/* Filter sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-xl p-4 space-y-5" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--cf-danger))' }}>
                  <X className="w-3 h-3" /> Clear ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-wide" style={{ color: 'hsl(var(--cf-text-subtle))' }}>Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
                <input
                  value={filters.query ?? ''}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  placeholder="Company, city, tag…"
                  className="w-full text-sm pl-8 pr-2 py-2 rounded-md outline-none focus:border-[hsl(var(--cf-primary))]"
                  style={{ background: 'hsl(var(--cf-surface-alt))', border: '1px solid hsl(var(--cf-border))' }}
                />
              </div>
            </div>

            {/* ZIP */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-wide" style={{ color: 'hsl(var(--cf-text-subtle))' }}>ZIP / Radius</label>
              <input
                value={filters.zip ?? ''}
                onChange={(e) => setFilters({ ...filters, zip: e.target.value })}
                placeholder="e.g. 95128"
                className="w-full text-sm px-2.5 py-2 rounded-md outline-none"
                style={{ background: 'hsl(var(--cf-surface-alt))', border: '1px solid hsl(var(--cf-border))' }}
              />
            </div>

            {/* Trade */}
            <FilterGroup label={`Contractor Type${filters.contractorTypes?.length ? ` (${filters.contractorTypes.length})` : ''}`}>
              <div className="space-y-1">
                {ALL_TYPES.map((t) => (
                  <Checkbox
                    key={t}
                    checked={filters.contractorTypes?.includes(t) ?? false}
                    onChange={() => setFilters({ ...filters, contractorTypes: toggleArr(filters.contractorTypes, t) as ContractorType[] })}
                    label={t}
                  />
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="License">
              <div className="space-y-1">
                {ALL_STATUS.map((s) => (
                  <Checkbox
                    key={s}
                    checked={filters.licenseStatus?.includes(s) ?? false}
                    onChange={() => setFilters({ ...filters, licenseStatus: toggleArr(filters.licenseStatus, s) as LicenseStatus[] })}
                    label={s}
                  />
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Company Size">
              <div className="space-y-1">
                {ALL_SIZES.map((s) => (
                  <Checkbox
                    key={s}
                    checked={filters.companySizes?.includes(s) ?? false}
                    onChange={() => setFilters({ ...filters, companySizes: toggleArr(filters.companySizes, s) as CompanySize[] })}
                    label={s}
                  />
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Business Maturity">
              <div className="space-y-1">
                {ALL_MATURITY.map((m) => (
                  <Checkbox
                    key={m}
                    checked={filters.maturity?.includes(m) ?? false}
                    onChange={() => setFilters({ ...filters, maturity: toggleArr(filters.maturity, m) as BusinessMaturity[] })}
                    label={m}
                  />
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Lead Quality">
              <div className="space-y-1">
                <Checkbox checked={!!filters.hasWebsite} onChange={() => setFilters({ ...filters, hasWebsite: !filters.hasWebsite })} label="Has website" />
                <Checkbox checked={!!filters.hasEmail} onChange={() => setFilters({ ...filters, hasEmail: !filters.hasEmail })} label="Has email" />
                <Checkbox checked={!!filters.hasVerifiedEmail} onChange={() => setFilters({ ...filters, hasVerifiedEmail: !filters.hasVerifiedEmail })} label="Verified email" />
                <Checkbox checked={!!filters.hasPhone} onChange={() => setFilters({ ...filters, hasPhone: !filters.hasPhone })} label="Has phone" />
              </div>
              <div className="mt-3">
                <label className="text-xs flex justify-between mb-1">
                  <span>Min confidence</span>
                  <span className="font-semibold tabular-nums">{filters.minConfidence ?? 0}%</span>
                </label>
                <input
                  type="range" min={0} max={100} step={5}
                  value={filters.minConfidence ?? 0}
                  onChange={(e) => setFilters({ ...filters, minConfidence: Number(e.target.value) || undefined })}
                  className="w-full accent-[hsl(var(--cf-primary))]"
                />
              </div>
            </FilterGroup>
          </div>
        </aside>

        {/* Results column */}
        <section className="col-span-12 lg:col-span-9 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
              <ViewToggle active={view === 'cards'} onClick={() => setView('cards')} icon={LayoutGrid} label="Cards" />
              <ViewToggle active={view === 'list'} onClick={() => setView('list')} icon={List} label="List" />
              <ViewToggle active={view === 'map'} onClick={() => setView('map')} icon={MapPinned} label="Map" />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span style={{ color: 'hsl(var(--cf-text-muted))' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2 py-1.5 rounded-md outline-none cursor-pointer"
                style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
              >
                <option value="confidence">Confidence</option>
                <option value="rating">Rating</option>
                <option value="reviews">Review count</option>
                <option value="recent">Recently verified</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {results.length === 0 ? (
            <div className="rounded-xl py-24 text-center" style={{ background: 'hsl(var(--cf-surface))', border: '1px dashed hsl(var(--cf-border))' }}>
              <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
              <p className="text-sm font-medium">No contractors match these filters</p>
              <button onClick={clearFilters} className="text-xs mt-2 font-semibold" style={{ color: 'hsl(var(--cf-primary))' }}>Clear filters</button>
            </div>
          ) : view === 'cards' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {results.map((c) => (
                <ContractorCard key={c.contractor_id} c={c} onSelect={() => setSelectedId(c.contractor_id)} />
              ))}
            </div>
          ) : view === 'list' ? (
            <ContractorTable contractors={results} onSelect={setSelectedId} />
          ) : (
            <MapView contractors={results} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </section>
      </div>

      {selected && <ContractorDetailDrawer contractor={selected} onClose={() => { setSelectedId(null); setSearchParams({}); }} />}

      {/* Save segment modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSaveModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="rounded-xl p-6 w-full max-w-md" style={{ background: 'hsl(var(--cf-surface))' }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Bookmark className="w-4 h-4" /> Save segment</h3>
            <p className="text-xs mb-4" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              Save these {results.length} contractors and active filters as a reusable list.
            </p>
            <input
              autoFocus
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSegment()}
              placeholder="Segment name"
              className="w-full text-sm px-3 py-2 rounded-md outline-none mb-4"
              style={{ background: 'hsl(var(--cf-surface-alt))', border: '1px solid hsl(var(--cf-border))' }}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSaveModal(false)} className="text-sm px-3 py-2">Cancel</button>
              <button
                onClick={handleSaveSegment}
                disabled={!segmentName.trim()}
                className="text-sm font-semibold text-white px-4 py-2 rounded-md disabled:opacity-50"
                style={{ background: 'hsl(var(--cf-primary))' }}
              >Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewToggle({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
      style={
        active
          ? { background: 'hsl(var(--cf-primary))', color: 'white' }
          : { color: 'hsl(var(--cf-text-muted))' }
      }
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function FilterGroup({ label, children, defaultOpen = true }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t pt-4" style={{ borderColor: 'hsl(var(--cf-border))' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--cf-text-subtle))' }}>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && children}
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer py-0.5 hover:text-[hsl(var(--cf-text))]" style={{ color: 'hsl(var(--cf-text-muted))' }}>
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-[hsl(var(--cf-primary))] w-3.5 h-3.5" />
      <span>{label}</span>
    </label>
  );
}

function ContractorCard({ c, onSelect }: { c: Contractor; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="text-left rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5"
      style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-base shrink-0"
          style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
        >
          {c.company_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{c.company_name}</div>
          <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
            {c.contractor_type} · {c.city}, {c.state}
          </div>
        </div>
        <LicenseStatusBadge status={c.license_status} />
      </div>

      <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'hsl(var(--cf-text-muted))' }}>
        {c.review_rating && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" style={{ color: 'hsl(var(--cf-warning))' }} />
            <strong style={{ color: 'hsl(var(--cf-text))' }}>{c.review_rating}</strong>
            <span>({c.review_count})</span>
          </span>
        )}
        <span>·</span>
        <span>{c.estimated_company_size}</span>
        <span>·</span>
        <span>{c.years_in_business}y</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {c.source_urls.map((s) => <SourceBadgePill key={s} source={s} />)}
      </div>

      <div className="flex items-center justify-between gap-2">
        <CompletenessIcons contractor={c} />
        <div className="flex-1 max-w-[100px]"><ConfidenceMeter score={c.confidence_score} size="sm" /></div>
      </div>
    </button>
  );
}

function ContractorTable({ contractors, onSelect }: { contractors: Contractor[]; onSelect: (id: string) => void }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide" style={{ background: 'hsl(var(--cf-surface-alt))', color: 'hsl(var(--cf-text-subtle))' }}>
          <tr>
            <th className="text-left px-4 py-2.5 font-semibold">Company</th>
            <th className="text-left px-3 py-2.5 font-semibold">Trade</th>
            <th className="text-left px-3 py-2.5 font-semibold">Location</th>
            <th className="text-left px-3 py-2.5 font-semibold">License</th>
            <th className="text-left px-3 py-2.5 font-semibold">Size</th>
            <th className="text-left px-3 py-2.5 font-semibold">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {contractors.map((c) => (
            <tr key={c.contractor_id} onClick={() => onSelect(c.contractor_id)} className="cursor-pointer hover:bg-[hsl(var(--cf-surface-alt))] border-t" style={{ borderColor: 'hsl(var(--cf-border))' }}>
              <td className="px-4 py-2.5 font-medium">{c.company_name}</td>
              <td className="px-3 py-2.5 text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>{c.contractor_type}</td>
              <td className="px-3 py-2.5 text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>{c.city}, {c.state}</td>
              <td className="px-3 py-2.5"><LicenseStatusBadge status={c.license_status} /></td>
              <td className="px-3 py-2.5 text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>{c.estimated_company_size}</td>
              <td className="px-3 py-2.5 w-32"><ConfidenceMeter score={c.confidence_score} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MapView({ contractors, selectedId, onSelect }: { contractors: Contractor[]; selectedId: string | null; onSelect: (id: string) => void }) {
  // Simple lat/lng → screen mapping, contained to CA area
  const minLat = 32, maxLat = 39, minLng = -123, maxLng = -116;
  const norm = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * 100,
    y: 100 - ((lat - minLat) / (maxLat - minLat)) * 100,
  });
  return (
    <div
      className="rounded-xl relative h-[640px] overflow-hidden"
      style={{
        background: 'hsl(var(--cf-surface))',
        border: '1px solid hsl(var(--cf-border))',
        backgroundImage:
          'radial-gradient(hsl(var(--cf-border)) 1px, transparent 1px), radial-gradient(hsl(var(--cf-border)) 1px, hsl(var(--cf-surface)) 1px)',
        backgroundSize: '32px 32px, 32px 32px',
        backgroundPosition: '0 0, 16px 16px',
      }}
    >
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: 'hsl(var(--cf-surface) / 0.95)', border: '1px solid hsl(var(--cf-border))' }}>
          California · {contractors.length} pins
        </span>
      </div>
      {contractors.map((c) => {
        const { x, y } = norm(c.latitude, c.longitude);
        const isSel = c.contractor_id === selectedId;
        return (
          <button
            key={c.contractor_id}
            onClick={() => onSelect(c.contractor_id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className="w-3 h-3 rounded-full ring-2 ring-white transition-all group-hover:scale-150"
              style={{
                background: isSel ? 'hsl(var(--cf-danger))' : 'hsl(var(--cf-primary))',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}
            />
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-semibold whitespace-nowrap px-1.5 py-0.5 rounded shadow"
              style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
              {c.company_name}
            </div>
          </button>
        );
      })}
    </div>
  );
}
