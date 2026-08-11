# System Progress & Error Registry

This file maintains the active development context, records completed tasks, and details every major bug/error encountered along with its resolution.

---

## 1. Active Context

*   **Current Objective**: finish hardening the clean sports-data platform, then choose a
    domain and deploy. The domain separation itself is **done** — it is now a repo/domain
    split, not a cleanup task.
*   **Repo**: `shad-yy/version-3-clean` (private) · branch `main` · orphan history.
*   **Domain**: not yet chosen. Parameterised — see `PROJECT.md` §5.
*   **Status**: `tsc` 0 errors · `next build` succeeds · 14 unit tests passing ·
    0 IPTV hits across all 22 rendered routes.

### The split was executed 2026-08-11 — and the strategy inverted

`smartlivetv.co.uk` **keeps the IPTV store**. This platform gets a new domain.

That is the reverse of the plan recorded in the older notes below, and it was decided on
Search Console data that was not available during the audit: over three months the domain
earned **67 clicks at average position 36**, and *every* page earning them was commercial.
Google has that domain classified as a streaming vendor. See `PROJECT.md` §1 for the
reasoning and the non-negotiable "no association" rules.

`smartlivetv-store.com` is **not part of the architecture** and never was deployed.
Anything below referring to it is historical.

### Where the work stands

**`memory-bank/AUDIT-PROGRESS.md` is the source of truth** — per-item status with the
verification command for each.

*   **Phase 1 (12 critical): complete and verified.** Root cause fixed structurally —
    `scripts/generate-posts.js` now fails the build on commercial copy and validates the
    raw MDX source, so the regression cannot recur silently.
*   **Phase 2 (16 high): 12 done, 3 partial, 1 open.** Open: nonce CSP is *implemented*
    but Fix 15 (motion guards) is 4 of 13.
*   **Phase 3 (11 minor): 7 done, 1 partial, 3 open.**

Top of the queue: remaining motion guards · `npm uninstall googleapis` (unused
devDependency, 6 of 9 advisories; timed out twice at 10 min) · 21 bare `<img>` ·
converting the 17 drafted fixture guides.

### Verified-good baseline (do not re-litigate)

`npx tsc --noEmit` → 0 errors. `next build` → succeeds. Rate limiter confirmed at
25 req/min (`RATE_LIMIT_MS = 2400`). Cache TTLs match `PATTERNS.md`. No secrets committed.
DOMPurify wraps both user-HTML injections. HSTS / X-Frame-Options / nosniff /
Referrer-Policy / Permissions-Policy present. CSP is nonce-based with a fresh nonce per
response — verified unique across requests.

### Still not measured (no data — do not assume)

Core Web Vitals / Lighthouse (never measured) · responsive breakpoints and dark-mode
contrast (browser pane could not composite frames) · production behaviour on a real
domain (all testing was localhost) · `full-audit.mjs` (Playwright browsers not installed)
· whether the `sameAs` social profiles exist · Ahrefs/backlink data (connector not authorised).

### Open bugs found in passing

*   `/api/espn/mma/ufc/scoreboard` → **503** on every homepage load. Upstream ESPN
    failure; the UFC widget degrades silently.
*   `npm audit` → high-severity advisories in `next`, `postcss`, `sharp`. Resolving needs
    a breaking Next 14 → 16 upgrade — its own task, deliberately out of scope.
*   `next.config.mjs` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`,
    so failures reach production silently. Run `tsc` manually until Fix 35 lands.

---

## 2. Completed Milestones

> **Historical.** The sections below were written while the plan was still
> "clean platform keeps smartlivetv.co.uk, store moves to smartlivetv-store.com".
> That plan was reversed on 2026-08-11 (see section 1). The engineering work
> described is real and landed; the domain names in it are not current.

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

Work the queue in `memory-bank/AUDIT-PROGRESS.md` — it carries per-item status and the
verification command for each. Highest value first:

1.  **Choose the domain**, then set the five env vars in `PROJECT.md` section 5.
    Nothing else blocks deployment prep.
2.  **Fix 15 — the remaining 9 Framer Motion mount guards.** Keep the static markup and
    defer only the animation. `header.tsx` and `footer.tsx` must retain their nav links
    in the server-rendered HTML, or internal linking is lost.
3.  **Delete `smartlivetv-store/`** once its one unique file is accounted for
    (`PROJECT.md` section 6).
4.  **Fix 27** — convert the 17 drafted fixture guides into result reports, or delete
    them. Needs real final scores. **Do not invent them.**
5.  **Verify `lib/data/broadcast-rights.ts`** against the rights holders before any
    deployment. A wrong broadcaster listing is worse than none on a site whose pitch
    is accuracy.
6.  **Fix 29 / 31** — 21 bare `<img>` tags; 5 of 7 empty `alt` attributes remain.
7.  **Fix 35** — re-enable `ignoreBuildErrors` / `ignoreDuringBuilds`, type checking first.

**Done 2026-08-11:** `googleapis` removed (unused devDependency). Advisories dropped
from 9 to 6. The remaining 5 high — `next`, `postcss`, `sharp` — require the breaking
Next 14 to 16 upgrade and stay out of scope as their own task. Three moderate advisories
(`dompurify`, `js-yaml`, `nanoid`) surfaced once the googleapis subtree was removed.

### Process rule adopted 2026-07-31

Do not mark a remediation item done without recording the verifying command and its
output. Nine items were previously recorded complete while the underlying code was
unchanged — see section 11 of `reports/audit-2026-07-31.md` for the reconciliation table.
