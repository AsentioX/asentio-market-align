# Deeper task support in ToDoooZ

Five improvements to the Tasks side of a card, all kept in sync with Google Tasks.

## 1. Create subtasks inside card details

Every task row in the Tasks tab gets an "add subtask" action that creates a child task under it (Google Tasks supports one level of nesting, so the action only appears on top-level tasks). New subtasks are pushed to Google under the correct parent, as the existing create path already does.

## 2. Link calendar events to tasks / subtasks

Today an event can be linked to a card only. Events will also be linkable to a specific task:

- In the card's Schedule tab, each linked event gets a task selector ("whole card" or one of the card's tasks).
- In the calendar sidebar, after a card is chosen, a second small selector offers that card's tasks.
- A task row that has an event linked shows a small calendar chip with the date; clicking it opens the Schedule tab.

## 3. Task details panel

Clicking a task title opens an inline expandable detail area with the fields Google Tasks actually stores:

- Title
- Notes (multi-line)
- Due date
- Completed state and completion date (read-only)
- Linked event and linked attachments/links
- Which Google account/list it belongs to (read-only)

Edits save and push back to Google exactly like the current inline edits do.

## 4. Import Google task deadlines and details

The importer already brings across title, notes, due date and status. It will additionally capture the task's completion timestamp, its "hidden/deleted" state (skipped rather than imported), and the Google `updated` timestamp so re-imports do not overwrite newer local edits blindly. Due dates keep Google's date-only semantics.

## 5. Map Google task links to ToDoooZ attachments

Google Tasks exposes attachments as a read-only `links` array (Gmail/Drive references). On import, each link becomes a row in the card's documents list, tagged to the task it came from, so it appears both under the task detail and in "Linked documents". Re-import updates instead of duplicating (matched on task + URL). These links are read-only in Google, so locally added documents stay local — the task detail notes this.

## Technical notes

- Database migration: add `completed_at timestamptz`, `google_updated_at timestamptz`, `event_id uuid` is not needed — instead add `task_id uuid references tdz_tasks(id) on delete set null` to `tdz_calendar_events` (documents already carry `task_id`). Keep grants/RLS in line with the existing `tdz_` policy pattern (owner-only via `user_id`).
- `src/pages/labs/todoooz/lib/types.ts`: extend `TdzTask` (`completed_at`, `google_updated_at`) and `TdzEvent` (`task_id`).
- `src/pages/labs/todoooz/lib/google.ts`:
  - `importGoogleTasks` — request `showCompleted=true&showHidden=false`, skip `deleted` items, persist `completed`, `updated`, and upsert `t.links` into `tdz_documents` with `task_id` and `doc_type` derived from `link.type`/host.
  - `pushTaskToGoogle` already sends title/notes/due/status; no change needed beyond passing `completed_at` through.
- `src/pages/labs/todoooz/lib/useToDoooZ.ts`: `addTask` already accepts `parentTaskId`; expose it through the drawer API, add `linkEventToTask(eventId, taskId)` reusing the existing local-only `updateEvent` path (no Google write, since Google Calendar has no task field), and load task-scoped documents (already loaded per card).
- `src/pages/labs/todoooz/components/DetailDrawer.tsx`: add subtask button per root task, expandable `TaskDetail` block (notes/due/links/event), event↔task selector in the Schedule tab.
- `src/pages/labs/todoooz/components/CalendarSidebar.tsx`: task selector shown once a card is linked.
