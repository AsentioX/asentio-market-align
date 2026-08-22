import React, { useState } from 'react';
import { ChevronsDownUp, ChevronsUpDown, CornerDownRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import ColorSwatchRow from './ColorSwatchRow';
import { depthStyle, depthTier } from '../lib/matrix';
import { resolveTheme, themeVars } from '../lib/theme';
import type { TdzCard, TdzTask } from '../lib/types';
import { useTagLibrary } from '../lib/tagContext';

interface Props {
  card: TdzCard;
  parent?: TdzCard | null;
  tasks: TdzTask[];
  childCount: number;
  childDone: number;
  focused: boolean;
  isChild: boolean;
  onFocus: () => void;
  onOpen: () => void;
  onToggleTask: (task: TdzTask) => void;
  onToggleCollapse: () => void;
  onColor: (key: string | null) => void;
  onAddSub: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const TaskCard: React.FC<Props> = ({
  card,
  parent,
  tasks,
  childCount,
  childDone,
  focused,
  isChild,
  onFocus,
  onOpen,
  onToggleTask,
  onToggleCollapse,
  onColor,
  onAddSub,
  onDelete,
  onDragStart,
}) => {
  const [expanded, setExpanded] = useState(true);
  const { colorFor } = useTagLibrary();

  const theme = resolveTheme(card, parent);
  const tier = depthTier(card);
  const top = tasks.slice(0, 3);
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : card.progress;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          role="gridcell"
          tabIndex={-1}
          aria-selected={focused}
          data-card-id={card.id}
          draggable
          onDragStart={onDragStart}
          onClick={() => {
            onFocus();
          }}
          onDoubleClick={onOpen}
          style={{ ...themeVars(theme, isChild ? 0.55 : 1), ...depthStyle(tier) }}
          className={cn(
            'group relative cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 backdrop-blur-md',
            isChild
              ? 'bg-[hsl(var(--tdz-accent)/0.06)]'
              : 'bg-[hsl(var(--tdz-accent)/0.15)]',
            'border-[hsl(var(--tdz-accent)/0.35)] hover:border-[hsl(var(--tdz-accent)/0.7)]',
            isChild && 'ml-4 scale-[0.97] border-dashed',
            focused && 'ring-2 ring-[hsl(var(--tdz-accent))] ring-offset-2 ring-offset-transparent',
            tier === 'hot' && 'shadow-[0_0_28px_-6px_hsl(var(--tdz-accent)/0.8)]',
          )}
        >
          <span
            className="absolute inset-y-2 left-0 w-[3px] rounded-full"
            style={{ background: `hsl(var(--tdz-accent) / ${isChild ? 0.55 : 1})` }}
          />
          {isChild && (
            <span
              className="absolute -left-4 top-1/2 h-px w-4"
              style={{ background: `hsl(var(--tdz-accent) / 0.5)` }}
              aria-hidden
            />
          )}

          <div className="mb-1 flex items-center gap-1">
            {isChild && parent ? (
              <div className="flex min-w-0 flex-1 items-center gap-1 text-[10px] text-white/45">
                <CornerDownRight className="h-3 w-3 shrink-0" />
                <span className="truncate">{parent.title}</span>
              </div>
            ) : (
              <span className="flex-1" />
            )}
            <button
              type="button"
              title="View details"
              aria-label="View details"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="shrink-0 rounded p-0.5 text-white/45 hover:bg-white/10 hover:text-white"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title={expanded ? 'Minimize card' : 'Expand card'}
              aria-label={expanded ? 'Minimize card' : 'Expand card'}
              aria-expanded={expanded}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="shrink-0 rounded p-0.5 text-white/45 hover:bg-white/10 hover:text-white"
            >
              {expanded ? <ChevronsDownUp className="h-3.5 w-3.5" /> : <ChevronsUpDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="mb-1.5">
            <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-white">{card.title}</h4>
          </div>



          {expanded && (
            <>
              {top.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {top.map(({ task: t, depth }) => (
                    <li
                      key={t.id}
                      style={{ marginLeft: depth ? 14 : 0 }}
                      className="flex items-center gap-2 text-xs text-white/70"
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => onToggleTask(t)}
                        className="h-3.5 w-3.5 shrink-0 rounded border-white/30 bg-transparent accent-[hsl(var(--tdz-accent))]"
                      />
                      <span className={cn('truncate', t.done && 'text-white/35 line-through')}>{t.title}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Progress value={pct} className="h-1 bg-white/10" />

              <div className="mt-2 flex items-center justify-between text-[10px] text-white/45">
                <span className="flex items-center gap-1.5">
                  {(card.context_label ?? '')
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-full px-2 py-0.5 uppercase tracking-wide"
                        style={{
                          backgroundColor: `${colorFor(tag)}26`,
                          color: colorFor(tag),
                          border: `1px solid ${colorFor(tag)}59`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                </span>
                <div className="flex items-center gap-2" />

              </div>
            </>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={onOpen}>Open details</ContextMenuItem>
        <ContextMenuItem onSelect={onAddSub} disabled={isChild}>
          Add sub-task card
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuLabel className="text-xs">Color theme</ContextMenuLabel>
        <div className="px-2 pb-2">
          <ColorSwatchRow value={card.color_theme} onChange={onColor} allowInherit={isChild} />
        </div>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive" onSelect={onDelete}>
          Delete card
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TaskCard;
