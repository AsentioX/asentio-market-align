import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

export type SortDir = 'asc' | 'desc';

export interface TableSort<T> {
  key: string | null;
  dir: SortDir;
  toggle: (key: string) => void;
  sorted: T[];
}

/**
 * Alphabetical (locale-aware, numeric-aware) sorting of table rows by a selected column key.
 */
export function useTableSort<T>(
  rows: T[] | undefined,
  accessors: Record<string, (row: T) => string | number | null | undefined>,
  initialKey: string | null = null,
): TableSort<T> {
  const [key, setKey] = useState<string | null>(initialKey);
  const [dir, setDir] = useState<SortDir>('asc');

  const toggle = (nextKey: string) => {
    if (nextKey === key) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setKey(nextKey);
      setDir('asc');
    }
  };

  const sorted = useMemo(() => {
    const list = [...(rows || [])];
    if (!key || !accessors[key]) return list;
    const get = accessors[key];
    const mult = dir === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const aEmpty = av === null || av === undefined || av === '';
      const bEmpty = bv === null || bv === undefined || bv === '';
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult;
      return String(av).localeCompare(String(bv), undefined, { sensitivity: 'base', numeric: true }) * mult;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, key, dir]);

  return { key, dir, toggle, sorted };
}

interface SortableThProps {
  label: string;
  sortKey: string;
  sort: { key: string | null; dir: SortDir; toggle: (key: string) => void };
  className?: string;
}

export const SortableTh = ({ label, sortKey, sort, className = '' }: SortableThProps) => {
  const active = sort.key === sortKey;
  return (
    <th className={`text-left py-3 px-4 font-medium text-muted-foreground ${className}`}>
      <button
        type="button"
        onClick={() => sort.toggle(sortKey)}
        aria-label={`Sort by ${label}`}
        className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${active ? 'text-foreground' : ''}`}
      >
        {label}
        {active ? (
          sort.dir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
        )}
      </button>
    </th>
  );
};
