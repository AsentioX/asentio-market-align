# Live drop indicator when dragging cards

Show a colored insertion line in the matrix while a card is being dragged, so you can see exactly where it will land before releasing the mouse.

## Behaviour

- While dragging a card over another card, a 2px horizontal line appears above or below that card, depending on whether the cursor is in the top or bottom half of it.
- The line uses the target cell's priority color (red for Critical, amber for High, blue for Medium, slate for Low), with a small dot cap on the left so it reads as an insertion marker.
- Hovering over the empty area of a cell (not over a card) shows the line at the end of that cell's list, and the cell border highlights in the same priority color.
- The indicator disappears on drop, on drag leave, and on drag end.
- Drop behaviour itself is unchanged except that dropping in the bottom half of a card now inserts after it rather than before.

## Technical notes

Contained in `src/pages/labs/todoooz/components/SpatialMatrix.tsx`:

- Local state `dropTarget: { bucket, priority, beforeId: string | null } | null`, cleared in `onDragEnd`/`onDrop`/cell `onDragLeave`.
- Card wrappers get an `onDragOver` that computes the midpoint from `e.currentTarget.getBoundingClientRect()` and sets `beforeId` to the target card id (top half) or the next card in the cell (bottom half).
- Cell-level `onDragOver` sets `beforeId: null` (append at end) when the event is not from a card.
- Rendering: a `<div>` line with `background: hsl(<priority hsl>)` rendered before the matching card, plus at the end of the list when `beforeId` is null.
- `handleCardDrop` reuses the same before/after computation so the visual line and the committed order match; existing `onReorder`/`moveCard` calls stay as they are.
