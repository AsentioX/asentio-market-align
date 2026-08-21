import React from 'react';
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
}) => {
  const tasksFor = (id: string) => tasks.filter((t) => t.project_id === id);

  const cellCards = (bucket: TdzBucket, priority: TdzPriority) =>
    sortCards(cards.filter((c) => c.time_bucket === bucket && c.priority === priority));

  const handleDrop = (e: React.DragEvent, bucket: TdzBucket, priority: TdzPriority) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/tdz-card');
    if (!id) return;
    onPatch(id, { time_bucket: bucket, priority });
    const kids = childrenOf.get(id) ?? [];
    const card = cardById.get(id);
    if (card?.collapsed) kids.forEach((k) => onPatch(k.id, { time_bucket: bucket, priority }));
  };

  return (
    <div className="min-w-[900px] [perspective:1400px]">
      <div className="grid grid-cols-[120px_repeat(4,minmax(0,1fr))] gap-2">
        <div />
        {BUCKETS.map((b) => (
          <div key={b.key} className="pb-1 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{b.label}</div>
            <div className="text-[10px] text-white/35">{b.hint}</div>
          </div>
        ))}

        {PRIORITIES.map((p) => (
          <div key={p.key} style={{ display: 'contents' }}>
            <div className="flex items-start">
              <div
                className="w-full rounded-lg border px-2 py-3 text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  borderColor: `hsl(${p.hsl} / 0.35)`,
                  background: `hsl(${p.hsl} / 0.08)`,
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
              return (
                <div
                  key={`${p.key}-${b.key}`}
                  data-cell={`${b.key}:${p.key}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, b.key, p.key)}
                  className={cn(
                    'group/cell min-h-[132px] rounded-xl border border-white/5 bg-white/[0.02] p-2',
                    'transition-colors hover:border-white/15 [transform-style:preserve-3d]',
                  )}
                >
                  <div className="space-y-2">
                    {roots.map((card) => {
                      const kids = childrenOf.get(card.id) ?? [];
                      const inCell = kids.filter((k) => k.time_bucket === b.key && k.priority === p.key);
                      return (
                        <div key={card.id} className="space-y-2">
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
                            onDragStart={(e) => e.dataTransfer.setData('text/tdz-card', card.id)}
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
