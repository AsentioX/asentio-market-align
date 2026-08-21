# ToDoooZ — Spatial Productivity App (Labs)

A new Labs app at `/labs/todoooz`: a 3D spatial task matrix with Work/Personal mode switching, a rules-based AI Chief of Staff, a Google Workspace calendar sidebar, and an AR passthrough theme for smart glasses.

## Decisions locked in
- Real per-user Google OAuth — each user can connect **two separate Google accounts**: one for Work, one for Personal (Calendar + Tasks on each)
- AI Chief of Staff is rules-based (deterministic from due dates, recency, progress)
- Z-axis depth via CSS 3D transforms (crisp text, AR-friendly)

## What gets built

### Shell and global controls
- Header: "ToDoooZ" gradient wordmark + "Your Tasks in 3D"
- Mode switcher: Work / Personal / Unified — filters matrix, tasks, calendar, and nudges
- Grouping switcher: By Project / By Client-Category / By Topic
- Environment switcher: AR Passthrough (pure `#000000`), Slate Dark, 360° Studio
- Cmd+K global search scoped to the active mode
- Profile menu with two Google account slots (Work / Personal), each showing the connected email, sync status, and Connect / Reconnect / Disconnect actions

### 3D spatial matrix
- X columns: Today / This Week / This Month / Backlog
- Y rows: Critical (red) / High (amber) / Core Operations (blue) / Low Touch (gray)
- Z depth from `last_activity_timestamp`: <1h forward + glow, <24h mid, older flat
- Drag a card between cells to update its X/Y coordinates

### Project cards
- Context pill, avatar/logo badge, title, priority pill
- Top 2–3 ranked micro-tasks with working checkboxes, progress bar
- Inline expand for up to 10 subtasks; click opens the detail drawer

### Calendar sidebar (320px, collapsible)
- Filters by active mode; Agenda view and 24-hour Time view with a live now-line
- Events show location, meeting link, and linked project tag

### AI Chief of Staff (floating glass card, bottom-right)
- Mode-aware avatar and badge
- Rules-based nudges: overdue tasks, today's deadlines, calendar conflicts/back-to-backs, stale projects
- Daily completion ring for the active mode

### Detail drawer — 6 tabs
1. What's Last Been Said — activity summaries + paste/upload import for notes (e.g. Granola)
2. Stakeholders / Contacts
3. Actionable Tasks — checklist, due dates, Google Tasks sync, "spawn as card"
4. Project Overview & Milestones — goals + document links
5. Prioritization Logic — plain-language explanation of the X/Y/Z placement
6. Schedule & Calendar — due dates, linked events, checkpoints

## Technical section

- Route `/labs/todoooz` (nested tabs inside one layout), added to the nav/footer hide list, and a new Labs card entry.
- Tables prefixed `tdz_` with RLS scoped to `auth.uid()` and explicit GRANTs: `tdz_projects`, `tdz_tasks`, `tdz_activity_logs`, `tdz_stakeholders`, `tdz_calendar_events`. Fields follow the schema in the request, with `user_id` added to every table. `tdz_calendar_events` and synced tasks carry an `account_slot` ('work' | 'personal') so data from the two Google accounts stays separated and mode filtering is exact.
- Auth: Google sign-in via the existing Supabase auth setup, isolated to this app (own provider/guard, like WO.Buddy and PerkPath). Signing in is separate from connecting data accounts — a user can sign in once and attach two Google accounts.
- Google data: per-user Google App User Connector (Calendar + Tasks scopes). Connection keys are stored server-side and encrypted in a `tdz_google_connections` table keyed by `(user_id, account_slot)`, so one row holds the Work account and another the Personal account. The connect flow is launched twice — once per slot — and each stores the returned account email for display. This needs a one-time OAuth client setup step from you; until it is connected, the sidebar and task sync fall back to locally stored data so the app stays fully usable.
- Edge functions: `tdz-google-sync` takes an `account_slot`, decrypts that slot's connection key, and pulls calendar events + task lists for that account (and pushes task completion back). Unified mode fans out to both slots and merges results.
- Rules engine and matrix math live in `src/pages/labs/todoooz/lib/` — no AI calls.
- Styling: Tailwind `perspective-1000` / `transform-gpu` / `translate-z-*` utilities added to the config; glassmorphic cards (`backdrop-blur-md`, `bg-slate-900/80`, `border-white/10`); indigo-violet for Work, emerald-cyan for Personal; shadcn Dialog, Drawer, Badge, Progress, Tabs, Card, Switch, ToggleGroup; Lucide icons.
- Seed data on first sign-in so the matrix is populated immediately.

## Build order
1. Schema + RLS migration, route, layout shell, theming
2. Matrix grid, cards, Z-depth, drag-to-move
3. Detail drawer with all 6 tabs
4. Calendar sidebar + Chief of Staff nudges
5. Google OAuth connect + sync edge function
