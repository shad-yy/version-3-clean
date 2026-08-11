# Project Identity & Scope: Sports Data Platform

A real-time sports data platform: live football scores, fixtures, league standings, team
and player statistics, and **official television broadcast listings**.

It is an information service. It does **not** sell, resell, or provide access to any
television or streaming subscription, and does not host or transmit video content.

*   **Repo**: `shad-yy/version-3-clean` (private) · branch `main`
*   **Domain**: **not yet chosen.** Fully parameterised — see §5.
*   **Status**: not deployed.

---

## 1. The two-property split — read this before assuming anything

This codebase was extracted from an IPTV store. The two now live apart:

| | This project | The other one |
|---|---|---|
| Folder | `Downloads/Legalizedsmart-live-tv/smart-live-tv` | `Downloads/smart-live-tv` |
| Repo | `shad-yy/version-3-clean` | `shad-yy/forclaude` |
| Branch | `main` | `Version-3` |
| Domain | TBD (global) | `smartlivetv.co.uk` (UK) |
| What it is | Sports data platform | IPTV/streaming store |
| Commercial content | **Never** | Yes — intentional |

### ⚠️ The plan changed on 2026-08-11. Earlier notes are wrong.

An earlier version of this file said the clean platform would keep `smartlivetv.co.uk`
and the store would move to `smartlivetv-store.com`. **That is no longer the plan, and
`smartlivetv-store.com` is not part of the architecture at all.**

The reversal was driven by Search Console data. Over three months `smartlivetv.co.uk`
earned **67 clicks at average position 36**, and every page earning them was commercial —
the homepage titled "IPTV UK from £12/mo", `/ufc`, `/watch/europa-league`,
`/setup/firestick`. Google has that domain classified as a streaming vendor. Converting
it to a neutral data site would have discarded its only working pages and started the
clean platform with a domain whose history actively works against it.

So: the store keeps the domain it already ranks on, and this platform starts fresh.

### Non-negotiable: no association between the two

The point of the split is that search engines and ad networks cannot connect the
properties. That means:

*   **No links to the store.** Not in the footer, not "our partner store", not a redirect.
*   **No shared brand identity** — different name, logo, wordmark.
*   **No shared analytics property, AdSense ID, or WHOIS contact.**
*   Shared *design system* (colours, type, components) is fine and costs nothing.

The repos have no shared remote and cannot push to each other. Keep it that way.

---

## 2. Product context

*   **Purpose**: capture search traffic for live scores, fixtures and — the actual
    differentiator — *where to watch* a given fixture in a given country.
*   **Positioning**: scores are a commodity. ESPN, BBC Sport, FlashScore and SofaScore
    all do them better and have for years. The defensible ground is
    **"which channel, in which country, at what local time."** Nobody owns that answer.
    `components/homepage/broadcast-resolver.tsx` states it on the homepage; the
    `/watch/[competition]/[country]` matrix is the long-term build.
*   **Audiences**: fans checking scores and fixtures; fans abroad trying to find a legal
    broadcaster; search engines and answer engines looking for structured sports data.

---

## 3. Technical stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/ISR, API routes, static generation |
| Styling | TailwindCSS | Dark glassmorphism, Framer Motion |
| Language | TypeScript | `npx tsc --noEmit` must pass with 0 errors |
| Cache | In-memory TTL + Upstash Redis | See `PATTERNS.md` §2 |
| Testing | Vitest + Playwright | 14 unit tests passing |
| Hosting | Vercel | Not yet deployed |

## 4. Third-party integrations

*   **TheSportsDB (v1)** — leagues, teams, rosters, standings, fixtures, events. Via
    `lib/api/the-sports-db.ts`, key `123`. Free tier is 30 req/min; **throttled to 25**.
*   **NewsData.io** — sports news. 200 requests/day, falls back to mock data on exhaustion.
*   **UFC.com scraper** — events and fight cards, 5-minute cache.
*   **ESPN** — F1 and MMA scoreboards via `/api/espn/*`. ⚠️ The MMA endpoint currently
    returns **503** on every homepage load; upstream failure, not ours.

## 5. Changing the domain

Parameterised — no source change required:

```bash
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_SITE_NAME="Example"
NEXT_PUBLIC_SITE_HOST=example.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
INDEXNOW_HOST=example.com
```

`lib/config/site-url.ts` is the single source of truth for domain, brand name, host and
support address. **Do not hardcode a domain anywhere else.** It previously overrode the
env var in production with a hardcoded constant, which is why a domain change used to be
a 14-file edit.

Naming note: "SmartScore" was considered and rejected — Musitek has shipped SmartScore
music software since 1991, GE HealthCare ships SmartScore 4.0, there is a live USPTO
registration, and both `.com`s are taken. It also names the commodity rather than the moat.

---

## 6. Repository structure

```
smart-live-tv/
├── app/                    # App Router — no commercial routes exist here
│   ├── api/                # Server-side proxies (no /orders, /subscribe, /speed-test)
│   ├── scores/             # Live scores + SportsEvent ItemList schema
│   ├── watch/              # Broadcast guides — the differentiator
│   ├── leagues/ teams/ players/ events/ match/[id]/
│   ├── news/ blog/ ufc/
│   └── page.tsx            # Homepage
├── components/
│   ├── homepage/           # incl. broadcast-resolver.tsx (where-to-watch demo)
│   └── ui/                 # Shared primitives
├── content/blog/           # ⚠️ SOURCE OF TRUTH for blog. 5 published, 17 drafts.
├── lib/
│   ├── api/                # unified-sports-api.ts + low-level clients
│   ├── config/site-url.ts  # Domain/brand single source of truth
│   ├── data/               # broadcast-rights.ts — VERIFY before publishing
│   └── blog/posts.ts       # ⚠️ GENERATED — never edit
├── scripts/generate-posts.js  # Build guard; fails build on commercial copy
├── reports/                # audit-2026-07-31.md + implementation plan
└── memory-bank/            # AUDIT-PROGRESS.md has current status
```

### ⚠️ `smartlivetv-store/` is still present and should be removed

A ~1MB archive of IPTV pages, the channel database, checkout forms and excised marketing
copy. It is excluded from `tsconfig.json` and never built, but it sits in this repo as
dead weight and as IPTV content inside the "clean" tree.

Its contents now exist as **live routes** in the store repo (`shad-yy/forclaude`) —
`app/channels`, `app/setup/[device]`, `app/pricing`, `app/buy`, `app/api/orders`,
`components/channels/channel-library.tsx`. Before deleting, confirm
`smartlivetv-store/archived-from-main-site.md` (excised marketing copy) is either
duplicated there or no longer wanted — it is the one file without an obvious counterpart.
