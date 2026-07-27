import { CompanyFilters } from '@/hooks/useXRCompanies';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import {
  TAXONOMY,
  AI_XR_FILTERS,
  HUMAN_INTERFACE_MODES,
  COMPANY_TYPES,
  FUNDING_STAGES,
  TARGET_MARKETS,
} from '@/lib/xrTaxonomy';

interface CompanyFilterBarProps {
  filters: CompanyFilters;
  onChange: (filters: CompanyFilters) => void;
  /** Hide the group selector when the page is already scoped to one group. */
  lockedGroup?: string;
}

const REGIONS = ['United States', 'China', 'Japan', 'Korea', 'Taiwan', 'Europe', 'United Kingdom', 'Israel'];

const CompanyFilterBar = ({ filters, onChange, lockedGroup }: CompanyFilterBarProps) => {
  const set = (patch: Partial<CompanyFilters>) => onChange({ ...filters, ...patch });

  const activeGroup = lockedGroup || filters.group;
  const group = TAXONOMY.find((g) => g.slug === activeGroup);
  const categories = group ? group.children : [];

  const activeCount = [
    filters.group && !lockedGroup,
    filters.category,
    filters.companyType,
    filters.aiCapability,
    filters.humanInterface,
    filters.targetMarket,
    filters.fundingStage,
    filters.region,
    filters.editorsPickOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filters.search || ''}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Search companies, technologies, products…"
            className="pl-9"
            aria-label="Search companies"
          />
        </div>

        {!lockedGroup && (
          <Select
            value={filters.group || 'all'}
            onValueChange={(v) => set({ group: v === 'all' ? undefined : v, category: undefined })}
          >
            <SelectTrigger className="md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All categories</SelectItem>
              {TAXONOMY.map((g) => (
                <SelectItem key={g.slug} value={g.slug}>{g.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {categories.length > 0 && (
          <Select
            value={filters.category || 'all'}
            onValueChange={(v) => set({ category: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="md:w-48"><SelectValue placeholder="Subcategory" /></SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All subcategories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filters.companyType || 'all'} onValueChange={(v) => set({ companyType: v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Company type" /></SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Any company type</SelectItem>
            {COMPANY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.humanInterface || 'all'} onValueChange={(v) => set({ humanInterface: v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Human interface" /></SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Any interface</SelectItem>
            {HUMAN_INTERFACE_MODES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.targetMarket || 'all'} onValueChange={(v) => set({ targetMarket: v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Market" /></SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Any market</SelectItem>
            {TARGET_MARKETS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.fundingStage || 'all'} onValueChange={(v) => set({ fundingStage: v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Any stage</SelectItem>
            {FUNDING_STAGES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.region || 'all'} onValueChange={(v) => set({ region: v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Region" /></SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Any region</SelectItem>
            {REGIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button
          variant={filters.editorsPickOnly ? 'default' : 'outline'}
          onClick={() => set({ editorsPickOnly: !filters.editorsPickOnly })}
          className={filters.editorsPickOnly ? 'bg-asentio-red hover:bg-asentio-red/90' : ''}
        >
          Editor's picks
        </Button>

        {activeCount > 0 && (
          <Button variant="ghost" onClick={() => onChange({ search: filters.search, group: lockedGroup })}>
            <X className="w-4 h-4 mr-1" /> Clear ({activeCount})
          </Button>
        )}
      </div>

      {/* AI x XR discovery chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs uppercase tracking-wide text-muted-foreground mr-1">AI × XR</span>
        {AI_XR_FILTERS.map((chip) => {
          const active = filters.aiCapability === chip;
          return (
            <Badge
              key={chip}
              onClick={() => set({ aiCapability: active ? undefined : chip })}
              className={`cursor-pointer transition-colors ${
                active
                  ? 'bg-asentio-red text-white hover:bg-asentio-red/90'
                  : 'bg-muted text-muted-foreground hover:bg-asentio-blue/10 hover:text-asentio-blue'
              }`}
            >
              {chip}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default CompanyFilterBar;
