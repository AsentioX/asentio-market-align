# HAI Directory → Human + AI Solution Discovery Platform

Phase 1: the use-case foundation, solution pages, Partner Finder, and reframed company pages. Market maps, natural-language search, and the Insights knowledge graph follow in a later phase.

## 1. Use Case foundation

A new `hai_use_cases` content type, seeded with the full list from the vision (Enterprise Operations, Knowledge Work, Healthcare, Retail, Manufacturing, Logistics, Education, Public Safety, Media — roughly 35 use cases across 9 domains).

Each use case carries:
- Name, slug, domain/group, short summary, editorial description
- Framework mapping: human activities, human capabilities, AI capabilities, human interfaces, industries, ecosystem roles
- Icon/accent and display order, plus a "featured" flag for the homepage

I seed all of them with mappings; they are then fully editable in the admin dashboard (new "Use Cases" tab with the same sortable table + form pattern used for Companies and Products).

## 2. Directory front door — "What are you trying to build?"

`/hai-directory` is rebuilt so the first thing a visitor sees is the question, not a company table:

- A grid of large, editorial use-case cards grouped by domain
- A search box above it (keyword for now; upgraded to intent parsing in the next phase)
- Companies / Products / Agencies remain available as secondary tabs for people who want to browse the raw database

## 3. Solution pages

New route `/hai-directory/solutions/:slug` — one page per use case, e.g. Remote Maintenance:

```text
Hero: use case name + what the human is trying to accomplish
  ↓
Framework strip: Human Activities → Human Capabilities → AI Capabilities → Human Interfaces
  ↓
Solution Stack: companies grouped by ecosystem role
   Intelligence · Experience · Distribution · Services
  ↓
Products that serve this use case
  ↓
Related use cases
```

The Solution Stack is generated automatically from company framework tags — no manual curation, so it stays current as the directory grows. Companies are scored on how many of the use case's dimensions they match and shown highest-fit first, with the matching tags visible on each card.

## 4. Partner Finder (flagship)

New route `/hai-directory/partner-finder`. Two questions:

- **I have** — Smart Glasses, Robot, Voice AI, Computer Vision, AI Agent, Enterprise Software, Sensors, Semiconductor
- **I need** — Voice AI, Computer Vision, Enterprise Customers, Manufacturing, Healthcare, Distribution, Retail, Translation

Results are complementary companies ranked by a compatibility score, each with a plain-English "why this is a match" breakdown: shared use cases, complementary human capabilities, complementary AI capabilities, shared industries, and a fit rating.

## 5. Company pages, reframed

`/hai-directory/company/:name` keeps its overview and products but is reorganised around the framework:

- Overview → Products → **Human Use Cases Supported** (derived from tag overlap) → Human Activities → Human Capabilities → AI Capabilities → Human Interfaces → Industries → Ecosystem Roles
- New **Best Partner Matches** section using the same compatibility engine as Partner Finder, with a star rating and a one-line rationale per match

## 6. Filters

The directory filter bar is extended so Human Use Case sits at the top, above the existing framework dimensions, and filtering by use case works across companies and products.

## Design

Clean, editorial, minimal — Apple / McKinsey / Notion. Generous whitespace, restrained type, the existing asentio-red accent used sparingly for numbering and emphasis. No flashy AI gradients.

## Technical notes

- New table `public.hai_use_cases` (public read, admin write) with text-array framework columns matching `xr_companies`, so matching is a direct array intersection.
- A shared `src/lib/haiMatching.ts` module holds the scoring engine used by solution pages, Partner Finder, and company partner matches — one source of truth for compatibility, no duplicated logic.
- The existing `xr_use_cases` table (XR project showcases) is left untouched; the new solution use cases are a separate concept.
- The current Solution Explorer wizard stays, and its final step links into the matching use case.
- Adds `/hai-directory/solutions/:slug` and `/hai-directory/partner-finder` routes, sitemap entries, and per-page SEO metadata.

## Not in this phase

Interactive market maps, natural-language/intent search, and Insights ↔ use case cross-linking. The data model above is built so each drops in without rework.
