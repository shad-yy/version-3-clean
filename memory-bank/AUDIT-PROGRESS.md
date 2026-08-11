# 🛠️ Audit Remediation Progress Tracker

**Audit Date:** 2026-07-31
**Source Report:** `reports/audit-2026-07-31.md`
**Implementation Plan:** `reports/implementation-plan-2026-07-31.md`
**Last Updated:** 2026-07-31

> **Rule adopted 2026-07-31:** do not mark an item `[x]` without recording the verification
> command and its output. The previous tracker marked nine items complete while the
> underlying code was unchanged.

---

## Legend
- `[x]` = DONE, verified
- `[/]` = IN PROGRESS
- `[ ]` = TODO
- `[-]` = DEFERRED (reason given)

---

## 🔴 PHASE 1 — CRITICAL (12/12 complete)

| Fix | Task | Status | Verification |
|---|---|---|---|
| 1 | Add `assertDomainCompliant()` build guard to `scripts/generate-posts.js` | `[x]` | Guard fires on violation (exit 1); passes clean (exit 0). Validates **raw MDX source**, not rewritten HTML, so link rewrites can't mask violations. |
| 2 | Purge IPTV blog sources | `[x]` | `node scripts/generate-posts.js` → `Successfully generated 5 posts`, exit 0. `grep -ic` on `lib/blog/posts.ts` and `public/llms-full.txt` → **0**. |
| 3 | Rewrite `public/llms.txt` | `[x]` | `grep -ic "iptv\|230,000\|£12\|free trial\|/buy\|/pricing"` → **0**. Dead routes removed. |
| 4 | Rewrite `app/terms/page.tsx` | `[x]` | Was an IPTV subscription contract; now an information-service ToS. Only remaining "subscription" match is the deliberate disclaimer *"we do not sell… any television or streaming subscription"*. |
| 5 | Fix `app/privacy/page.tsx` | `[x]` | Removed "activate your subscription", WhatsApp/device-type collection, and 2-year order retention. Now describes contact-form data only. |
| 6 | Remove trial funnel from `app/match/[id]/page.tsx` | `[x]` | Funnel, metadata, 3 FAQ schema answers, hero CTA, bottom CTA and mobile sticky bar all replaced. `grep` → **0**. |
| 7 | Clean `app/ufc/page.tsx` | `[x]` | Metadata, 3 FAQ schema answers, hero, bottom CTA, mobile bar replaced. Added missing `#upcoming-events` anchor target. `grep` → **0**. |
| 8 | Clean `app/watch/europa-league/page.tsx` | `[x]` | 5 FAQ answers rewritten to official broadcasters, price row deleted, 5 CTAs redirected, metadata fixed. `grep` → **0**. |
| 9 | Clean `app/watch/world-cup-2026/page.tsx` | `[x]` | Metadata, FAQ schema answer, 2 CTA blocks replaced. `grep` → **0**. |
| 10 | Remove live commercial endpoints & order UI | `[x]` | `/api/orders` `/api/subscribe` `/api/speed-test` `/login` → all **404**. `/buy` `/pricing` `/free-trial` → all **308** (redirects intact). `order-form.tsx` + login page archived to `smartlivetv-store/`. |
| 11 | Stop public-caching authenticated API responses | `[x]` | `curl -D -` on `/api/auth/admin/status` → `Cache-Control: private, no-store, no-cache, must-revalidate`. Was `public, max-age=3600`. |
| 12 | Fix rate-limiter path + bcrypt ordering | `[x]` | `middleware.ts` now matches `/api/auth/admin` as well as `/api/admin/`. Route order is validation → 400 → rate limit → bcrypt. `POST {"password":123}` → **400** (was 500). |

### Also fixed in Phase 1 (found during implementation, beyond the plan)

The audit under-counted the blast radius. These were discovered while executing and fixed:

- **~20 of 23 blog articles** carried an inserted promo block, not the 12 the audit listed.
- **8 further `/buy` and `/free-trial` CTAs** in `app/events/[id]`, `app/leagues`, `app/ufc/events/[id]`, `app/watch/formula-1`, `app/watch/formula-1/race/[id]`, `components/homepage/animated-hero.tsx`, `components/match/match-tabs.tsx`.
- **Champions League page**: 3 store CTAs + an "Official Partner Store" sidebar panel.
- **F1 page**: sales metadata, 2 FAQ schema answers, hero copy, 2 trial CTAs, and a "Start your free trial" how-to-watch step.
- **`components/league/DynamicSEOContent.tsx`**: *"available live on Smart Live TV in HD and 4K. No blackouts, no extra subscriptions"* — rendered on every `/watch/*` league page, plus a 4K claim inside `SportsEvent` schema.
- **`app/faq/page.tsx`**: "official store" Q&A replaced with a data-provenance answer.
- **`app/favorites/page.tsx`, `app/not-found.tsx`**: free-trial CTAs replaced.
- **`components/layout/header.tsx` / `footer.tsx`**: dead unused `STORE_URL` constants removed.

**Phase 1 exit verification:** every one of 22 rendered routes scanned for
`iptv|230,000|£12|free trial|no blackouts|no VPN needed|firestick setup|extra subscriptions`
→ **0 hits total**. `npx tsc --noEmit` → **0 errors**.

### Design decisions taken during Phase 1

1. **Drafts instead of deletion.** 17 expired fixture guides (16 World Cup + 1 past UFC card)
   are marked `draft: true` and skipped by the generator. They stay in the repo for
   conversion into result reports (plan Fix 27) rather than being deleted, so nothing is
   lost. 7 articles whose entire premise was selling the service were deleted outright.
   Published count: **29 → 5**.
2. **The guard bans the grey-market signal, not the device.** Blanket-banning "firestick"
   would also block legitimate advice like *"install the official ITVX app on Fire TV"*.
   The guard targets `/setup/firestick`, "apps from unknown sources", "sideload",
   "downloader app" and "firestick setup" instead.
3. **Blanket `/api/(.*)` cache rule removed entirely**, not just reordered. It was emitting a
   second, conflicting `Cache-Control` on the 24 data routes that already set their own.
   `/api/scores/today` now returns exactly one header: `public, s-maxage=30, stale-while-revalidate=90`.

---

## 🟡 PHASE 2 — HIGH (12 fully done, 3 partial, 1 not started / 16)

| Fix | Task | Status | Verification |
|---|---|---|---|
| 13 | Stop showing a finished season as "Live Standings" | `[x]` | Heading is now derived from the data: `seasonComplete` compares max `played` against `(teams - 1) * 2`. Renders `League Standings — Updated Live` mid-season, `Final Standings — Season Complete` after the last round. "Stream Every Game" removed. Also cleared `All 380 matches this season` / `Every UCL match live` / `No PPV charges` from `LiveNowBanner.tsx`. |
| 14 | Remove hardcoded `s=2025-2026`; route through unified API | `[x]` | **Deadline met.** Exported `getCurrentSeason()` from `lib/api/unified-sports-api.ts` (Aug–Jul boundary, matching TheSportsDB); both `/watch/champions-league` and `/watch/europa-league` now call it. `grep "2025-2026"` → 0. The direct-fetch refactor is still open (see below). |
| 15 | Framer Motion mount guards | `[/]` | 4 of 13 done — see note below |
| 16 | Metadata for `/teams`, `/events`, `/players` | `[x]` | 3 distinct titles served; no longer the layout fallback |
| 17 | Remove duplicate Organization/WebSite schema | `[x]` | Homepage now renders exactly **1** Organization, **1** WebSite, **1** SearchAction (was 2 of each with conflicting values) |
| 18 | `SportsEvent` schema on `/scores` | `[x]` | `/scores` now server-renders an `ItemList` of `SportsEvent` nodes — verified **6 SportsEvent / 2 ItemList** in the rendered HTML, and **0** `offers`/`price` matches. See the landmine note below. |
| 19 | Sitemap corrections | `[x]` | 29 URLs; `/teams` `/players` `/events` `/search` added; **0** `llms` entries; static pages moved off build-time `lastModified` |
| 20 | Duplicate `Cache-Control` on live scores | `[x]` | `/api/scores/today` returns exactly **1** header: `public, s-maxage=30, stale-while-revalidate=90` |
| 21 | Nonce-based CSP | `[ ]` | Largest remaining item; roll out report-only first |
| 22 | Dependency advisories | `[/]` | See note below — partially done |
| 23 | Repair failing unit tests | `[x]` | `npx vitest run` → **3 files passed, 14 tests passed** (was 3 files failed / 2 tests failed / 3 skipped). Added `vitest.setup.ts` injecting a deterministic test `JWT_SECRET`; corrected `admin-metrics.test.ts` to assert **401** for unauthenticated calls (it previously asserted 200, which would have been the bug); moved the misplaced Playwright spec out of `tests/` and excluded `*.spec.ts` in `vitest.config.ts`; added 5 regression tests locking in the Fix 12 payload validation. |
| 24 | Update E2E + `full-audit.mjs` assertions | `[x]` | `full-audit.mjs` line-92 check **inverted** — it now flags the *presence* of IPTV copy instead of its absence. In `e2e/smartlivetv.spec.ts` the channel-count test was replaced with its negative, the pricing-plans test became a redirect assertion, and 7 tests targeting deleted routes are `test.skip` with a reason. 27 active tests; file parses clean. |
| 25 | Gate IndexNow ping | `[x]` | `node scripts/ping-indexnow.js` → `IndexNow ping skipped`, exit 0, no network call |
| 26 | Replace hardcoded homepage stats | `[x]` | `2,500+`, `45+`, `100%` removed from `hero-section.tsx` and `LiveStats.tsx` |
| 27 | Convert expired World Cup articles | `[/]` | Drafted out of the build in Fix 2; conversion to result reports still to do |
| 28 | `/blog` meta description | `[x]` | Firestick/device-setup copy replaced |

### Note on Fix 15 (mount guards) — 4 of 13, deliberately

Guarded (overlays and modals — they contribute no crawlable content, so gating is a pure win):
`WhatsAppFloat.tsx`, `CookieBanner.tsx`, `LiveEventFloat.tsx`, and the **modal half** of `command-palette.tsx`.

For `command-palette.tsx` only the `AnimatePresence` modal is gated — the header search
trigger stays server-rendered so the header does not shift on hydration.

**Not** guarded, on purpose — these render content that must exist in the SSR HTML:
`header.tsx` and `footer.tsx` (site navigation — gating them would strip every internal
link from the server HTML), `news-card.tsx`, `service-pillars.tsx`, `spotlight-events.tsx`,
`league-detail-view.tsx`, `match-tabs.tsx`, `shimmer-button.tsx`, `stagger-in.tsx`.
The correct treatment is to keep the static markup and defer only the animation, which is
per-component work. Risk assessment from the audit: of these, only `header.tsx`,
`league-detail-view.tsx` and `match-tabs.tsx` use `AnimatePresence`; the rest are simple
`motion.div` with `initial`/`animate`, which framer-motion renders deterministically.

### Note on Fix 22 (dependencies) — partially done

- `npm audit fix` was run. **`undici` resolved.**
- Reported count went **5 → 9 high**, not down. The tree changed and surfaced five
  transitive advisories from `googleapis` (`gaxios`, `glob`, `googleapis-common`,
  `minimatch`, `rimraf`) that the earlier run had not enumerated.
- **`googleapis` is an unused devDependency** — zero imports anywhere in the codebase —
  and accounts for 6 of the 9 advisories. `npm uninstall googleapis` was started but
  exceeded 10 minutes and was cancelled; `node_modules` was verified intact afterwards
  and `npx tsc --noEmit` still passes. **Re-run `npm uninstall googleapis` when
  convenient** — it should drop the count to 3.
- Remaining after that: `next` (21 advisories), `postcss`, `sharp` — all require the
  breaking Next 14 → 16 upgrade, which stays out of scope as its own task.

---

### 🔴 Landmine found while doing Fix 18 — `lib/schema.ts`

`generateSportsEventSchema()` was emitting, into structured data submitted to Google:

```js
offers: { url: `${baseUrl}/pricing`, price: "12.00", priceCurrency: "GBP", ... }
location: { name: `${homeTeam} Stadium` }          // fabricated venue
startDate: date ? ... : new Date().toISOString()   // invented kick-off time
description: "Watch ... live stream in HD and 4K UHD"
```

It was **unused** at the time — which is why the audit's rendered-HTML scan never caught
it — but any developer reaching for SportsEvent schema would have shipped a £12 Offer
pointing at a route that now redirects off-domain. `PROGRESS.md` claimed the false Offer
schemas had already been removed; they had been removed from `DynamicSEOContent.tsx`, not
from the shared helper.

Rewritten: no `offers` ever, `startDate`/`location` omitted rather than invented, factual
description. Added `generateSportsEventListSchema()` for `/scores`.

---

## 🟢 PHASE 3 — MINOR (7/11)

| Fix | Task | Status |
|---|---|---|
| 29 | Replace 21 bare `<img>` with `<OptimizedImage />` | `[ ]` |
| 30 | Delete dead `components/home/` directory | `[x]` confirmed zero imports, removed |
| 31 | Meaningful `alt` on team crests | `[/]` 2 of 7 fixed (`league-detail-view.tsx`, `match-tabs.tsx`) |
| 32 | `error.tsx` for remaining segments | `[x]` 7 created; **14 total** across `app/` |
| 33 | `<html lang="en-GB">` | `[x]` verified in served HTML |
| 34 | Title / description lengths | `[x]` homepage title 69→55 chars; `/contact` description 169→115; `/privacy` title now brand-suffixed |
| 35 | Re-enable `ignoreBuildErrors` / `ignoreDuringBuilds` | `[ ]` — do only after a clean `next lint` pass |
| 36 | `minimumCacheTTL` 60s → 30 days | `[x]` |
| 37 | Redis reconnection with backoff | `[ ]` |
| 38 | Remove `scripts/fix-iptv-ctas.py` | `[x]` |
| 39 | `X-Robots-Tag` no longer blanket-applied over `/api/` and `/admin/` | `[x]` header removed; Google indexes by default |

## 💡 PHASE 4 — OPPORTUNITY
Fixes 40–41. Scope separately.

---

---

## Domain parameterisation (2026-08-07)

Prep for the planned domain split. `lib/config/site-url.ts` is now the single source of
truth for domain, brand name, host and support email — all env-driven. The 54 hardcoded
`smartlivetv.co.uk` strings across 14 files are gone; only three intentional fallback
defaults remain (`site-url.ts`, `generate-posts.js`, `ping-indexnow.js`).

Moving the codebase to a new domain is now:

```bash
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_SITE_NAME="Example"
NEXT_PUBLIC_SITE_HOST=example.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
INDEXNOW_HOST=example.com
```

Also removed in passing: the Trustpilot `sameAs` (domain-specific, would 404 on a new
domain) and the hardcoded `smartlivetv-store.com` link rewrite in the blog generator,
which defeated the parameterisation.

**Note:** `resolveSiteUrl()` previously *overrode* the env var in production with a
hardcoded constant. That is why a domain change was a 14-file source edit. It now reads
env with a literal fallback, so a missing variable still can't break robots.txt.

---

## Broadcast resolver component (2026-08-07)

`components/homepage/broadcast-resolver.tsx` + `lib/data/broadcast-rights.ts`, wired into
the homepage between ServicePillars and SpotlightEvents.

Demonstrates the actual differentiator — *which channel, in which country, at what local
time* — instead of a hero video. Deliberate constraints, documented in the file:

- **No video.** A hero video is the most common way to miss LCP ≤ 2.5s.
- **Every listing is always in the DOM.** The cycling highlight is a visual emphasis layer
  only; nothing mounts/unmounts, so the whole block is server-rendered and indexable.
- **No Framer Motion.** CSS transitions only — no hydration surface, no mount guard needed.
- **`prefers-reduced-motion` respected** — static list, same information.

Times are formatted from a fixed ISO string with an explicit IANA timezone, so server and
client always agree. Verified: all six conversions match an independent computation,
including the Sydney day-rollover (Sun 02:30) that makes the point.

⚠️ **`lib/data/broadcast-rights.ts` carries a `verified` date per competition and must be
re-checked each rights cycle.** Deliberately competition-level, never fixture-level —
fixture-to-channel mappings change weekly and a wrong listing is worse than none.

### Unrelated finding while verifying

`/api/espn/mma/ufc/scoreboard` returns **503** on every homepage load — ESPN's UFC endpoint
failing upstream. Not caused by any change in this session. The UFC widget is silently
degrading. Worth its own investigation.

---

## Verified state at end of this session

```
npx tsc --noEmit                                    → 0 errors
npx vitest run                                      → 3 files, 14 tests, all passing
next build (clean .next, dev server stopped)        → success, BUILD_ID created, 0 errors
node scripts/generate-posts.js                      → 5 posts, 17 drafts skipped, exit 0
node scripts/ping-indexnow.js                       → skipped, exit 0, no network call

IPTV scan across 22 rendered routes                 → 0 hits
/api/orders /api/subscribe /api/speed-test /login   → 404
/buy /pricing /free-trial                           → 308 (redirects intact)
/api/auth/admin/status Cache-Control                → private, no-store, no-cache
/api/scores/today Cache-Control                     → exactly 1 header, s-maxage=30
POST /api/auth/admin {"password":123}               → 400 (was 500)
homepage Organization / WebSite nodes               → 1 / 1
/scores SportsEvent / ItemList nodes                → 6 / 2
/scores offers|price matches                        → 0
<html lang>                                         → en-GB
homepage standings heading                          → "League Standings — Updated Live"
sitemap.xml                                         → 29 URLs, 0 llms entries
app/**/error.tsx                                    → 14
```

## Still open — start here next session

**Highest value first:**

1. **Fix 21 — nonce-based CSP.** The largest remaining security item. `script-src` still
   carries `'unsafe-inline' 'unsafe-eval'`, which per OWASP and MDN means the CSP provides
   essentially no XSS mitigation. Roll out with `Content-Security-Policy-Report-Only`
   first. Note the 8 JSON-LD `<script>` tags will each need the nonce.
2. **Fix 15 — the remaining 9 motion components.** Keep static markup, defer only the
   animation. `header.tsx` and `footer.tsx` must keep their nav links in SSR HTML.
3. **`npm uninstall googleapis`** — unused devDependency, 6 of 9 advisories. Cancelled at
   10 min last session; `node_modules` verified intact afterwards.
4. **Fix 14 (remainder)** — `/watch/champions-league` and `/watch/europa-league` still call
   TheSportsDB directly (6 requests), bypassing the 25 req/min token bucket. The season is
   now dynamic so nothing breaks on 21 Aug, but the rate-limiter bypass remains.
5. **Fix 29 / 31 (remainder)** — 21 bare `<img>`; 5 of 7 empty `alt` still to do.
6. **Fix 27 (remainder)** — convert the 17 drafted fixture guides into result reports, or
   delete them. They need real final scores; do not invent them.
7. **Fix 35** — re-enable type checking and linting in the build, type checking first.
8. **Fix 37** — Redis reconnection with exponential backoff.

**Deferred by design:** Next.js 14 → 16 (breaking, own task, 21 advisories).
