# Import Tasks from Google

Add an **Import tasks** action to the ToDoooZ Google accounts panel, next to the existing Contacts and Calendar import buttons, so each linked Work/Personal Google account can pull in its Google Tasks.

## How it works

- Each Google Tasks list becomes a card in the spatial matrix, tagged with that account's mode (Work or Personal).
- Each task in the list becomes a subtask on that card, keeping its title, notes, due date, and completed state.
- Re-importing updates existing items instead of duplicating them (matched by Google's task id).
- The button shows a spinner while running and a toast with how many tasks came in, plus the usual "needs re-authorisation" state if the account's access has expired.

## Scope requirement

Google Tasks needs a new permission (`tasks.readonly`) that the current authorisation does not include. Accounts linked before this change must be re-authorised once — the panel will prompt for this when the import returns a permission error.

## Technical notes

- Add `https://www.googleapis.com/auth/tasks.readonly` to `GOOGLE_SCOPES` in `src/pages/labs/todoooz/lib/google.ts`.
- New `importGoogleTasks(userId, slot, email)` in the same file: `GET /tasks/v1/users/@me/lists`, then `GET /tasks/v1/lists/{id}/tasks?showCompleted=true&showHidden=false`, using the existing `gfetch` helper so token handling and `GoogleAuthNeeded` behave like the calendar import.
- Persistence: upsert one `tdz_projects` card per list (matched on user + mode + title, `context_label` set to the list name), then upsert `tdz_tasks` rows on `google_task_id` with `account_slot` set — both columns already exist.
- Expose `syncTasks(slot)` from `useToDoooZ.ts` alongside `syncContacts` / `syncCalendar`, refreshing cards and tasks in local state on success.
- Wire an `onSyncTasks` prop through `ToDoooZLayout.tsx` into `GoogleAccountsPanel.tsx`, reusing the existing `run(...)` loading pattern and button styling.
