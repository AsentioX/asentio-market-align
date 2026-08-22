# Partner Finder — match the Use Case Finder interaction

## Goal
Make the `/hai-directory/partner-finder` results behave like the Use Case Finder (`/hai-directory/use-cases`): always show the full solution stack (collapsed groups, dimmed when empty), updating live as the user picks options — and remove the result-section eyebrow / heading / description.

## Confirmed current state
- `src/pages/PartnerFinder.tsx` results section (lines 166–223) only renders **after** a query is submitted. It shows an eyebrow divider (`w-12 h-1 bg-asentio-red`), an `<h2>` "N recommended partner(s)", and a description `<p>` (lines 184–190). Groups are filtered to only non-empty layers (`layers.filter(l => l.matches.length > 0)`).
- `src/components/directory/PartnerFinderWidget.tsx` is **submit-based**: it takes `onSubmit` + `onReset`, renders a "Find Partners" button, and only the parent runs matching on submit. It has its own local `ColumnShell` that still shows the `<p>` question descriptions (the shared `FinderColumns` used by the Use Case Finder no longer does).
- `PartnerFinderWidget` is used **only** in `PartnerFinder.tsx` (CompanyPartners.tsx just links to the route), so changing its props is safe.
- `findPartnerMatches` (partnerFinder.ts:285) returns `[]` for an empty query. `findUseCaseMatches` likewise returns `[]` for an empty query — but `UseCaseExplorer` special-cases no-selection to show **all** use cases (`if (!hasSelection) return useCases || []`).

## Changes

### 1. `src/pages/PartnerFinder.tsx` — results section
- Remove the eyebrow divider, the `<h2>` "N recommended partner(s)", and the description `<p>` (lines 184–190).
- Remove the `!query` / `results.length === 0` empty-states. Always render the solution-stack groups.
- Compute `results` so it covers both states, mirroring UseCaseExplorer:
  - **No query:** show **all** companies grouped by solution stack layer (every group populated, none dimmed).
  - **With query:** `findPartnerMatches(...)` filtered subset; groups with zero matches render dimmed (`opacity-50`) and disabled, like UseCaseExplorer's empty domains.
- Groups: render **all** `SOLUTION_LAYERS` (plus "Other") instead of only non-empty ones (`layers.filter(...)` removed). Each group header shows label + count; the existing collapsible/3-column-grid `ResultCard` layout stays.
- Build a lightweight `PartnerRecommendation`-shaped object for the no-query case (score 0, `provides`/`markets` from company fields, empty explanation) so `ResultCard` renders unchanged.

### 2. `src/components/directory/PartnerFinderWidget.tsx` — live interaction
- Replace `onSubmit` with `onChange: (query: PartnerQuery) => void`, fired live via `useEffect` on every selection (same pattern as `UseCaseFinderWidget`).
- Remove the "Find Partners" button + its bordered footer row; keep a Reset button with a short helper text line (mirror `UseCaseFinderWidget`'s footer).
- Remove the `<p>` question descriptions from the local `ColumnShell` so the columns match the (already description-less) Use Case Finder columns.
- Keep `initial` for the use-case-seeded arrival flow.

### 3. `src/pages/PartnerFinder.tsx` — analytics
- Replace the on-submit `trackEvent('partner_finder_query', ...)` with a debounced (1200ms) `trackEvent` inside a `useEffect` on `query`, mirroring UseCaseExplorer's debounced analytics.

## Not changing
- The hero section (divider / h1 / description) — request targets the results section only.
- `ResultCard`, `findPartnerMatches` scoring logic, taxonomy, and `SOLUTION_LAYERS`.
- The route, SEO, and the `?useCase=` seed flow.

## Technical detail
- New no-query helper in `PartnerFinder.tsx`:
  ```ts
  const allAsRecs = (companies: XRCompany[]): PartnerRecommendation[] =>
    (companies || []).map((company) => ({
      company, score: 0,
      provides: company.ai_capabilities?.slice(0, 2) || [],
      useCase: undefined,
      markets: company.industry_focus?.slice(0, 2) || [],
      explanation: '',
    }));
  ```
- `results` becomes: `hasSelection ? findPartnerMatches(companies, query, useCases) : allAsRecs(companies)`.
- `groups` drops the `.filter(l => l.matches.length > 0)` so empty layers render dimmed.
