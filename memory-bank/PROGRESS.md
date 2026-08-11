# System Progress & Error Registry

This file maintains the active development context, records completed tasks, and details every major bug/error encountered along with its resolution.

---

## 1. Active Context

*   **Current Objective**: Complete — not merely claim — domain separation between the main sports platform (`smartlivetv.co.uk`) and the commercial store portal (`smartlivetv-store.com`).

### ⚠️ Audit 2026-07-31 — domain separation is NOT complete

Full multi-persona audit run 2026-07-31. **46 findings (12 🔴 / 14 🟡 / 11 🟢 / 9 💡).**
Full report: `reports/audit-2026-07-31.md` · Executable plan: `reports/implementation-plan-2026-07-31.md`

The "Completed Milestones" below and the `[x]` marks in `AUDIT-PROGRESS.md` **overstate what was actually done.** Verified by direct file inspection and live HTTP checks:

*   **234 `iptv` matches across 26 files** outside `smartlivetv-store/` and `memory-bank/`.
*   **Root cause (new):** `scripts/generate-posts.js` sanitises **3 link hrefs only** — body prose, prices and channel counts pass through. `generateLlmsFull()` writes **raw unsanitised markdown** to `public/llms-full.txt`. Both `npm run dev` and `npm run build` run it first, so **any manual edit to `lib/blog/posts.ts` is destroyed on the next run.** The MDX source in `content/blog/` was never cleaned.
*   **Still live:** `app/terms/page.tsx` (230,000+ channels, trial, billing — previously recorded "verified clean"); `app/privacy/page.tsx:41`; `app/ufc/page.tsx:10-11,48`; `app/match/[id]/page.tsx:306-318` (trial funnel on *every* match page); `app/watch/europa-league/page.tsx` (£12 ×4, inside FAQ schema); `app/watch/world-cup-2026/page.tsx` (£12 ×3); `public/llms.txt`; `public/llms-full.txt`.
*   **Live commercial endpoints:** `GET /api/orders` → 405, `GET /api/subscribe` → 405 (routes exist, accept POST), `/api/speed-test` → 200, `/login` → 200. `next.config.mjs` redirects cover the *pages* `/buy`, `/pricing`, `/free-trial` but **not** `/api/*`.
*   **Homepage surfaces IPTV articles** ("Best IPTV for Premier League", "Is IPTV Legal in the UK?").

### Verified-good baseline (do not re-litigate)

`npx tsc --noEmit` → **0 errors**. `next build` → **succeeds** (87.3 kB shared JS; middleware 58.1 kB). Rate limiter **confirmed** at 25 req/min (`RATE_LIMIT_MS = 2400`). Cache TTLs **match** `PATTERNS.md`. **No secrets committed** (`.env.local` untracked). DOMPurify **correctly** wraps both user-HTML injections. Header nav is correct. HSTS / X-Frame-Options / nosniff / Referrer-Policy / Permissions-Policy all present.

### Not verified in this audit (no data — do not assume)

Core Web Vitals / Lighthouse (no measurements taken) · responsive breakpoints & dark-mode contrast (browser pane could not composite frames) · **GSC data (no GSC MCP connected)** · production behaviour of the live domain (all testing was `localhost:3000`) · `full-audit.mjs` results (Playwright browsers not installed).

---

## 2. Completed Milestones

### Domain Separation & Store Archival (`smartlivetv-store/`)
*   **Created Store Archive Directory**: Created `smartlivetv-store/` at project root with full documentation in `smartlivetv-store/README.md`.
*   **Archived Store Pages**: Preserved 100% of IPTV/store pages (`iptv-vs-sky-sports`, `channels`, `pricing`, `setup/[device]`, `buy`, `free-trial`, `subscribe`) in `smartlivetv-store/pages/`.
*   **Archived Store Components**: Preserved `channel-library.tsx`, `channelData.ts` (1.1MB channel database), `BuyForm.tsx`, `TrialForm.tsx`, `FirestickWizard.tsx`, `PricingCardsSlider.tsx`, `faq-accordion.tsx`, `why-iptv.tsx`, `pricing-preview.tsx`.
*   **Archived Store UI**: Preserved `PaymentLogos.tsx`, `DeviceIcons.tsx`, `SpeedChecker.tsx`.

### Main Site Refactoring (`smartlivetv.co.uk`)
*   **Metadata & JSON-LD Schemas**: Removed IPTV subscription descriptions, £12-£54 pricing tiers, `VideoObject` sales copy, and `BroadcastService` claims from `app/layout.tsx` and `app/page.tsx`. Updated `Speakable` schema for sports telemetry.
*   **Homepage Clean-up**: Removed `WhyIPTV` and `PricingPreview` dynamic components from `app/page.tsx`. Converted 1st card in `service-pillars.tsx` to "Broadcast Schedules & Official TV Directories".
*   **Interactive Components Overhaul**: Refactored `SpotlightEvents.tsx`, `LiveNowBanner.tsx`, `MatchCard.tsx`, `MatchPopup.tsx`, `EventCountdown.tsx`, `LiveEventFloat.tsx`, and `CommandPalette.tsx` to direct all CTAs ("Where to Watch", "Live Guide", "TV Guide") to dynamic broadcast guides (`/watch/*`) and match details (`/match/[id]`) rather than `/pricing` or `/buy`.
*   **SEO Content & Blog Layouts**: Refactored `DynamicSEOContent.tsx` to remove false `Offer` schemas and commercial answers, replacing them with official UK broadcast guides (Sky Sports, TNT Sports, BBC Sport). Cleaned `BlogPostLayout.tsx` of commercial store CTAs.
*   **Navigation & Footer**: Updated navigation links in `header.tsx`, `footer.tsx`, `site-navigation-links.tsx`, and `sitemap.ts` to feature `Live Scores (/scores)`, `Leagues (/leagues)`, `News (/news)`, `UFC (/ufc)`, `Blog (/blog)`.
*   **Store Archival Repository**: Created `smartlivetv-store/archived-from-main-site.md` containing all excised marketing copy, sales funnels, and schema text for repurposing on `smartlivetv-store.com`.
*   **Cleaned Content Pages**: Updated `app/about/page.tsx`, `app/faq/page.tsx`, `app/watch/champions-league/page.tsx`, and `app/watch/[slug]/page.tsx` to focus strictly on live sports telemetry and official TV broadcast listings.
*   **Build Verification**: Excluded `smartlivetv-store` from `tsconfig.json` so `npx tsc --noEmit` checks main site cleanly. Verified TypeScript compilation with zero errors.

### Core API & Security Hardening
*   **Safer Rate Limiter**: Configured rate limits at 25 req/min with token bucket delay.
*   **Circuit Breaker**: Blocks failing endpoints for 1 minute after 5 consecutive 429 errors.
*   **Aggressive TTL Caching**: `apiCache.ts` configured with 30-day static cache and 1-min real-time score cache.
*   **Secret Protection**: Removed hardcoded fallback keys and admin password hashes.

---

## 3. Trouble Registry & Historical Error Logs

### ⚠️ Bug 1: "self is not defined" during `npm run build`
*   **Symptoms**: Next.js server bundling fails at "Collecting page data" with `ReferenceError: self is not defined`.
*   **Root Cause**: Certain code dependencies or Webpack runtime blocks query `self` while running in Node.
*   **Permanent Fix**: Setup `polyfill-self.cjs` and configure build command in `package.json` to load it before building:
    ```json
    "build": "node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build"
    ```

### ⚠️ Bug 2: `tsc` errors when including `smartlivetv-store/` archive
*   **Symptoms**: `npx tsc --noEmit` reported missing module errors for archived store components in `smartlivetv-store/`.
*   **Root Cause**: `tsconfig.json` included `**/*.ts` and `**/*.tsx` recursively, trying to type-check archived store files that reference removed main-domain components.
*   **Permanent Fix**: Added `"smartlivetv-store"` to `"exclude"` in `tsconfig.json`.

### ⚠️ Bug 3: Webpack Hash Cache `TypeError` during build
*   **Symptoms**: `npm run build` failed with `TypeError: Cannot read properties of undefined (reading 'length')` in WasmHash.
*   **Root Cause**: Stale build cache in `.next` directory from before component removal.
*   **Permanent Fix**: Cleared `.next` build folder (`Remove-Item -Recurse -Force .next`) and re-executed `npm run build`.

### ⚠️ Bug 4: 404 errors when requesting `livescore.php`
*   **Symptoms**: Live match fetch requests fail with 404 status codes.
*   **Root Cause**: The SportsDB v1 API does not contain a `livescore.php` endpoint.
*   **Permanent Fix**: Query `eventsday.php` filtered by date and sport.

### ⚠️ Bug 5: Hydration mismatch crash in production
*   **Symptoms**: React page fails to load on Vercel with `"Failed to execute 'removeChild' on 'Node'"`.
*   **Root Cause**: Server SSR and Client Hydration states differ due to immediate animation rendering.
*   **Permanent Fix**: Wrap dynamic layout states with client-mount guards (`useEffect` set mounted).

---

### ⚠️ Bug 6: Blog cleanup keeps reverting — generated file edited instead of source
*   **Symptoms**: IPTV prose, `£12/month` and `230,000+` reappear in `lib/blog/posts.ts` and `public/llms-full.txt` after they were "removed".
*   **Root Cause**: `lib/blog/posts.ts` is **auto-generated** from `content/blog/*.mdx` by `scripts/generate-posts.js`, which runs as the first step of both `npm run dev` and `npm run build`. Its sanitisation covers **3 link hrefs only** (lines 43-46); `generateLlmsFull()` (lines 121-133) applies **none** and writes raw markdown.
*   **Permanent Fix**: Never edit `lib/blog/posts.ts`. Edit `content/blog/*.mdx`. Add the `assertDomainCompliant()` build guard from Fix 1 of `reports/implementation-plan-2026-07-31.md` so a violation fails the build.

### ⚠️ Bug 7: `next build` fails with `Cannot find module './NNNN.js'` while dev server is running
*   **Symptoms**: Build fails at "Collecting page data" with `MODULE_NOT_FOUND` from `.next/server/webpack-runtime.js`. Exit code can still be 0 — check for `.next/BUILD_ID` instead.
*   **Root Cause**: The dev server and the build write to the same `.next` directory. (Same class as Bug 3.)
*   **Permanent Fix**: Stop the dev server, `rm -rf .next`, then build. Verified clean on retry.

### ⚠️ Bug 8: Upstash rate limiter guards the wrong path
*   **Symptoms**: Admin login is not rate-limited in production despite `@upstash/ratelimit` being wired up.
*   **Root Cause**: `middleware.ts:103` gates on `/api/admin/` — but the login route is `/api/auth/admin`. `/api/admin/*` is health/metrics only. Login falls through to a per-lambda in-memory Map that resets on every cold start.
*   **Fix**: Fix 12 in the implementation plan.

---

## 4. Next Steps

Execute `reports/implementation-plan-2026-07-31.md` **in order**. Top 5 by impact:

1.  **Fix 1 + Fix 2 — stop the blog regeneration loop.** Add the `assertDomainCompliant()` guard to `scripts/generate-posts.js`, then delete 6 and rewrite 6 IPTV MDX sources. Everything else is pointless until the generator can no longer reintroduce the content.
2.  **Fix 10 — take down the live commercial endpoints.** `/api/orders`, `/api/subscribe`, `/api/speed-test`, `/login`, `app/pricing/order-form.tsx`. Keep the `next.config.mjs` redirects.
3.  **Fix 11 + Fix 12 — security.** Auth responses are served `Cache-Control: public, max-age=3600` (shared-cache session leak); the Upstash limiter guards the wrong path; `bcrypt.compare()` runs before rate limiting and without input validation.
4.  **Fixes 3-9 — purge the remaining IPTV surfaces:** `llms.txt`, `terms`, `privacy`, `match/[id]`, `ufc`, `europa-league`, `world-cup-2026`.
5.  **Fix 13 + Fix 14 — seasonal, deadline 21 Aug 2026.** The homepage shows a *finished* 38-game table labelled "Live Standings", and `s=2025-2026` is hardcoded in two direct API calls that also bypass the unified layer and rate limiter.

**Deployment is blocked** until Phase 1 (🔴 CRITICAL, 12 fixes) is complete and verified.

### Process rule adopted 2026-07-31
Do not mark a remediation item `[x]` without pasting the verifying command output. Nine items in `AUDIT-PROGRESS.md` were recorded complete while the underlying code was unchanged — see §11 of `reports/audit-2026-07-31.md` for the reconciliation table.
