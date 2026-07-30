import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search, X } from 'lucide-react';
import { HAI_DIMENSIONS, HAIDimension, haiValueLabel } from '@/lib/haiFramework';
import { HAISelections } from '@/hooks/useXRCompanies';

interface HAIFilterPanelProps {
  selections: HAISelections;
  onChange: (selections: HAISelections) => void;
  logic: 'AND' | 'OR';
  onLogicChange: (logic: 'AND' | 'OR') => void;
}

const HAIFilterPanel = ({ selections, onChange, logic, onLogicChange }: HAIFilterPanelProps) => {
  const activeCount = Object.values(selections).reduce((sum, v) => sum + (v?.length || 0), 0);

  const toggle = (dimension: HAIDimension, value: string) => {
    const current = selections[dimension.key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...selections, [dimension.key]: next });
  };

  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Refine by human</h2>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onChange({})} className="h-7 px-2 text-xs">
              <X className="w-3 h-3 mr-1" /> Clear all ({activeCount})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
          {(['AND', 'OR'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onLogicChange(mode)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                logic === mode
                  ? 'bg-asentio-red text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Match {mode === 'AND' ? 'all' : 'any'}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {HAI_DIMENSIONS.map((dimension) => (
            <FilterGroup
              key={dimension.key}
              dimension={dimension}
              selected={selections[dimension.key] || []}
              onToggle={(value) => toggle(dimension, value)}
              onClear={() => onChange({ ...selections, [dimension.key]: [] })}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

const FilterGroup = ({
  dimension,
  selected,
  onToggle,
  onClear,
}: {
  dimension: HAIDimension;
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) => {
  const [open, setOpen] = useState(selected.length > 0);
  const [term, setTerm] = useState('');

  const values = dimension.values.filter((v) =>
    haiValueLabel(dimension.key, v).toLowerCase().includes(term.toLowerCase())
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{dimension.label}</p>
          <p className="text-[11px] text-muted-foreground truncate">{dimension.question}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected.length > 0 && (
            <Badge className="bg-asentio-red text-primary-foreground text-[10px] px-1.5">{selected.length}</Badge>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-3">
          {dimension.values.length > 8 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={`Search ${dimension.label.toLowerCase()}`}
                className="h-8 pl-8 text-xs"
                aria-label={`Search within ${dimension.label}`}
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {values.map((value) => {
              const id = `${dimension.key}-${value}`;
              return (
                <label
                  key={value}
                  htmlFor={id}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer py-0.5"
                >
                  <Checkbox
                    id={id}
                    checked={selected.includes(value)}
                    onCheckedChange={() => onToggle(value)}
                  />
                  {haiValueLabel(dimension.key, value)}
                </label>
              );
            })}
            {values.length === 0 && <p className="text-xs text-muted-foreground">No matches.</p>}
          </div>

          {selected.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-7 px-2 text-xs">
              Clear {dimension.label}
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default HAIFilterPanel;
