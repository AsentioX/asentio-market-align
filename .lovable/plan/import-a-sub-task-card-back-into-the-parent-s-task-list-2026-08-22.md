# Import a sub-task card back into the parent's task list

The "Sub-task cards" block in the card detail drawer lists child cards that were spawned from tasks. There is no way to reverse that: turning a child card back into a task on the parent card. This adds that reverse operation, mirroring the existing `spawnCard` flow.

## What changes

### 1. New action: `importCardAsTask`

In `src/pages/labs/todoooz/lib/useToDoooZ.ts`, add `importCardAsTask(childCard: TdzCard, parentCardId: string)`:

1. Create a task on `parentCardId` with `childCard.title` and `childCard.due_date` (top-level task, mirroring how the spawned task originally sat on the parent).
2. Collect all tasks currently on `childCard.id` (in their existing `rank` order, preserving any existing `parent_task_id` relationships among themselves).
3. Move that whole set onto `parentCardId` using the existing `moveTasksToCard` path (which clears `google_task_id` and re-pushes).
4. After the move, set each former top-level task of the child card (those whose `parent_task_id` was null on the child card) to be a subtask of the new task — via the existing `setTaskParent`, which also issues the Google Tasks `move` call. Tasks that were already nested under each other keep their relative parent so the sub-tree is preserved under the new task.
5. Delete the child card with `deleteCard`.

This is the exact inverse of `spawnCard` in `ToDoooZLayout.tsx`, which creates a card, moves the task's descendants onto it, then deletes the source task.

### 2. Drawer UI

In `src/pages/labs/todoooz/components/DetailDrawer.tsx`, the "Sub-task cards" list (around line 285–302) currently renders each child as a button that opens the child card. Add a small "Import as task" action to each row (an icon button or a right-aligned text link) that calls `api.importCardAsTask(child, card.id)`. Keep the existing click-to-open behavior on the title; the import action is a separate control.

Because the operation deletes the child card, confirm with a light inline confirmation or a `window.confirm` (consistent with the existing delete-card confirm). After import, the child disappears from the list and a new task appears in the Tasks tab (and, since the drawer reads tasks live, no manual refresh is needed).

### 3. Wire the API surface

- `Props.api` in `DetailDrawer.tsx` gains `importCardAsTask: (child: TdzCard, parentId: string) => void`.
- `ToDoooZLayout.tsx` passes `tdz.importCardAsTask` into the drawer's `api` object alongside the existing `spawnCard`.

## Technical notes

- No schema changes — `tdz_tasks`, `tdz_projects`, and `parent_task_id`/`parent_id` already support everything needed.
- Google sync reuses existing primitives (`moveTasksToCard` re-pushes via `pushTask`; `setTaskParent` calls `moveGoogleTask`; `deleteCard` is local-only as today, matching how the spawn undo deletes the card without a Google-side task).
- Files touched: `lib/useToDoooZ.ts`, `components/DetailDrawer.tsx`, `ToDoooZLayout.tsx`.
