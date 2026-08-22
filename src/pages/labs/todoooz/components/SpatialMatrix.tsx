import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';
import { BUCKETS, PRIORITIES, sortCards } from '../lib/matrix';
import type { TdzBucket, TdzCard, TdzPriority, TdzTask } from '../lib/types';

interface Props {
  cards: TdzCard[];
  tasks: TdzTask[];
  cardById: Map<string, TdzCard>;
  childrenOf: Map<string, TdzCard[]>;
  focusedId: string | null;
  onFocus: (id: string) => void;
  onOpen: (id: string) => void;
  onToggleTask: (task: TdzTask) => void;
  onPatch: (id: string, patch: Partial<TdzCard>) => void;
  onCreate: (bucket: TdzBucket, priority: TdzPriority) => void;
  onAddSub: (parentId: string) => void;
  onDelete: (id: string) => void;
  onReorder: (ordered: TdzCard[]) => void;
}

const SpatialMatrix: React.FC<Props> = ({
  cards,
  tasks,
  cardById,
  childrenOf,
  focusedId,
  onFocus,
  onOpen,
  onToggleTask,
  onPatch,
  onCreate,
  onAddSub,
  onDelete,
  onReorder,
}) => {
  const tasksFor = (id: string) => tasks.filter((t) => t.project_id === id);

  /** Where the dragged card would land: null beforeId means "end of the cell". */
  const [dropTarget, setDropTarget] = useState<
    { bucket: TdzBucket; priority: TdzPriority; beforeId: string | null } | null
  >(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const cellCards = (bucket: TdzBucket, priority: TdzPriority) =>
    sortCards(cards.filter((c) => c.time_bucket === bucket && c.priority === priority));

  const moveCard = (id: string, bucket: TdzBucket, priority: TdzPriority) => {
    onPatch(id, { time_bucket: bucket, priority });
    const kids = childrenOf.get(id) ?? [];
    const card = cardById.get(id);
    if (card?.collapsed) kids.forEach((k) => onPatch(k.id, { time_bucket: bucket, priority }));
  };

  /** Resolve the insertion anchor for a hover over `targetId` in a given cell. */
  const anchorFor = (
    e: React.DragEvent,
    targetId: string,
    bucket: TdzBucket,
    priority: TdzPriority,
  ): string | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    if (!after) return targetId;
    const list = cellCards(bucket, priority).filter((c) => c.id !== draggingId);
    const idx = list.findIndex((c) => c.id === targetId);
    return idx >= 0 && idx + 1 < list.length ? list[idx + 1].id : null;
  };

  const handleDrop = (e: React.DragEvent, bucket: TdzBucket, priority: TdzPriority) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/tdz-card');
    const anchor = dropTarget?.bucket === bucket && dropTarget.priority === priority ? dropTarget.beforeId : null;
    setDropTarget(null);
    setDraggingId(null);
    if (!id) return;
    const source = cardById.get(id);
    if (!source) return;
    if (source.time_bucket !== bucket || source.priority !== priority) moveCard(id, bucket, priority);
    const list = cellCards(bucket, priority).filter((c) => c.id !== id);
    const index = anchor ? list.findIndex((c) => c.id === anchor) : -1;
    if (index < 0) onReorder([...list, source]);
    else onReorder([...list.slice(0, index), source, ...list.slice(index)]);
  };

  /** Drop directly on a card: reorder within the cell, or move in then place. */
  const handleCardDrop = (
    e: React.DragEvent,
    targetId: string,
    bucket: TdzBucket,
    priority: TdzPriority,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData('text/tdz-card');
    const anchor = anchorFor(e, targetId, bucket, priority);
    setDropTarget(null);
    setDraggingId(null);
    if (!id || id === targetId) return;
    const source = cardById.get(id);
    if (!source) return;
    if (source.time_bucket !== bucket || source.priority !== priority) moveCard(id, bucket, priority);

    const list = cellCards(bucket, priority).filter((c) => c.id !== id);
    const index = anchor ? list.findIndex((c) => c.id === anchor) : -1;
    if (index < 0) onReorder([...list, source]);
    else onReorder([...list.slice(0, index), source, ...list.slice(index)]);
  };

  /** hsl string for a priority key, used to color the drop line after the dragged card. */
  const hslForPriority = (key: TdzPriority) =>
    PRIORITIES.find((p) => p.key === key)?.hsl ?? '0 0% 70%';

  /** The colored insertion marker rendered between cards, matching the dragged card's priority. */
  const draggedHsl = draggingId ? hslForPriority(cardById.get(draggingId)?.priority ?? 'core') : null;
  const DropLine = ({ hsl }: { hsl: string }) => (
    <div className="relative h-0.5 rounded-full" style={{ background: `hsl(${hsl})` }}>
      <span
        className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
        style={{ background: `hsl(${hsl})` }}
      />
    </div>
  );



  return (
    <div className="min-w-[900px] [perspective:1400px]">
      <div className="grid grid-cols-[40px_repeat(4,minmax(0,1fr))] gap-2">
        <div />
        {BUCKETS.map((b) => (
          <div key={b.key} className="pb-1 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{b.label}</div>
            <div className="text-[10px] text-white/35">{b.hint}</div>
          </div>
        ))}

        {PRIORITIES.map((p) => (
          <div key={p.key} style={{ display: 'contents' }}>
            <div className="flex h-full items-center justify-center">
              <div
                className="px-1.5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  color: `hsl(${p.hsl})`,
                }}
              >
                {p.label}
              </div>
            </div>
            {BUCKETS.map((b) => {
              const list = cellCards(b.key, p.key);
              const roots = list.filter((c) => !c.parent_id || !cardById.has(c.parent_id));
              const orphanChildren = list.filter((c) => c.parent_id && cardById.has(c.parent_id));
              const active = dropTarget?.bucket === b.key && dropTarget.priority === p.key;
              return (
                <div
                  key={`${p.key}-${b.key}`}
                  data-cell={`${b.key}:${p.key}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!active || dropTarget?.beforeId !== null)
                      setDropTarget({ bucket: b.key, priority: p.key, beforeId: null });
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                    if (active) setDropTarget(null);
                  }}
                  onDrop={(e) => handleDrop(e, b.key, p.key)}
                  className={cn(
                    'group/cell min-h-[132px] rounded-xl border p-2',
                    'transition-colors hover:border-white/20 [transform-style:preserve-3d]',
                  )}
                  style={{
                    borderColor: `hsl(${p.hsl} / ${active ? 0.55 : 0.12})`,
                    background: `hsl(${p.hsl} / ${active ? 0.09 : 0.05})`,
                  }}
                >
                  <div className="space-y-2">
                    {roots.map((card) => {
                      const kids = childrenOf.get(card.id) ?? [];
                      const inCell = kids.filter((k) => k.time_bucket === b.key && k.priority === p.key);
                      return (
                        <div
                          key={card.id}
                          className="space-y-2"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const beforeId = anchorFor(e, card.id, b.key, p.key);
                            if (!active || dropTarget?.beforeId !== beforeId)
                              setDropTarget({ bucket: b.key, priority: p.key, beforeId });
                          }}
                          onDrop={(e) => handleCardDrop(e, card.id, b.key, p.key)}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setDropTarget(null);
                          }}
                        >
                          {active && dropTarget?.beforeId === card.id && <DropLine hsl={draggedHsl ?? p.hsl} />}

                          <TaskCard
                            card={card}
                            tasks={tasksFor(card.id)}
                            childCount={kids.length}
                            childDone={kids.filter((k) => k.status === 'done').length}
                            focused={focusedId === card.id}
                            isChild={false}
                            onFocus={() => onFocus(card.id)}
                            onOpen={() => onOpen(card.id)}
                            onToggleTask={onToggleTask}
                            onToggleCollapse={() => onPatch(card.id, { collapsed: !card.collapsed })}
                            onColor={(key) => onPatch(card.id, { color_theme: key })}
                            onAddSub={() => onAddSub(card.id)}
                            onDelete={() => onDelete(card.id)}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/tdz-card', card.id);
                              setDraggingId(card.id);
                            }}
                          />
                          {!card.collapsed &&
                            inCell.map((kid) => (
                              <TaskCard
                                key={kid.id}
                                card={kid}
                                parent={card}
                                tasks={tasksFor(kid.id)}
                                childCount={0}
                                childDone={0}
                                focused={focusedId === kid.id}
                                isChild
                                onFocus={() => onFocus(kid.id)}
                                onOpen={() => onOpen(kid.id)}
                                onToggleTask={onToggleTask}
                                onToggleCollapse={() => undefined}
                                onColor={(key) => onPatch(kid.id, { color_theme: key })}
                                onAddSub={() => undefined}
                                onDelete={() => onDelete(kid.id)}
                                onDragStart={(e) => e.dataTransfer.setData('text/tdz-card', kid.id)}
                              />
                            ))}
                        </div>
                      );
                    })}

                    {orphanChildren
                      .filter((kid) => {
                        const parent = cardById.get(kid.parent_id!);
                        return !parent || parent.time_bucket !== b.key || parent.priority !== p.key;
                      })
                      .map((kid) => {
                        const parent = cardById.get(kid.parent_id!) ?? null;
                        if (parent?.collapsed) return null;
                        return (
                          <TaskCard
                            key={kid.id}
                            card={kid}
                            parent={parent}
                            tasks={tasksFor(kid.id)}
                            childCount={0}
                            childDone={0}
                            focused={focusedId === kid.id}
                            isChild
                            onFocus={() => onFocus(kid.id)}
                            onOpen={() => onOpen(kid.id)}
                            onToggleTask={onToggleTask}
                            onToggleCollapse={() => undefined}
                            onColor={(key) => onPatch(kid.id, { color_theme: key })}
                            onAddSub={() => undefined}
                            onDelete={() => onDelete(kid.id)}
                            onDragStart={(e) => e.dataTransfer.setData('text/tdz-card', kid.id)}
                          />
                        );
                      })}

                    {active && dropTarget?.beforeId === null && <DropLine hsl={p.hsl} />}
                  </div>


                  <button
                    onClick={() => onCreate(b.key, p.key)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-white/10 py-1.5 text-[11px] text-white/30 opacity-0 transition hover:border-white/30 hover:text-white/70 group-hover/cell:opacity-100"
                  >
                    <Plus className="h-3 w-3" /> New card
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpatialMatrix;
