import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { HAI_DIMENSIONS, HAIDimensionKey, haiValueLabel } from '@/lib/haiFramework';
import { HAISelections } from '@/hooks/useXRCompanies';

/** Dimensions shown in the Companies filter bar, in order. */
const BAR_DIMENSIONS: { key: HAIDimensionKey; label: string; width: string }[] = [
  { key: 'hai_category', label: 'Category', width: 'w-[150px]' },
  { key: 'human_activities', label: 'Human Activities', width: 'w-[180px]' },
  { key: 'human_capabilities', label: 'Human Capabilities', width: 'w-[190px]' },
  { key: 'ai_capabilities', label: 'AI Capabilities', width: 'w-[170px]' },
  { key: 'physical_platforms', label: 'AI Platforms', width: 'w-[160px]' },
  { key: 'industry_focus', label: 'Industry', width: 'w-[140px]' },
];

interface CompanyHAIFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selections: HAISelections;
  onChange: (selections: HAISelections) => void;
}

const CompanyHAIFilterBar = ({
  search,
  onSearchChange,
  selections,
  onChange,
}: CompanyHAIFilterBarProps) => {
  const activeCount = Object.values(selections).reduce((sum, v) => sum + (v?.length || 0), 0);

  const toggle = (key: HAIDimensionKey, value: string) => {
    const current = selections[key] || [];
    onChange({
      ...selections,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search companies, activities, AI capabilities..."
          className="pl-10"
          aria-label="Search companies"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {BAR_DIMENSIONS.map(({ key, label, width }) => {
          const dimension = HAI_DIMENSIONS.find((d) => d.key === key)!;
          const selected = selections[key] || [];
          return (
            <Popover key={key}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`${width} justify-between bg-background font-normal`}
                >
                  <span className="truncate">
                    {selected.length > 0 ? `${label} (${selected.length})` : label}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className={`p-0 bg-background border shadow-lg z-50 ${
                  key === 'hai_category' ? 'w-[340px]' : 'w-64'
                }`}
              >
                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                  {[...dimension.values]
                    .sort((a, b) =>
                      haiValueLabel(key, a).localeCompare(haiValueLabel(key, b)),
                    )
                    .map((value) => {
                    const id = `${key}-${value}`;
                    return (
                      <label
                        key={value}
                        htmlFor={id}
                        className="flex items-start gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <Checkbox
                          id={id}
                          className="mt-0.5"
                          checked={selected.includes(value)}
                          onCheckedChange={() => toggle(key, value)}
                        />
                        <span>{haiValueLabel(key, value)}</span>
                      </label>
                    );
                  })}
                </div>
                {selected.length > 0 && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => onChange({ ...selections, [key]: [] })}
                    >
                      Clear {label}
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          );
        })}

        {activeCount > 0 && (
          <Button variant="ghost" onClick={() => onChange({})}>
            <X className="w-4 h-4 mr-1" /> Clear ({activeCount})
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompanyHAIFilterBar;
