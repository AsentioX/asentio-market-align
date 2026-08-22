# One way to find use cases

Today `/hai-directory/use-cases` has two competing discovery paths: the Use Case Finder (Industry / Role / I need to…) that produces a "Recommended use cases" grid, and a separate "Browse all use cases" block with its own search box and five dropdowns (Human Goal, Industry, Role, Human Interface, AI Capability). Both filter the same library in different ways.

## What changes

Keep one path: the Use Case Finder at the top, and one list below it labelled **Browse all use cases**.

- Remove the second filter panel entirely (search box + the five dropdowns) and remove the separate "Recommended use cases" grid.
- The finder's three selections filter the single list live — no separate results section.
- All domain categories stay visible and collapsed by default, always. Each header shows the count of use cases matching the current selections.
- As Industry, Role, or "I need to…" options are picked, the counts update. Domains with zero matches stay listed but are shown dimmed with a count of 0 and are not expandable.
- Expanding a domain shows only the matching use cases, ordered by match strength (highest fit first). With nothing selected, every use case shows in its normal order.
- Reset in the finder returns everything to the unfiltered state.

## Technical notes

- `src/pages/UseCaseExplorer.tsx`: drop the local `search`, `goal`, `iface`, `aiCap` state, the `FilterSelect` component, the `matchesGoal` / `matchesRole` helpers, the `RecommendationCard` grid, and the browse filter panel. Keep the domain accordion as the only result surface.
- `UseCaseFinderWidget` switches from submit-on-click to live reporting of its selections (`onChange` with `{industry, role, jobs}`), so counts move as options are picked. The Reset control stays; the "Find Use Cases" button is removed since results update inline. Analytics `use_case_finder_query` still fires, debounced on selection change.
- Ranking/filtering uses the existing `findUseCaseMatches` from `src/lib/useCaseFinder.ts` with no result cap, mapping scores back onto the use-case list; use cases with no score are excluded when at least one selection is active.
- Company counts per use case (`companiesForUseCase`) stay as-is on each card.
