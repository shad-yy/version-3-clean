# Decision log

Append-only. Newest last. Never edit or delete a past entry — if a decision is reversed,
add a new entry that supersedes it and link back.

Each entry records: **what was decided**, **what else was considered**, **the evidence**,
and **the consequence**. The evidence field is what makes this log useful six months from
now; an entry without it is just an assertion.

Format:

```
## YYYY-MM-DD — <short title>
**Decision:** …
**Considered:** …
**Evidence:** …
**Consequence:** …
```

---

## 2026-08-11 — Split the clean platform from the IPTV store

**Decision:** The IPTV store keeps `smartlivetv.co.uk` and its existing repo
(`shad-yy/forclaude`). This codebase becomes an independent project in a new private repo
(`shad-yy/version-3-clean`) with orphan git history and no shared remote.

**Considered:** The reverse — clean platform keeps `smartlivetv.co.uk`, store moves to
`smartlivetv-store.com`. That was the plan of record until this date.

**Evidence:** Search Console for `smartlivetv.co.uk`, three months to 2026-07-31: 67
clicks, 2.3K impressions, average position 36. Every page earning clicks was a commercial
one — the homepage titled "IPTV UK from £12/mo", `/ufc`, `/watch/europa-league`,
`/setup/firestick`. Google has that domain classified as a streaming vendor, and those are
its only ranking pages. **Caveat: 67 clicks over three months is a very small sample.** It
is sufficient to show the domain does not rank for sports-data queries; it is not
sufficient for anything finer-grained.

**Consequence:** Nothing is lost by moving this platform to a new domain, because it has
no rankings to forfeit. `smartlivetv-store.com` is no longer part of the architecture.

---

## 2026-08-11 — No store link, no commercial funnel

**Decision:** This site is fully independent. No links, CTAs, redirects or references to
any store, in any form.

**Considered:** Keeping a single discreet outbound link, as an earlier owner brief
requested ("drive customers to our shop without sounding like this website was only made
to get traffic").

**Evidence:** The purpose of the domain split is that search engines and ad networks
cannot associate the two properties. One outbound link, a shared brand identity, a shared
analytics property or a shared WHOIS contact re-establishes exactly that association.
There is also no brand equity to inherit — the unambiguous brand query `smartlivetv`
returned 1 click in three months.

**Consequence:** Supersedes the earlier "drive traffic to the shop" instruction. Three
redirects to `smartlivetv-store.com` were removed from `next.config.mjs`; the CORS
allowlist in `middleware.ts` no longer trusts that origin.

---

## 2026-08-11 — Reposition to a global "where to watch" source

**Decision:** Reposition from a UK sports-data platform to a global information source
answering *"where and how can I watch this?"* across sport, film, television and
entertainment. **Sports is retained** as one vertical; film/TV is added alongside it.

**Considered:** Staying sports-only; or pivoting fully to film/TV and deprecating the
sports infrastructure.

**Evidence:** Live scores are a commodity — ESPN, BBC Sport, FlashScore and SofaScore hold
that ground with decades of authority. Per-country availability is a real recurring
question that no single source answers well, and it maps onto schema types Google already
supports (`Movie`, `TVSeries`, `WatchAction`, `ActionAccessSpecification.eligibleRegion`,
`BroadcastEvent`). Keeping sports avoids discarding working API integrations and content.

**Consequence:** Every UK-only assumption becomes a defect. `lib/data/broadcast-rights.ts`
— already multi-country, ISO-coded, with a per-competition `verified` date — becomes the
model for the whole site rather than a single homepage component's data source.

---

## 2026-08-11 — Film/TV availability sourced from TMDB Watch Providers

**Decision:** Build the film/TV vertical on TMDB's Watch Providers API rather than
hand-written availability data.

**Considered:** Manually curating availability; scraping; omitting the vertical.

**Evidence:** TMDB's Watch Providers endpoints are powered by JustWatch, the API key is
free, and they return per-country streaming/rental/purchase availability
(`/movie/{id}/watch/providers`, `/tv/{id}/watch/providers`, `/watch/providers/regions`).
Two constraints: **JustWatch attribution is mandatory** wherever the data appears, and the
API returns availability only — **no deep links**.

**Consequence:** Per-country availability can be generated from verified data instead of
authored claims, satisfying the never-fabricate rule at scale. Design must surface the
JustWatch attribution and must not imply deep links exist.

---

## 2026-08-11 — Sequence structure before theme

**Decision:** Fix positioning, global targeting and structural defects first. Defer the
visual redesign.

**Considered:** Redesigning in the same pass; or centralising design tokens immediately
while keeping the current look.

**Evidence:** The theme is not centralised — ~604 hardcoded hex utilities and 953 default
Tailwind greys against ~188 semantic tokens, across 64 files including 20 of 35 page
routes. There are 12 hand-typed variants of one intended surface colour. Redesigning now
would mean restyling pages that are about to change or disappear, and would near-certainly
miss some.

**Consequence:** Redesign is blocked on a normalise-then-tokenise pass. Also outstanding:
the four sport themes are broken by construction (Tailwind maps `var(--background)` with
no `hsl()` wrapper while the theme classes set HSL triplets), `components/theme-provider.tsx`
is orphaned, and `SportThemeProvider` is a no-op with zero consumers.

---

## 2026-08-11 — Domain deferred, project stays domain-agnostic

**Decision:** No domain assigned yet. Everything stays parameterised behind environment
variables.

**Considered:** Shortlisting and buying now.

**Evidence:** `lib/config/site-url.ts` is already the single source of truth for domain,
brand name, host and support email. A domain change is five environment variables, not a
source change. Separately, "SmartScore" was rejected as a candidate name: Musitek has
shipped SmartScore music software since 1991, GE HealthCare ships SmartScore 4.0, there is
a live USPTO registration (88577232), and both `.com` variants are registered. It also
names the commodity (scores) rather than the differentiator (where to watch).

**Consequence:** Naming can be decided independently of engineering. Any candidate must be
checked for availability and trademark at a registrar — DNS probes cannot confirm either.

---

## 2026-08-11 — Removed the IPTV artifacts that still shipped

**Decision:** Removed all five remaining IPTV artifacts that reached real users, plus the
tracked store archive.

**Considered:** Leaving the archive in place, since it was excluded from `tsconfig.json`
and not routed by Next.

**Evidence:** Five artifacts were still live. Two were severe:

1. `public/og-default.png` rendered **"15,000+ Channels · 4K · Free Trial"** in pixels and
   was referenced **13×** across built routes as the site-wide `openGraph.images`,
   `twitter.images` and Organization JSON-LD `logo.url` — i.e. what Google, X, Facebook,
   LinkedIn and Slack showed for **every URL on the domain**. Confirmed by opening the
   image, not by grep.
2. `public/og-default.svg`, served publicly, read **"230,000+ Channels · 4K · Free Trial"**
   — disagreeing with the PNG.
3. `middleware.ts` CORS allowlist still trusted `smartlivetv-store.com`.
4. `app/match/[id]/page.tsx` emitted a live JSON-LD `Offer` of `12.00 GBP` pointing at
   `/pricing`, a 404 — on every match page.
5. Two `?? "/pricing"` fallbacks sent users to that same 404.

`smartlivetv-store/` was 23 files / 16,094 lines, fully git-tracked, including a live
WhatsApp number hardcoded in `FirestickWizard.tsx`.

**Consequence:** `scripts/generate-og.mjs` now generates both SVG and PNG from
env-driven text and **fails if a channel count, price, trial or IPTV reference appears**.
Dead code deleted: `lib/data/channels.ts` (fake channels with `m3u8` URLs),
`lib/structured-data.ts` (unimported, carried its own £12 Offer).

**Process lesson, recorded because it will recur:** every text-based audit of this
codebase — including several this session — reported the built site clean. All were wrong,
because the worst remnant was inside an image. **Grep cannot audit binaries. Open the
assets.**

---

## 2026-08-11 — llms.txt generated from env; UK-only framing removed

**Decision:** `public/llms.txt` is now generated by `scripts/generate-posts.js` from
`NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_SITE_HOST`, alongside `llms-full.txt`.

**Considered:** Hand-editing the static file.

**Evidence:** It hardcoded `smartlivetv.co.uk` throughout — the domain that now belongs to
the store — so it was telling answer engines this content lived on another property. It
also declared *"Broadcast listings reference official UK rights holders only"*, which is
the single most damaging line for a global repositioning because it is the first file an
answer engine reads. Ten competition entries said "UK TV channel listings", including
La Liga, Serie A, Bundesliga and Ligue 1.

**Consequence:** Content now describes per-country broadcast coverage and states that no
claim is made for countries not covered. It passes the same `assertDomainCompliant` guard
as the rest of the generated output. Three remaining "UK" mentions in `llms-full.txt` are
inside blog article bodies that are genuinely about UK broadcasters — left as-is, since
the articles are accurate.

---

## 2026-08-11 — Phase 2 structural fixes

**Decision:** Created `app/watch/page.tsx`, resolved the `/watch/champions-league` route
collision, added `/watch` to the sitemap, removed a dead `revalidate`.

**Evidence and consequence, per item:**

- **`/watch` was a 404** that four `BreadcrumbList` blocks named as a parent, that
  `components/league/league-detail-view.tsx` linked to, and that
  `scripts/generate-posts.js` rewrote blog links to. Broken internal links plus invalid
  structured data on four pages. Now a real competition index listing 10 competitions,
  with `BreadcrumbList` and `ItemList` schema, and country-neutral copy. Each card shows
  how many countries have verified broadcast data, read from
  `lib/data/broadcast-rights.ts` — so the page cannot overstate coverage.
- **`/watch/champions-league` was generated twice.** `app/watch/[slug]/page.tsx` built it
  from `Object.keys(LEAGUES)` while a literal route of the same path existed. Next gives
  literal segments precedence, so the `[slug]` version was built and never served — with
  different copy and metadata. Excluded via `SHADOWED_BY_LITERAL_ROUTE`; the `LEAGUES`
  entry stays because badges and theming use it.
- **`app/teams/page.tsx` set `revalidate = 86400`** while reading `searchParams`, which
  forces a dynamic render. The ISR value could never apply. Removed, with a comment
  explaining why, so it is not "restored" later.

**Verified:** `/watch` → 200 (was 404) · `/watch/champions-league` → 200 (literal route
still wins) · `/watch/la-liga` → 200 (`[slug]` unaffected) · 10 cards, one Champions
League · zero UK-only phrases on the page · tsc 0 errors · build succeeds.

---

## 2026-08-11 — Deleted the /info/* duplicate routes

**Decision:** Removed `app/info/` entirely — 8 indexable near-duplicates of 5 real pages.

**Considered:** Adding canonical tags pointing at the primaries.

**Evidence:** `/info/about-us`, `/info/contact-us`, `/info/privacy-policy`,
`/info/terms-of-service`, `/info/faq` and `/info/contact` duplicated `/about`, `/contact`,
`/privacy`, `/terms` and `/faq` with no canonicals. Content came from a hardcoded object
literal carrying a `// mock function… In a real app, you'd fetch this from a CMS` comment.
A repo-wide grep found **zero inbound links**. Canonicalising would have kept 8 low-value
URLs in the crawl budget for no benefit.

**Consequence:** 8 routes gone, no redirects needed (nothing linked to them), `tsc` clean.

---

## 2026-08-11 — Phase 3a/3b: global locale and timezone

**Decision:** Removed the root UK locale pins and stopped rendering every kick-off in
London time.

**Evidence and changes:**

- **hreflang.** The only annotation was a self-referencing `en-GB`, telling Google the
  site targets Britain. Replaced with **`x-default`**, which per Google's documentation
  marks the fallback when no locale is a better match — correct for a single global site.
  Note for future locale work: **never emit `UK`** — Google explicitly ignores it, and the
  ISO 3166-1 code is `GB`.
- `<html lang>` `en-GB` → `en`; OG `locale` `en_GB` → `en`; WebSite `inLanguage` → `en`.
- Dropped `areaServed: "GB"` from both the Organization and ContactPoint JSON-LD — the
  audience is worldwide.
- `public/manifest.json` declared `en-US` while `<html>` said `en-GB`. Both were wrong and
  they contradicted each other. Aligned on `en`.
- **`components/homepage/match-card.tsx` and `spotlight-events.tsx` hardcoded
  `timeZone: 'Europe/London'`,** so a visitor in Sydney saw a Saturday 17:30 fixture as
  "Sat 17:30" when it actually starts 02:30 Sunday where they are. Wrong information, not
  a cosmetic issue. Now uses the runtime timezone (the viewer's, on the client).
- **Hydration:** both are client components, so viewer-timezone rendering would make the
  server render disagree with the client. Added a `mounted` gate in `match-card.tsx` so
  the time renders only after hydration. This is the same class of bug as Trouble Registry
  Bug 5 — it would have shipped as a production-only hydration error.

**New:** `lib/utils/datetime.ts` — shared, locale-and-timezone-aware formatters, with the
rule that a timezone abbreviation must come from `Intl`, never a hardcoded "BST" (which is
wrong half the year even in Britain).

**Still open in Phase 3:** ~30 remaining `en-GB` formatter calls in server components,
`addressCountry: 'GB'` applied to every match regardless of league, and 65 hardcoded
UK-broadcaster references in page copy and FAQ schema. These are a larger content job and
are scoped separately.

**Verified:** `Europe/London` no longer appears anywhere outside per-country data ·
tsc 0 errors · vitest 14/14 · build succeeds.
