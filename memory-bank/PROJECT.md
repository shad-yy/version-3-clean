# Project Identity & Scope: Smart Live TV

Smart Live TV (`smartlivetv.co.uk`) is a legitimate, high-performance sports telemetry platform, live scores aggregator, match fixture guide, and official TV broadcast directory designed for global sports fans. It provides real-time scores, team/league analytics, sports news, and official television broadcast listings across Premier League, Champions League, La Liga, Serie A, UFC, and Formula 1.

---

## 1. Architecture & Domain Boundary Separation

The project enforces a strict boundary between the main sports platform and the commercial store:

*   **Main Domain (`smartlivetv.co.uk`)**: *Target state* — 100% legitimate digital sports hub containing zero grey-market IPTV terminology, illegal streaming claims, or subscription sales; able to pass Google AdSense, SEO, and legal scrutiny.
    > **⚠️ As of 2026-07-31 this is a goal, not the current state.** An audit found 234 `iptv` matches across 26 live files, IPTV articles surfaced on the homepage, a trial funnel on every `/match/[id]` page, and two live commercial POST endpoints (`/api/orders`, `/api/subscribe`). See `reports/audit-2026-07-31.md`. Do not describe the main domain as clean until Phase 1 of `reports/implementation-plan-2026-07-31.md` is verified complete.
*   **Store Domain (`smartlivetv-store.com`)**: Standalone commercial store portal. All commercial subscription options, IPTV channel libraries, pricing plans, device setup wizards, and payment checkouts are archived in the `smartlivetv-store/` root folder and targeted for deployment on `smartlivetv-store.com`.

---

## 2. Product Context & Objectives

*   **Primary Purpose**: Capture search traffic during major sports seasons (Premier League, UEFA Champions League, La Liga, Serie A, UFC, F1, and World Cup 2026) by offering reliable real-time match telemetry, official broadcast schedules, and team statistics.
*   **Core Value Proposition**: "Real-time Sports Telemetry & Official Broadcast Guide" — combining live score widgets (refreshed every 60s), league standings, official broadcast directory listings, and curated sports news in a dark-mode glassmorphism interface.
*   **Key Audiences**:
    *   Sports fans looking for real-time scores, fixture times, and official TV channel listings.
    *   Search engines and review bots looking for structured, compliant, high-authority sports landing pages.
    *   Store customers redirected via external links (`https://smartlivetv-store.com/buy`).

---

## 3. Technical Stack

| Layer | Technology | Usage & Configuration |
|---|---|---|
| **Core Framework** | Next.js 14 (App Router) | Handles SSR/ISR, API routing, and static page generation. |
| **Styling** | Vanilla CSS / TailwindCSS | Dark-themed glassmorphism UI, Framer Motion animations. |
| **Language** | TypeScript | Strict compilation (`npx tsc --noEmit` verified with 0 errors). |
| **State & Cache** | Redis / SWR / In-Memory | Aggressive caching layers for API quotas and local state. |
| **Validation** | TypeScript / Custom Schema | API response validation using `expectedKey` structures. |
| **Testing** | Playwright & Vitest | End-to-end user flows and unit testing for core API layers. |
| **Hosting** | Vercel | Production deployments for `smartlivetv.co.uk`. |

---

## 4. Third-Party Integrations

### TheSportsDB (v1)
*   **Purpose**: Provider for sports leagues, teams, rosters, standings, fixtures, and events.
*   **Access Pattern**: Fetches go through `lib/api/the-sports-db.ts` utilizing API key `123`.
*   **Rate Limits**: Free tier allows 30 requests/minute. App is throttled at **25 requests/minute** for safety.
*   **Caching**: 30 days for static data (leagues, teams, profiles) and 5 min / 1 min for dynamic score events.

### NewsData.io
*   **Purpose**: Fetches real-time sports news articles.
*   **Access Pattern**: Unified proxy server-side calling `newsAPI`.
*   **Quota**: 200 requests/day. Strict fallback to mock news data on failure/exhaustion.

### UFC.com (Scraper)
*   **Purpose**: Live scraping of UFC events, fighter stats, and fight cards.
*   **Access Pattern**: HTML parsing via server-side scraper with a strict 5-minute cache.

---

## 5. Repository Structure

```
smart-live-tv/
├── app/                      # Main Site (smartlivetv.co.uk - Clean Sports Telemetry Hub)
│   ├── api/                  # Server-side API endpoints & proxies
│   ├── leagues/              # League listings & standings views
│   ├── teams/                # Team profile views
│   ├── scores/               # Live matches and real-time score feeds
│   ├── watch/                # Clean sports broadcast & matchday guides
│   ├── buy/ & free-trial/    # Redirect stubs to smartlivetv-store.com
│   ├── pricing/              # Redirect stub to smartlivetv-store.com/pricing
│   ├── news/ & blog/         # Sports news articles & editorial content
│   └── page.tsx              # Homepage (Cleaned of IPTV/sales copy)
├── components/               # Main Site UI components
│   ├── homepage/             # Sports score widgets, matchday sliders, service pillars
│   ├── layout/               # Clean Header (NAV: Scores, Leagues, News, UFC, Blog) & Footer
│   └── ui/                   # Shared UI primitives (OptimizedImage, ShimmerButton, modals)
├── smartlivetv-store/        # Archive Folder for Store Site (smartlivetv-store.com)
│   ├── README.md             # Store setup & architecture documentation
│   ├── pages/                # Store routes (buy, free-trial, channels, iptv-vs-sky-sports, setup)
│   ├── components/           # Store components (channel-library, BuyForm, TrialForm, wizards)
│   └── ui/                   # Store UI elements (PaymentLogos, DeviceIcons, SpeedChecker)
├── data/                     # Local static data JSONs
├── lib/                      # Central utilities & core classes
├── scripts/                  # Automated tool scripts
├── tsconfig.json             # Excludes smartlivetv-store from main build type checks
└── memory-bank/              # Persistent memory for AI agents
```
