import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, RotateCcw, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  OFFER_OPTIONS,
  BUILDING_OPTIONS,
  NEED_MULTI_OPTIONS,
  MARKET_OPTIONS,
  PFOption,
  optionByValue,
  prioritizeOptions,
  PartnerQuery,
} from '@/lib/partnerFinder';

interface ColumnProps {
  index: number;
  label: string;
  question: string;
  placeholder: string;
  options: PFOption[];
  context?: (PFOption | undefined)[];
  optional?: boolean;
}

/** Group options into their headings, keeping the prioritised order inside each. */
const useGrouped = (options: PFOption[], context: (PFOption | undefined)[] | undefined) =>
  useMemo(() => {
    const ranked = prioritizeOptions(options, context || []);
    const suggested = new Set(ranked.filter((r) => r.suggested).map((r) => r.option.value));
    const groups: { group: string; items: PFOption[] }[] = [];
    // Suggested first, as their own group.
    const suggestedItems = ranked.filter((r) => r.suggested).map((r) => r.option);
    if (suggestedItems.length > 0) {
      groups.push({ group: 'Suggested for you', items: suggestedItems.slice(0, 6) });
    }
    options.forEach((o) => {
      const existing = groups.find((g) => g.group === o.group);
      if (existing) existing.items.push(o);
      else groups.push({ group: o.group, items: [o] });
    });
    return { groups, suggested };
  }, [options, context]);

const ColumnShell = ({
  index,
  label,
  question,
  optional,
  children,
}: {
  index: number;
  label: string;
  question: string;
  optional?: boolean;
  children: React.ReactNode;
}) => (
  <div className="min-w-0">
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] font-bold text-asentio-red">{index}</span>
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{label}</span>
      {optional && <span className="text-[10px] text-muted-foreground">optional</span>}
    </div>
    <div className="mb-2" />
    {children}
  </div>
);

const SingleSelectColumn = ({
  index,
  label,
  question,
  placeholder,
  options,
  context,
  optional,
  value,
  onChange,
}: ColumnProps & { value?: string; onChange: (v?: string) => void }) => {
  const [open, setOpen] = useState(false);
  const { groups, suggested } = useGrouped(options, context);
  const selected = optionByValue(options, value);

  return (
    <ColumnShell index={index} label={label} question={question} optional={optional}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
              selected
                ? 'border-asentio-red/60 bg-asentio-red/5 text-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-asentio-red/40'
            }`}
          >
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[240px]" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}…`} />
            <CommandList className="max-h-72">
              <CommandEmpty>No match.</CommandEmpty>
              {groups.map((g) => (
                <CommandGroup key={g.group} heading={g.group}>
                  {g.items.map((o) => (
                    <CommandItem
                      key={`${g.group}-${o.value}`}
                      value={`${o.label} ${g.group}`}
                      onSelect={() => {
                        onChange(o.value === value ? undefined : o.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={`mr-2 h-3.5 w-3.5 ${value === o.value ? 'opacity-100 text-asentio-red' : 'opacity-0'}`}
                      />
                      <span className="flex-1">{o.label}</span>
                      {suggested.has(o.value) && g.group !== 'Suggested for you' && (
                        <Sparkles className="w-3 h-3 text-asentio-red/70" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ColumnShell>
  );
};

const MultiSelectColumn = ({
  index,
  label,
  question,
  placeholder,
  options,
  context,
  values,
  onChange,
}: ColumnProps & { values: string[]; onChange: (v: string[]) => void }) => {
  const [open, setOpen] = useState(false);
  const { groups, suggested } = useGrouped(options, context);
  const summary =
    values.length === 0
      ? placeholder
      : values.length === 1
        ? optionByValue(options, values[0])?.label || placeholder
        : `${optionByValue(options, values[0])?.label} +${values.length - 1}`;

  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <ColumnShell index={index} label={label} question={question}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
              values.length > 0
                ? 'border-asentio-red/60 bg-asentio-red/5 text-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-asentio-red/40'
            }`}
          >
            <span className="truncate">{summary}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[240px]" align="start">
          <Command>
            <CommandInput placeholder="Search capabilities…" />
            <CommandList className="max-h-72">
              <CommandEmpty>No match.</CommandEmpty>
              {groups.map((g) => (
                <CommandGroup key={g.group} heading={g.group}>
                  {g.items.map((o) => (
                    <CommandItem
                      key={`${g.group}-${o.value}`}
                      value={`${o.label} ${g.group}`}
                      onSelect={() => toggle(o.value)}
                    >
                      <Check
                        className={`mr-2 h-3.5 w-3.5 ${values.includes(o.value) ? 'opacity-100 text-asentio-red' : 'opacity-0'}`}
                      />
                      <span className="flex-1">{o.label}</span>
                      {suggested.has(o.value) && g.group !== 'Suggested for you' && (
                        <Sparkles className="w-3 h-3 text-asentio-red/70" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ColumnShell>
  );
};

interface WidgetProps {
  onSubmit: (query: PartnerQuery) => void;
  onReset: () => void;
  /** Optional pre-populated selections (e.g. arriving from a use case). */
  initial?: PartnerQuery;
}

const PartnerFinderWidget = ({ onSubmit, onReset, initial }: WidgetProps) => {
  const [offer, setOffer] = useState<string | undefined>(initial?.offer);
  const [building, setBuilding] = useState<string | undefined>(initial?.building);
  const [needs, setNeeds] = useState<string[]>(initial?.needs || []);
  const [market, setMarket] = useState<string | undefined>(initial?.market);

  useEffect(() => {
    if (!initial) return;
    setOffer(initial.offer);
    setBuilding(initial.building);
    setNeeds(initial.needs || []);
    setMarket(initial.market);
  }, [initial]);

  const offerOpt = optionByValue(OFFER_OPTIONS, offer);
  const buildingOpt = optionByValue(BUILDING_OPTIONS, building);
  const needOpts = needs.map((n) => optionByValue(NEED_MULTI_OPTIONS, n));

  const hasAny = !!offer || !!building || needs.length > 0 || !!market;

  const reset = () => {
    setOffer(undefined);
    setBuilding(undefined);
    setNeeds([]);
    setMarket(undefined);
    onReset();
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
        <SingleSelectColumn
          index={1}
          label="I Offer"
          question="What does your company provide?"
          placeholder="Select what you build"
          options={OFFER_OPTIONS}
          value={offer}
          onChange={setOffer}
        />
        <SingleSelectColumn
          index={2}
          label="I'm Building"
          question="What are you trying to enable?"
          placeholder="Select a use case"
          options={BUILDING_OPTIONS}
          context={[offerOpt]}
          value={building}
          onChange={setBuilding}
        />
        <MultiSelectColumn
          index={3}
          label="I Need"
          question="What capability or partner are you looking for?"
          placeholder="Select capabilities"
          options={NEED_MULTI_OPTIONS}
          context={[buildingOpt, offerOpt]}
          values={needs}
          onChange={setNeeds}
        />
        <SingleSelectColumn
          index={4}
          label="Target Market"
          question="Who are you building for?"
          placeholder="Any market"
          options={MARKET_OPTIONS}
          context={[buildingOpt, offerOpt, ...needOpts]}
          optional
          value={market}
          onChange={setMarket}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
        <Button
          type="button"
          disabled={!hasAny}
          onClick={() => onSubmit({ offer, building, needs, market })}
          className="bg-asentio-red hover:bg-asentio-red/90 text-white px-6"
        >
          <Search className="w-4 h-4 mr-2" />
          Find Partners
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default PartnerFinderWidget;
