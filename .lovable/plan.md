# Card color everywhere

Two small visual fixes so the card's chosen color theme (not the priority row color) drives these UI bits.

## 1. Drag insertion line
In the spatial matrix, the drop indicator currently uses the dragged card's priority color. Switch it to the dragged card's resolved color theme (its own `color_theme`, inheriting from its parent card when unset), falling back to the priority color only when no card is resolvable.

## 2. Linked card tag in the calendar sidebar
The badge showing which card an event is linked to is currently neutral. Tint its text, border and background with that card's resolved color theme, so it visually matches the card in the matrix.

## Technical notes
- `src/pages/labs/todoooz/components/SpatialMatrix.tsx`: replace `hslForPriority(...)` for `draggedHsl` with `resolveTheme(card, parentCard).hsl` from `../lib/theme`.
- `src/pages/labs/todoooz/components/CalendarSidebar.tsx`: for the linked-card chip (around the `cardById.get(e.project_id)` lookup), apply inline `color`/`borderColor`/`background` from `resolveTheme(project, parent).hsl` at appropriate alphas.
- No data or schema changes.
