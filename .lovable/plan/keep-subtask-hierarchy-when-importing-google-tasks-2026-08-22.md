# Keep subtask hierarchy when importing Google Tasks

Today every Google task in a list is imported as a flat subtask on the card. Google Tasks supports one level of nesting (a task can have a parent), and that nesting is currently dropped because the local task table has no parent column.

## What changes

1. Tasks get a parent link, so an imported task nested under another task stays nested.
2. Import reads Google's `parent` and `position` fields and rebuilds the tree, ordering parents first with their children directly beneath in Google's own order.
3. The card view and the detail drawer show child tasks indented under their parent instead of one flat list.
4. Adding a task in the app can still be top-level; when a nested task is edited or completed, the nesting is preserved when pushing back to Google.
5. Deleting a parent task also removes its children (locally and on Google).

## Technical notes

- Migration: add `parent_task_id uuid null references public.tdz_tasks(id) on delete cascade` to `public.tdz_tasks`, plus an index on it. No grant/RLS changes needed — existing owner policy covers it.
- `src/pages/labs/todoooz/lib/types.ts`: add `parent_task_id` to `TdzTask`.
- `src/pages/labs/todoooz/lib/google.ts` (`importGoogleTasks`):
  - extend the `GTask` interface with `parent?: string`.
  - two-pass upsert: insert/update root tasks first, build a `googleTaskId -> local id` map, then upsert children with `parent_task_id` resolved from that map.
  - compute `rank` from a depth-first walk of the Google order (`position` sort) so parent/child stay adjacent.
  - `pushTaskToGoogle`: include `parent` (the parent's `google_task_id`) when creating a child task, using the Tasks API `parent` query parameter on insert.
- `src/pages/labs/todoooz/lib/useToDoooZ.ts`: `deleteTask` also removes local children; expose a helper to group tasks by parent.
- `src/pages/labs/todoooz/components/TaskCard.tsx` and `DetailDrawer.tsx`: render roots, then children indented (small left inset + lighter connector), keeping existing checkbox/edit behaviour.

## Out of scope

Deeper than one level of nesting — Google Tasks itself only supports a single level, so the UI mirrors that.
