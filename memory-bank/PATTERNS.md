# Core Architectural Decisions & Code Patterns

This file documents the system design guidelines, coding standards, domain boundaries, and API patterns that must be adhered to during development.

---

## 1. Domain Separation & Architectural Boundaries

### Dual-Domain Architecture Rule
To comply with search engine guidelines (Google AdSense), legal standards, and ad review policies, the project strictly separates content into two distinct boundaries:

1. **Main Sports Telemetry Hub (`smartlivetv.co.uk`)**:
   - Strictly legitimate content: Live scores, match statistics, team profiles, league tables, sports news, and official television broadcast listings.
   - **Zero Tolerance**: No IPTV sales claims, channel counts (e.g. 230K+ channels), pricing tables, illegal streaming guides, or subscription checkout components.
   - All commercial CTAs link externally to `https://smartlivetv-store.com/buy`.

2. **Commercial Store Portal (`smartlivetv-store.com`)**:
   - Archived in `smartlivetv-store/` at project root.
   - Contains subscription pricing, channel directories, device setup wizards (Firestick/Smart TV), and checkout forms.

---

## 2. Core Architectural Decisions

### Unified API Layer Pattern
All queries must be funneled through a single unified layer:
```
Frontend Client Component
  └── API Route Proxy (/api/scores, etc.)
        └── UnifiedSportsAPI (lib/api/unified-sports-api.ts)
              └── Low-Level Clients (e.g., theSportsDB)
                    └── External API Endpoints
```
*   **Rule**: Never import low-level clients (`theSportsDB` / `newsAPI` / `ufcScraper`) directly into React components.
*   **Rule**: All raw third-party responses must be transformed into clean app-level types (`UnifiedTeam`, `UnifiedFixture`, `UnifiedPlayer`) defined in `lib/types.ts`.

### Server-Side Execution Only
*   **Constraint**: All external API calls containing credentials or requiring rate limiting must execute server-side in Next.js API route handlers (`app/api/*/route.ts`) or React Server Components.

### Centralized TTL Caching System
*   **Implementation**: `lib/cache/apiCache.ts` provides a centralized memory cache.
*   **Configuration**:
    *   **30 Days (Static)**: Leagues, Sports, Countries, Team Info, Player Info, Standings.
    *   **1 Hour (Scheduled Events)**: Upcoming and past league schedules.
    *   **5 Minutes (Near Live)**: Live match summaries.
    *   **1 Minute (Real-time Day)**: Today's live events.

---

## 3. Coding Standards & Non-Negotiables

### Error Handling & Fault Tolerance
*   **Graceful Recovery**: API errors must never crash components. All API methods must catch exceptions and return empty lists (`[]`) or cached fallbacks.
*   **User Feedback**: Display friendly placeholders (`"Data temporarily unavailable"`) rather than raw error stacks.
*   **Rate Limiting Guard**: TheSportsDB calls are strictly paced at max 25 requests per minute using token bucket queues.

### Type Safety & Build Hygiene
*   **TypeScript Standard**: Strict TypeScript mode. Run `npx tsc --noEmit` to verify type safety.
*   **Exclude Store Archive**: `tsconfig.json` excludes `"smartlivetv-store"` so archived store code does not pollute type checks for `smartlivetv.co.uk`.

### UI/UX Rules & Asset Rendering
*   **Image Fallbacks**: Render clean CSS-styled letter avatars showing team/player initials when external APIs do not supply image URLs.
*   **Image Component**: All images must use Next.js `Image` wrapper, preferably via `<OptimizedImage />`.

---

### Generated Files — Never Edit Directly
*   `lib/blog/posts.ts` and `public/llms-full.txt` are **auto-generated** by `scripts/generate-posts.js` from `content/blog/*.mdx`.
*   `npm run dev` and `npm run build` both run the generator **first**, so edits to the generated files are silently destroyed on the next run. **Always edit `content/blog/*.mdx`.**
*   The generator's sanitisation currently rewrites **3 link hrefs only** — it does not filter body prose. Treat MDX source as the single source of truth for compliance.

### Caching Rules for Authenticated Routes
*   `/api/auth/*` and `/api/admin/*` must send `Cache-Control: private, no-store`. Never `public`.
*   A blanket `source: '/api/(.*)'` header rule in `next.config.mjs` will apply to auth routes too, and `public` authorises the CDN to replay one user's authenticated response to another.
*   A route that sets its own `Cache-Control` while a blanket rule also matches emits **two** conflicting headers with undefined precedence. One rule per route.

### Rate Limiting — Match the Real Path
*   The admin **login** endpoint is `/api/auth/admin`, **not** `/api/admin/*` (which is health and metrics). Any prefix guard in `middleware.ts` must cover both.
*   Expensive verification (`bcrypt.compare`) must run **after** the rate-limit check and **after** input type/length validation — otherwise unauthenticated requests can saturate the event loop.

---

## 4. TheSportsDB API Endpoint Mapping Gotchas

### 1. League Lookup by Name for Teams
*   **Gotcha**: Endpoint `search_all_teams.php?l={leagueName}` requires the string-based name of the league (e.g. `English_Premier_League`), not its numeric ID.
*   **Pattern**: Lookup league by ID using `lookupleague.php` first to obtain `strLeague`, then query teams by name.

### 2. Format Requirements
*   **Season Format**: `YYYY-YYYY` (e.g. `2025-2026`).
*   **Date Format**: ISO format `YYYY-MM-DD`.
*   **No Livescore.php**: Live scores are fetched via `eventsday.php?d={today}&s={Sport}`.
