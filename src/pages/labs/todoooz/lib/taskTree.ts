import type { TdzTask } from './types';

export interface FlatTask {
  task: TdzTask;
  depth: number;
}

/**
 * Flatten tasks into display order: each root followed by its children.
 * Google Tasks supports a single level of nesting, so depth is 0 or 1.
 */
export const flattenTaskTree = (tasks: TdzTask[]): FlatTask[] => {
  const byRank = (a: TdzTask, b: TdzTask) => a.rank - b.rank;
  const ids = new Set(tasks.map((t) => t.id));
  const children = new Map<string, TdzTask[]>();
  const roots: TdzTask[] = [];
  for (const t of tasks) {
    if (t.parent_task_id && ids.has(t.parent_task_id)) {
      children.set(t.parent_task_id, [...(children.get(t.parent_task_id) ?? []), t]);
    } else {
      roots.push(t);
    }
  }
  const out: FlatTask[] = [];
  for (const root of roots.sort(byRank)) {
    out.push({ task: root, depth: 0 });
    for (const child of (children.get(root.id) ?? []).sort(byRank)) {
      out.push({ task: child, depth: 1 });
    }
  }
  return out;
};
