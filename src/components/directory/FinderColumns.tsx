import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { PFOption, optionByValue, prioritizeOptions } from '@/lib/partnerFinder';

/** Group options into their headings, floating context-relevant ones to the top. */
const useGrouped = (options: PFOption[], context: (PFOption | undefined)[] | undefined) =>
  useMemo(() => {
    const ranked = prioritizeOptions(options, context || []);
    const suggested = new Set(ranked.filter((r) => r.suggested).map((r) => r.option.value));
    const groups: { group: string; items: PFOption[] }[] = [];
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

export const ColumnShell = ({
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
    <p className="text-[11px] text-muted-foreground mt-0.5 mb-2 line-clamp-1">{question}</p>
    {children}
  </div>
);

const triggerClass = (active: boolean) =>
  `w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
    active
      ? 'border-asentio-red/60 bg-asentio-red/5 text-foreground'
      : 'border-border bg-background text-muted-foreground hover:border-asentio-red/40'
  }`;

interface BaseProps {
  index: number;
  label: string;
  question: string;
  placeholder: string;
  options: PFOption[];
  context?: (PFOption | undefined)[];
  optional?: boolean;
  disabled?: boolean;
}

export const SingleSelectColumn = ({
  index,
  label,
  question,
  placeholder,
  options,
  context,
  optional,
  disabled,
  value,
  onChange,
}: BaseProps & { value?: string; onChange: (v?: string) => void }) => {
  const [open, setOpen] = useState(false);
  const { groups, suggested } = useGrouped(options, context);
  const selected = optionByValue(options, value);

  return (
    <ColumnShell index={index} label={label} question={question} optional={optional}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button type="button" disabled={disabled} className={`${triggerClass(!!selected)} disabled:opacity-50`}>
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

export const MultiSelectColumn = ({
  index,
  label,
  question,
  placeholder,
  options,
  context,
  disabled,
  values,
  onChange,
}: BaseProps & { values: string[]; onChange: (v: string[]) => void }) => {
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
        <PopoverTrigger asChild disabled={disabled}>
          <button type="button" disabled={disabled} className={`${triggerClass(values.length > 0)} disabled:opacity-50`}>
            <span className="truncate">{summary}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[260px]" align="start">
          <Command>
            <CommandInput placeholder="Search what you need to do…" />
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
