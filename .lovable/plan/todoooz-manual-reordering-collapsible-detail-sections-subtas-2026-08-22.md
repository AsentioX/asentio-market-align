# ToDoooZ: manual reordering, collapsible detail sections, subtask promotion

## 1. Manual reorder

### Subtasks (card details, Tasks tab)
- Each subtask row gets a drag handle (grip icon) and becomes draggable.
- Dropping a row above/below another row re-sequences the list and writes new `rank` values to `tdz_tasks`.
- Nesting rules are preserved: a child can only be reordered among its siblings under the same parent; dragging a parent moves its children with it.
- Order updates optimistically in the UI, then persists; reload keeps the new order (tasks already load ordered by `rank`).

### Cards (spatial matrix)
- Cards already drag between matrix cells. Adds within-cell ordering: dropping a card onto another card in the same cell places it before/after that card and rewrites `sort_order` for the affected cell.
- Cross-cell drops keep working as today, and the card lands at the drop position rather than always at the end.

### Google write-back
Reordering also syncs to Google Tasks. After a drop, the moved task is sent to Google's Tasks `move` endpoint with its new previous-sibling (and parent, when nested), so the order matches in Google Tasks and other Google clients. Tasks that came from Google are moved in place; tasks with no Google counterpart stay local-only.

## 2. Promoting a subtask into its own card

- When the spawn button turns a subtask into a card, the subtask is removed from the parent card's task list (and deleted from Google Tasks, since the work now lives on the new card). The new card keeps the parent link, so it still shows nested under its parent.
- The confirmation toast offers "Undo", which restores the subtask on the parent card.
- Reversing later: setting the new card's Parent back from the Parent picker in the drawer re-attaches it; clearing the parent leaves it standalone. Re-selecting the original parent also restores the subtask entry on that parent's task list.

## 3. Collapsible sections in card details

Tabs stay as they are. Inside them, each block gets a clickable header with a chevron that expands/collapses:
- Overview: Mode, Tags, Notes, Linked documents (Delete Card stays always visible at the bottom)
- Tasks: Add task + task list
- People: Link from contacts, linked people
- Timeline: activity list
- Schedule: Due date, Linked events

Defaults: all sections expanded. Open/closed state is remembered per section in local storage so the drawer reopens the way you left it.

## Technical notes
- Reordering uses native HTML5 drag-and-drop (already used in `SpatialMatrix.tsx`) — no new dependency.
- Subtask order: renumber `rank` sequentially across the flattened sibling group and batch-update via the backend client; `useToDoooZ` gains a `reorderTasks` action.
- Card order: renumber `sort_order` for the cards in the target bucket/priority cell; extends the existing `handleDrop` with a drop-index computed from the hovered card, plus a thin drop indicator line.
- Collapsible blocks: a small local `Section` component in the drawer (header + chevron + content), state persisted under a `tdz:drawer-sections` key.
- Google order write-back: new `moveGoogleTask` helper in `lib/google.ts` calling `POST tasks/v1/lists/{listId}/tasks/{taskId}/move` with `previous`/`parent`, invoked from `reorderTasks` for tasks that have a `google_task_id`; failures toast but do not revert local order.
- Subtask promotion: `spawnCard` in `ToDoooZLayout.tsx` deletes the source task after creating the card (reusing `deleteTask`, which already handles Google deletion) and stashes it for undo; re-selecting a parent in the drawer's Parent picker recreates a task row on that parent from the card title.
- Files touched: `ToDoooZLayout.tsx`, `components/DetailDrawer.tsx`, `components/SpatialMatrix.tsx`, `components/TaskCard.tsx`, `lib/useToDoooZ.ts`, `lib/google.ts`, `lib/taskTree.ts`. No schema changes needed (`rank` and `sort_order` already exist).
