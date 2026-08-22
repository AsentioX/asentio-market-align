# Link calendar events to task cards

Today a card's detail drawer shows a "Linked events" list and the calendar sidebar shows a card badge on an event, but there is no way to actually create or remove that link. This adds both directions.

## From the calendar sidebar
- In the event edit panel (pencil icon), add a "Linked card" dropdown listing cards in the current mode, plus "None".
- Saving stores the link and keeps the existing Google Calendar write-back for title/time/location unchanged.
- Outside edit mode, the existing card badge becomes clickable to open that card's detail drawer.

## From the card detail drawer
- In the Schedule tab's "Linked events" section, add a "Link an event" picker listing upcoming unlinked events (title + date, mode-filtered).
- Each linked event row gets an unlink button and shows time/location; clicking the row scrolls the calendar sidebar to it.

## Notes
- The link is local to ToDoooZ (Google Calendar has no card concept), so nothing extra is pushed to Google.
- No schema change needed: `tdz_calendar_events.project_id` already exists with a foreign key to cards.

## Technical
- `useToDoooZ.ts`: reuse `updateEvent` for `{ project_id }` patches; skip the Google push when only `project_id` changes.
- `CalendarSidebar.tsx`: extend the edit draft with `project_id`, add the select, accept an `onOpenCard` callback.
- `DetailDrawer.tsx`: add the picker/unlink UI inside the existing `CollapsibleSection id="schedule-events"`.
- `ToDoooZLayout.tsx`: wire `onOpenCard` and pass the events list already available.
