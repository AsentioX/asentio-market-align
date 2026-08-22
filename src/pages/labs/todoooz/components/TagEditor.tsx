import React, { useMemo, useState } from 'react';
import { Check, Plus, Settings2, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DEFAULT_TAG_COLOR, TAG_COLOR_OPTIONS, useTagLibrary } from '../lib/tagContext';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

const chipStyle = (color: string) => ({
  backgroundColor: `${color}26`,
  color,
  border: `1px solid ${color}59`,
});

const TagEditor: React.FC<Props> = ({ value, onChange }) => {
  const { tags, colorFor, createTag, updateTag, deleteTag } = useTagLibrary();
  const [input, setInput] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_TAG_COLOR);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const has = (name: string) => value.some((t) => t.toLowerCase() === name.toLowerCase());

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    return tags.filter((t) => !has(t.name) && (!q || t.name.toLowerCase().includes(q))).slice(0, 8);
  }, [tags, input, value]);

  const exactExists = tags.some((t) => t.name.toLowerCase() === input.trim().toLowerCase());

  const attach = (name: string) => {
    if (!has(name)) onChange([...value, name]);
    setInput('');
  };

  const addNew = async () => {
    const name = input.trim().replace(/,+$/, '').trim();
    if (!name) return;
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (!existing) await createTag(name, newColor);
    attach(existing?.name ?? name);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Tags</span>
        <Popover open={libraryOpen} onOpenChange={setLibraryOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200">
              <Settings2 className="h-3 w-3" /> Tag library
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 border-white/10 bg-slate-950/95 text-white">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
              Tag library ({tags.length})
            </div>
            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2">
                  <span
                    className="flex-1 truncate rounded-full px-2.5 py-1 text-[11px]"
                    style={chipStyle(tag.color)}
                  >
                    {tag.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {TAG_COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        aria-label={`Set ${tag.name} color`}
                        onClick={() => updateTag(tag.id, { color: c })}
                        className="h-3.5 w-3.5 rounded-full ring-offset-1 ring-offset-slate-950"
                        style={{ backgroundColor: c, boxShadow: tag.color === c ? `0 0 0 2px ${c}80` : undefined }}
                      />
                    ))}
                  </div>
                  <button onClick={() => deleteTag(tag.id)} className="text-white/35 hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {tags.length === 0 && <p className="text-xs text-white/40">No tags yet.</p>}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
              style={chipStyle(colorFor(tag))}
            >
              {tag}
              <button
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="opacity-60 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addNew();
            } else if (e.key === 'Backspace' && !input && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          placeholder="Choose an existing tag or type a new one"
          className="border-white/10 bg-white/5 text-sm"
        />
        <Button size="sm" variant="secondary" disabled={!input.trim()} onClick={addNew}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {input.trim() && !exactExists && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wide text-white/40">New tag color</span>
          {TAG_COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              aria-label="New tag color"
              onClick={() => setNewColor(c)}
              className="flex h-4 w-4 items-center justify-center rounded-full"
              style={{ backgroundColor: c }}
            >
              {newColor === c && <Check className="h-2.5 w-2.5 text-white" />}
            </button>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              onClick={() => attach(tag.name)}
              className="rounded-full px-2.5 py-1 text-[11px] transition hover:opacity-80"
              style={chipStyle(tag.color)}
            >
              + {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagEditor;
