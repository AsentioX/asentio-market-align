# Move "Asentio Perspective" into the Company Detail header

## Goal
Move the "Asentio Perspective" block from its current standalone section near the bottom of `CompanyDetail.tsx` into the header section, immediately after the company description paragraph.

## Current state
- `src/pages/CompanyDetail.tsx` renders the "Asentio Perspective" as its own `<section>` (lines 239–250), placed after the Solution Fit and before the Detailed Capabilities section.
- The header section (lines 165–224) contains a two-column grid. The left column (`lg:col-span-2`) shows the category badges, mission statement, and description paragraph (lines 177–182), followed by the meta row (HQ, size, products, website).
- The perspective value is already extracted at line 113: `const perspective = company?.asentio_perspective;`

## Plan

1. **Remove** the standalone "Asentio Perspective" `<section>` (lines 239–250) from its current position near the bottom of the page.

2. **Insert** the perspective block into the header section, immediately after the description paragraph (after line 182, before the meta `<div>` at line 184). Keep the same visual treatment (red left-border card, `asentio-blue/5` background, `Sparkles` label, proprietary-analysis footnote) so it reads as editorial commentary attached to the company overview.

3. Place it inside the left column (`lg:col-span-2`), so it sits inline with the mission/description copy — directly "just after the company description" as requested.

### Layout after change (header section, left column)
```
[category / role badges]
[mission statement (italic)]
[description paragraph]
[Asentio Perspective card]   ← moved here
[meta row: HQ / size / products / website]
```

## Files changed
- `src/pages/CompanyDetail.tsx` — move the perspective block; no other sections touched.

## Verification
- Build passes (harness auto-checks).
- Visit `/hai-directory/company/frontline-io` in preview: the "Asentio Perspective" card appears right under the description in the header, and no longer appears as a separate section further down the page.
