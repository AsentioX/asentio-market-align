## Goal

Reposition Asentio.com from a consultancy site into an intelligence platform centered on the XR Directory — "The Human Interface to AI". Phase 1 only. Existing visual identity, components, Labs, CRM and analytics are reused; nothing is rebuilt that doesn't need to be.

Scope decisions confirmed: build structure only (no bulk data seeding — you populate via admin), Insights ships as article shells with titles/summaries/SEO, and `xr_companies` becomes the primary directory entity with products linked to it.

---

## 1. Information architecture and navigation

Primary nav becomes: **XR Directory | Insights | Research | About | Work With Us**, with XR Directory visually emphasized (accent-underlined, first position) and a subdued "Contact" action replaced by "Work With Us". The current nav points XR Directory at `/coming-soon` — that redirect is removed so the directory goes live.

Footer is restructured into four columns: Explore, Work With Us, Asentio (About, Jon Li, Labs, Contact), Connect (LinkedIn, Newsletter). Labs stays in the footer only; all `/labs/*` routes are untouched.

Routes added:

```text
/xr-directory/category/[category]
/insights, /insights/[slug]
/research
/about/jon-li
/work-with-us  (+ /executive-briefings, /speaking,
                  /executive-immersions, /strategic-advisory)
/xr-directory/submit
```

`/services` redirects to `/work-with-us`. Existing `/xr-directory/company/:name` becomes the rich company page.

## 2. Homepage

Rebuilt as the front door to the directory, reusing existing section components and the topographic/red-accent identity:

1. **Hero** — "The Human Interface to AI" / "Discover the companies building it." / description; CTAs *Explore the XR Directory* and *Read Our Insights*. Visual: an ecosystem/stack diagram rendered in SVG (no stock photography, no brain graphics).
2. **Featured Directory** — "Explore the Human Interface to AI": category tiles (Devices, Components, AI, Platforms, Applications, Ecosystem) that deep-link into directory-filtered results, plus a live count of tracked companies.
3. **AI × XR discovery strip** — filter chips (AI Glasses, Multimodal AI, Vision AI, Egocentric Vision, Contextual AI, Assistants, Agents, Spatial Intelligence, Voice, Translation, Memory, Computer Vision) linking into the directory.
4. **Human-centered framework** — "Technology Doesn't Create Markets. Human Adoption Does." with the behavior→value chain; links to `/research`.
5. **Replacement Curve** — smartphone vs. AI glasses absorption, framed as a hypothesis.
6. **Latest Insights** — three most recent articles.
7. **Newsletter capture**, then a concise Work With Us band.

The Market Map deep-dive section is Phase 2; the homepage carries only the compact stack graphic.

## 3. Directory: company-first model

`xr_companies` becomes primary. Migration adds: `company_type`, `primary_category`, `subcategories[]`, `technologies[]`, `products_summary`, `target_markets[]`, `ai_capabilities[]`, `human_interface[]`, `funding_stage`, `key_investors[]`, `key_partnerships[]`, `asentio_take`, `status`. `xr_products.company_id` is added and backfilled from the existing `company` text column (10 product rows, 1 company row today) so nothing is lost.

A new taxonomy module defines the six top-level groups and their children exactly as specified, used by filters, category pages, cards and admin forms.

Directory page: search + sticky filter chips, tabs for Companies / Products / Agencies / Use Cases (Companies first). Company cards gain logo, location, type, primary category and tag pills (AI capability, human interface, market).

Company detail page gets sections: Overview, Products, Technology, Human Interface, AI Capabilities, Market, Ecosystem, and a visually distinct **Asentio Take** block.

Category pages at `/xr-directory/category/[category]` render filtered results with dynamic title/description metadata — the SEO engine. Only real taxonomy categories get pages; no thin duplicates.

Mobile: sticky search/filter bar, horizontally scrollable chips, single-column cards. No account required to browse.

## 4. Insights and Research

New `asentio_articles` table (slug, title, summary, body, hero image, author, published_at, categories, tags, related company ids, related categories, SEO fields, status). Index page uses a clean editorial layout; article pages support hero, body, tags, related companies pulled from the directory, and social sharing.

Six shells are created from your listed themes with title, summary, hero image, tags and SEO — bodies left for you to write in the admin.

`/research` ships as a structured landing page with report cards, a gated-flag field on the schema for later, and no payment integration.

## 5. Work With Us, About, Jon Li

Work With Us overview ("Bring Asentio Into the Conversation") plus four sub-pages — Executive Briefings, Speaking, Executive Immersions (Silicon Valley + China, ending in a synthesis workshop), Strategic Advisory — each with its own CTA that routes to a contact form carrying an inquiry-type parameter.

About is reframed as "Understanding Humans. Anticipating Markets." Jon Li gets a dedicated speaker page: bio framed across HCI waves, speaking topics, talks, industries, articles, LinkedIn, and a prominent *Invite Jon to Speak* CTA.

## 6. Newsletter, submissions and attribution

New `asentio_subscribers` (email required; first name, company, role optional; source) and `asentio_submissions` (company/product payload, submitter contact, type: new vs. claim, status pending/approved/rejected). Public insert allowed, public read denied; admin review and approval queue lives in the existing admin dashboard, with approved submissions written into `xr_companies`.

Inquiries and subscriptions record a `source` attribution value (xr_directory, insights, research, speaking, immersion, advisory) and flow into the existing `crm_contacts` pipeline. Existing analytics tracking is extended with directory category, filter and submission events.

## Technical notes

- Migrations: extend `xr_companies` and `xr_products`; create `asentio_articles`, `asentio_subscribers`, `asentio_submissions` with GRANTs and RLS (public read for published articles; public insert only for subscribers/submissions; admin-only writes via `is_ck_admin`-style profile role check).
- Reused unchanged: design tokens in `index.css`, `TopographicPattern`, `AnimatedSection`, `LanguageContext`, existing admin dashboard shell, analytics lib, CRM hooks, all `/labs` routes and the beaver-boat host branch in `App.tsx`.
- Translation keys are added for new nav/hero strings across the four supported languages, defaulting to English copy where no translation is supplied.
- Not in this phase: market map deep-dive page, saved companies/watchlists, funding data ingestion, paid research.

## Verification

Build/typecheck clean, directory reachable from nav on desktop and mobile, category pages render correct filtered sets with unique metadata, newsletter and submission forms write rows successfully as an anonymous visitor, admin can approve a submission, and all existing Labs routes still load.
