# Human + AI Framework section on the homepage

Replace the "Four forces, one convergence" band on the homepage with a new section that explains Asentio's human-first framework and answers "what makes the HAI Directory different?".

## What gets built

**1. Two-column intro (40 / 60)**
- Left: eyebrow "THE HUMAN + AI FRAMEWORK", heading "Everything Begins with the Human", the supporting copy as provided, a primary button "Explore the HAI Directory" (to `/hai-directory`, with CTA analytics tracking like the hero) and a secondary text link "Learn about our methodology" pointing at the methodology block on `/work-with-us`.
- Right: the uploaded framework infographic, rounded corners, soft shadow, preserved aspect ratio. Clicking (or tapping) opens it in a lightbox dialog at full size.

**2. Interactive framework companion (below the image)**
Four connected cards — Human Activities → Human Capabilities → AI Capabilities → Human Interface — horizontal on desktop with arrow connectors, vertical with downward arrows on mobile. Hover (and tap on touch) reveals the card's guiding question plus its five example values from the provided lists.

**3. Scroll animation**
When the section enters the viewport, each card and its connecting arrow fade/slide in in sequence, roughly 400–600 ms per step, using the site's existing scroll-reveal approach.

**4. "Why this framework matters"**
A heading plus four rounded cards: Better Products, Better Investments, Better Strategy, Better Decisions, with the given one-line descriptions.

## Design

Light background, soft gray dividers, generous whitespace, rounded cards, restrained accent use (thin asentio-red rule on the eyebrow only), no heavy gradients — executive-deck tone rather than marketing infographic. All colors via existing semantic tokens.

## Technical notes

- New component `src/components/home/HumanAIFramework.tsx`, rendered in `src/pages/Index.tsx` in place of the `CONVERGENCE` block (that array and its icon imports get removed).
- Card content (question, examples) defined locally in the component, phrased to match `src/lib/haiFramework.ts` values.
- Infographic uploaded via the Lovable assets CLI to `src/assets/hai-framework-loop.png.asset.json` and imported as a pointer.
- Lightbox uses the existing shadcn `Dialog`.
- Sequencing via an IntersectionObserver in the component (staggered delays), consistent with `AnimatedSection`.
