import React from 'react';
import { Check, Tags, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTagLibrary } from '../lib/tagContext';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

const TagFilterBar: React.FC<Props> = ({ value, onChange }) => {
  const { tags, colorFor } = useTagLibrary();

  const toggle = (name: string) =>
    onChange(value.includes(name) ? value.filter((t) => t !== name) : [...value, name]);

  const label =
    value.length === 0 ? 'All tags' : value.length === 1 ? value[0] : `${value.length} tags`;

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition',
              value.length ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white',
            )}
          >
            <Tags className="h-3.5 w-3.5" />
            {label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-80 w-56 overflow-y-auto">
          <DropdownMenuLabel className="text-xs">Filter by tag</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tags.length === 0 && (
            <div className="px-2 py-2 text-xs text-muted-foreground">No tags yet.</div>
          )}
          {tags.map((tag) => {
            const active = value.includes(tag.name);
            return (
              <DropdownMenuItem
                key={tag.id}
                onSelect={(e) => {
                  e.preventDefault();
                  toggle(tag.name);
                }}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: colorFor(tag.name) }}
                />
                <span className="flex-1 truncate">{tag.name}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </DropdownMenuItem>
            );
          })}
          {value.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onChange([])} className="text-xs">
                Clear filter
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {value.map((name) => (
        <button
          key={name}
          onClick={() => toggle(name)}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-white"
          style={{ background: `${colorFor(name)}33`, border: `1px solid ${colorFor(name)}66` }}
        >
          {name}
          <X className="h-3 w-3 opacity-70" />
        </button>
      ))}
    </div>
  );
};

export default TagFilterBar;
