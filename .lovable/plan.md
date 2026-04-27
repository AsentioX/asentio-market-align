# Evolve X1 Smart → Intelligent Home OS

We keep the existing shell (`X1SmartLayout` with AiHome/AiSpaces toggle + 4 tabs) and evolve each surface in place. We add **one new tab — Timeline / Memory** — and a global **Autonomy Level** selector that the whole system reads from.

Nothing gets thrown away. The existing mock data files (`residentialData.ts`, `commercialData.ts`) are extended, not replaced.

---

## 1. Add a 5th tab: Timeline / Memory

In `X1SmartLayout.tsx`, add `Timeline` to the `TABS` array (icon: `Clock`). Create `screens/TimelineMemory.tsx`:

- Vertical chronological rail with day separators ("Today", "Yesterday", "Mon Apr 21")
- Each row: time · pill (AI action / User action / Observation) · who · where · one-line summary
- Filter chips at top: **Person**, **Space**, **Type** (events / decisions / automations)
- Two **Insight cards** pinned at the top of the rail:
  - "Back-door activity ↑ 40% this week"
  - "You've been arriving home ~35 min later than your 30-day average"
- Visual treatment: muted timeline ticks on the left, color of the row dot encodes type (violet=AI, indigo=user, stone=passive)

Data: derive from existing `RES_FEED` / `COM_FEED`, plus a small `TIMELINE_INSIGHTS` array we append to the data files.

---

## 2. Intelligence Feed → Decision Engine

Edit `screens/IntelligenceFeed.tsx`. Keep the hero, tabs, and card structure. Upgrade:

**Urgency rail (left edge of card)**
- `critical` → solid red bar + soft pulsing glow, persistent (cannot be collapsed away)
- `high` (Important) → orange bar
- `normal` / `low` (Informational) → thin neutral bar

**New "Why it matters" line** under the title (one sentence, derived from `reasoning[0]` or a new `whyItMatters` field on events).

**Action source badge** in the meta row — small pill next to the kind label:
- `AI` (violet) for `kind: 'action' | 'suggestion'`
- `You` (indigo) for user-triggered (new field `actor: 'ai' | 'user' | 'system'`)
- `Passive` (stone) for `insight` / `identity` observations

**Inline action set** expands beyond the single suggested-action button. For security/anomaly events:
- Primary: the existing suggested action
- Secondary chips: **View camera**, **Lock all doors**, **Ignore / label person**

**Countdown actions** (the "system-driven behavior"). Add an optional `pendingAction` to events:
```
pendingAction: { label: 'Locking back door', countdownSec: 30 }
```
Renders a thin progress bar + "Locking back door in 24s — Cancel" button. On expiry, toast "Back door locked by X1." If user cancels, toast "Cancelled. X1 won't auto-lock again tonight."

**System voice line** at bottom of the hero, varies by overall state:
- Calm: "Everything looks calm at home."
- Watch: "I'm keeping an eye on the back door."
- Urgent: "Something needs your attention at Warehouse B."

---

## 3. People → Trust + Intent

Edit `screens/residential/ResidentialPeople.tsx` and `screens/commercial/CommercialPeople.tsx`. Extend `Person` type with:

```
trust: 'trusted' | 'familiar' | 'unknown' | 'suspicious'
intent?: string         // "Likely delivering package"
intentConfidence?: number
visitFrequency?: string // "3× this week"
typicalTimes?: string   // "Mon–Fri, 8–10am"
anomalies?: string[]    // ["First nighttime visit"]
linkedAutomations?: { id: string; label: string }[]
```

**Card upgrades:**
- Trust badge in top-right corner (color-coded shield: emerald/indigo/amber/rose)
- Intent line under name with a small sparkle icon: *"Likely arriving home — 92%"*
- Behavior strip: 3 mini-stats (visits this week · typical window · anomaly count)

**Profile drawer (existing detail view):**
- New "Why X1 acted" section listing recent decisions about this person with reasoning
- Linked automations list (clickable → jumps to Autonomy tab)
- Anomaly callouts in amber

---

## 4. Spaces → Adaptive States

Edit `screens/residential/ResidentialSpaces.tsx` and `screens/commercial/CommercialSpaces.tsx`. Replace the static `mode` field with an evolving `adaptiveState`:

```
adaptiveState: {
  current: 'evening-winddown' | 'quiet-night' | 'hosting-guests'
         | 'away-expecting-delivery' | 'business-hours' | 'after-hours-secure'
  confidence: number
  enteredAt: string
  reason: string  // "No motion detected for 20 min"
  next?: { state: string; etaMin: number; reason: string }
}
```

**Per-space card upgrades:**
- Replace the single mode chip with a **State pill** (gradient based on state) + tiny confidence dots
- Reason line: "Switched to Evening Wind-down · No motion 20m · 87% confident"
- "Next state" preview: "→ Quiet Night around 10:30pm"

**State Timeline strip** at the top of the Spaces tab:
- Horizontal mini-timeline showing today's state transitions per space
- Hover/tap a segment for the transition reason

---

## 5. Autonomy → Outcomes + Levels

Edit `screens/residential/ResidentialAutonomy.tsx` and `screens/commercial/CommercialAutonomy.tsx`. Two big changes:

**a) Autonomy Level selector (top of tab, also surfaced as a small chip in the header)**

Three-segment control reading the existing `AUTONOMY_LEVELS`:
- **Assist** — suggestions only
- **Semi-Autonomous** — ask before acting (default)
- **Full Autonomy** — act on high-confidence, review after

Stored in component state (no backend persistence — this is a prototype lab). Layout header chip shows current level so it's visible from any tab.

**b) Goals → Rules (outcome-based UI)**

Replace the IF/THEN rule list with a **Goals stack**:

```
Goal: "Keep my home secure at night"
  Generated rules (3) · Based on 23 nights of behavior
  ▸ Lock all doors at 10pm                 92% confidence
  ▸ Arm cameras when last person leaves    88% confidence
  ▸ Alert on unknown faces after dark      95% confidence
```

Each generated rule card shows:
- Confidence bar (0–100%)
- Reasoning line ("Based on 23 of last 30 nights")
- Impact tags: 🛡 Security · ⚡ Energy · ✨ Convenience
- Per-rule action: **Enable** / **Modify** / **Skip**

Predefined goals to seed: *Keep my home secure at night*, *Make mornings smooth*, *Optimize energy usage*, plus a "+ New goal" tile.

---

## 6. System Personality (microcopy pass)

A small `systemVoice.ts` helper that returns lines based on overall state:
- Greetings vary by hour and threat level
- Action narration uses first person: "I noticed something unusual near the back door."
- Urgency tone scale: calm → watchful → direct
- Wired into: hero greeting, Decision Engine countdown actions, toast notifications, state transitions

---

## 7. Motion + visual polish

- State pills animate gradient on transition (already using framer-motion)
- Critical decision cards get a subtle pulsing left rail
- Countdown actions show a sweeping progress bar
- Timeline rows fade-in with stagger
- Keep the existing warm `#fafaf7` palette and gradient blob backgrounds — no visual reset

---

## Files

**New**
- `src/pages/labs/x1-smart/screens/TimelineMemory.tsx`
- `src/pages/labs/x1-smart/systemVoice.ts`

**Edited**
- `src/pages/labs/x1-smart/X1SmartLayout.tsx` — add Timeline tab, autonomy-level chip
- `src/pages/labs/x1-smart/x1Data.ts` — extend types (`trust`, `intent`, `adaptiveState`, `pendingAction`, `actor`, `whyItMatters`, goals)
- `src/pages/labs/x1-smart/residentialData.ts` — add trust/intent/state/goal fields to mock data
- `src/pages/labs/x1-smart/commercialData.ts` — same
- `src/pages/labs/x1-smart/screens/IntelligenceFeed.tsx` — decision-engine upgrades
- `src/pages/labs/x1-smart/screens/residential/ResidentialPeople.tsx`
- `src/pages/labs/x1-smart/screens/commercial/CommercialPeople.tsx`
- `src/pages/labs/x1-smart/screens/residential/ResidentialSpaces.tsx`
- `src/pages/labs/x1-smart/screens/commercial/CommercialSpaces.tsx`
- `src/pages/labs/x1-smart/screens/residential/ResidentialAutonomy.tsx`
- `src/pages/labs/x1-smart/screens/commercial/ResidentialAutonomy.tsx` *(commercial file)*

---

## Out of scope (call out so expectations match)

- No new backend tables — this stays a prototype lab (per Labs Prototyping principle: clickable polish over backend complexity)
- No floorplan/spatial overlay or conversational AI panel in this pass — those are listed as "optional" in the brief and would each be substantial additions; can follow as a v2 once you've reacted to this evolution
- Autonomy level + countdown cancellations are session-only state
