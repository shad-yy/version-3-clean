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

---

## 2026-08-11 — Sports broadcast rights: no API exists; TMDB does not cover them

**Decision:** Built the TMDB integration for the film/TV vertical. Sports broadcast
listings stay on hand-verified data in `lib/data/broadcast-rights.ts`.

**Considered:** Using TMDB for sports too; using TheSportsDB's TV endpoints.

**Evidence — both alternatives were tested and ruled out:**

- **TMDB Watch Providers covers films and TV series only.** It has no concept of a
  fixture or a competition. It cannot answer "who shows La Liga in Spain".
- **TheSportsDB's TV data is too sparse to use.** Tested live on 2026-08-16:
  `eventstv.php?d=…&s=Soccer` returned **1 event for all of world soccer**, carrying
  `idChannel`/`strChannel`. `eventsday.php` returned 3 events with **no TV fields at
  all**. `strTVStation` is modelled in `lib/types/sportsdb.ts` and `lib/types.ts` but
  comes back empty. One event per day globally cannot back a broadcast listing.

**Consequence:** There is no data source that would let us assert sports broadcasters at
scale. That leaves one honest option for the 65 hardcoded UK-broadcaster references:
**remove the assertions we cannot source**, rather than keep UK-pinned claims that are
also wrong for non-UK competitions (e.g. `DynamicSEOContent.tsx` currently tells La Liga,
Serie A, Bundesliga and Ligue 1 visitors that "official UK broadcasters include Sky
Sports, TNT Sports, BBC Sport"). Where `broadcast-rights.ts` has verified data, name the
broadcaster; where it does not, say nothing. **Not yet done — this is the top of the
Phase 3 queue.**

---

## 2026-08-11 — TMDB client added (UNVERIFIED against the live API)

**Decision:** `lib/api/tmdb.ts` — per-country film/TV availability, cached, server-only.

**Design constraints baked in:**
- **JustWatch attribution is mandatory** — exported as `JUSTWATCH_ATTRIBUTION` so a page
  cannot render the data without having the string to hand.
- **No deep links exist.** TMDB returns a TMDB landing link, not a provider play URL. The
  type names it `tmdbLink` and the doc-block warns against rendering provider logos as
  though they launch playback.
- Empty results are a **legitimate answer**, not an error — the fetch logs its real cause
  so "no data" is never confused with a fault.
- `isTmdbConfigured()` lets callers hide the vertical rather than 500 when no key is set.
- TTLs: 6h for availability, 7d for provider/region reference data.

**⚠️ NOT VERIFIED.** `TMDB_API_KEY` is not configured in this environment, so the client
has been type-checked and written against the documented response shape but **never run
against the live API**. Before relying on it: add the key (see `README.env.example`), then
confirm `getWatchProviders('movie', 550)` returns populated countries and that the field
mapping matches. Do not mark this integration done until that output is recorded.

---

## 2026-08-11 — Removed the unverifiable broadcaster assertions

**Decision:** Deleted every **templated** broadcaster claim — the ones generated for all
competitions or all fixtures from one string — and fixed the invalid `addressCountry`.

**Considered:** Making them country-aware instead. Rejected for now: there is no data
source behind them (see the previous entry — TMDB covers film/TV only, TheSportsDB's TV
data is 1 event/day globally). Country-awareness with no data is still fabrication.

**Rule applied:** where `lib/data/broadcast-rights.ts` has a verified entry, name the
broadcaster. Where it does not, say nothing. An absent answer is recoverable; a wrong one
on an accuracy-led site is not.

**What was removed:**

- `components/league/DynamicSEOContent.tsx` — an FAQ answering *"How to watch {league}
  live in the UK?"* with *"Official UK broadcasters … include Sky Sports, TNT Sports,
  BBC Sport, and Amazon Prime Video."* This component renders for **every** league, so
  that sentence asserted UK rights holders for La Liga, Serie A, Bundesliga and Ligue 1.
  Replaced with a fixtures/results answer that names nobody.
- `app/match/[id]/page.tsx` — *"In the UK, {league} fixtures are broadcast by … typically
  Sky Sports or TNT Sports"*, generated for **every match on the site**. Now states that
  rights differ by country and points at the guide.
- `components/match/match-tabs.tsx` — *"We list the official UK rights holder for every
  fixture"*, shown on every match page. That was also simply untrue: we list rights
  holders for 2 competitions in 4 countries.
- `components/layout/footer.tsx` — "Sky Sports Guide" / "TNT Sports Guide" links, on
  **every page**, framing the whole site as UK-only. Now named by competition.
- `components/ui/LiveEventFloat.tsx` — two hardcoded World Cup fixtures from July 2026
  with UK channel labels. They had expired, so the component rendered nothing while still
  shipping UK-pinned broadcaster names in the bundle.

**`addressCountry` fixed in three places:**

- `app/match/[id]/page.tsx` and `components/league/DynamicSEOContent.tsx` hardcoded `'GB'`
  for every venue in every league — wrong for most fixtures. **Property omitted**, which
  is valid schema; asserting a false country is not.
- `app/watch/[slug]/page.tsx` passed the country **name** (`'England'`, `'Spain'`) where
  schema requires ISO 3166-1 alpha-2 — invalid regardless of market. Added `countryCode`
  to `lib/constants/leagues.ts` (`GB`, `ES`, `DE`, `IT`, `FR`) and the property is now
  omitted for multi-national competitions rather than inventing a code for "Europe".

**Deliberately left:** broadcaster names on the six **competition-specific** pages
(`/ufc`, `/watch/champions-league`, `/watch/europa-league`, `/watch/formula-1`,
`/watch/formula-1/race/[id]`, `/watch/world-cup-2026`). Those are single-competition
claims that are plausibly accurate for the UK — they are **UK-pinned, not fabricated**.
Fixing them is a country-awareness job that needs `broadcast-rights.ts` extended first,
which is a different decision. `components/news/news-filters.tsx` keeps "BBC Sport" as a
news-source filter value, which is a real source name, not a rights claim.

**Verified:** tsc 0 errors · vitest 14/14 · build succeeds · no hardcoded
`addressCountry` remains outside the ISO-coded league map.

---

## 2026-08-16 — The store's WhatsApp sales line was still live in this project

**Decision:** Delete `components/chat/WhatsAppFloat.tsx`, unmount it from
`app/layout.tsx`, remove the "Instant Support" block from `app/contact/page.tsx`, and drop
the `WHATSAPP_URL` and `STORE_URL` accessors from `lib/config/env.ts`. Email support stays.

**Considered:** keeping the widget and swapping the number. Rejected — this site has no
sales function, and "We reply in under 5 minutes" is conversion copy, not a contact
affordance. An information source does not need a chat sales channel.

**Evidence:** `.env.local` carried
`NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/447429313810` — the **same number** that was
hardcoded in `smartlivetv-store/FirestickWizard.tsx`, deleted in Phase 1. Two source files
still read it, so deleting the store folder did not remove the sales line. The widget was
mounted site-wide at `app/layout.tsx:191` and rendered on every page.

**Consequence:** the last live commercial affordance is gone. `STORE_URL` was already a
dead accessor — defined, never read. `ORDER_NOTIFY_EMAIL` and `RESEND_API_KEY` remain in
`.env.local` but have no consumer in source.

**How it survived earlier audits:** the phone number never appears in tracked source. It
lives in a gitignored `.env.local`, reached through a generic `process.env` lookup. Grep
for the number finds nothing. This is the second time a remnant has hidden from text
search — the first was rendered text inside `og-default.png`.

---

## 2026-08-16 — This project defaulted to the store's domain

**Decision:** Remove `smartlivetv.co.uk` as the fallback origin everywhere. Production now
**throws** if `NEXT_PUBLIC_SITE_URL` is unset rather than guessing; local builds fall back
to `http://localhost:3200`.

**Considered:** leaving the default until a domain is chosen. Rejected — a wrong canonical
is the most damaging metadata error a site can ship, and the failure mode is silent.

**Evidence:** the served homepage emitted
`<link rel="canonical" href="https://smartlivetv.co.uk"/>` — a domain this project does
not own, belonging to a different product in a different repo. Sources:
`lib/config/site-url.ts:23`, `.env.local`, `scripts/generate-posts.js:14`,
`scripts/ping-indexnow.js:14`. Every URL in `public/llms.txt` — the file answer engines
read first — pointed at the store.

**Also removed:** `public/f63234d7ee824249a5b3260c6d2c49e2.txt`, the store's IndexNow key
file, and the same key hardcoded in `scripts/ping-indexnow.js`. Host and key are now both
required with no defaults. Enabling IndexNow without them would have submitted this site's
URL paths **under the store's hostname** to Bing and Yandex — an outward-facing action
against a domain we do not control.

**Consequence:** a domain change is now a pure environment change. Set
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_HOST`, `NEXT_PUBLIC_SITE_NAME`, and — only if
IndexNow is wanted — `INDEXNOW_HOST` plus `INDEXNOW_KEY` with a matching `{key}.txt` in
`public/`.

---

## 2026-08-16 — Next.js metadata replaces, it does not merge

**Decision:** Add `lib/seo/open-graph.ts` with `buildOpenGraph()`. Route metadata calls it
instead of hand-writing an `openGraph` object.

**Evidence (measured, not assumed):** the served homepage carried exactly two OG tags,
`og:title` and `og:description`, while `twitter:image` **survived**. The homepage overrode
`openGraph` but not `twitter`, which is the replacement semantics visible in one page's
output. Consequence: sharing the homepage on any social platform produced a card with no
image. Ten of eleven routes that declare `openGraph` were losing `siteName`, `type` and
`locale` the same way.

**After the fix**, the homepage emits all ten OG tags including `og:image` (1200x630),
`og:url`, `og:site_name`, `og:locale` and `og:type`.

**Consequence:** the nine remaining routes still hand-write `openGraph` and still lose
`siteName`/`type`/`locale`. That is cosmetic — the image and title survive on those pages
— so it is queued rather than urgent. Convert them when each is next touched.

---

## 2026-08-16 — hreflang is NOT being fanned out across routes

**Decision:** Keep the single `x-default` in the root layout as scaffolding. Do **not**
add hreflang to the 19 routes whose `alternates` override drops it.

**Considered:** fanning `x-default` out to every route for consistency. Rejected as
busywork with no ranking benefit.

**Evidence:** Google's documentation describes hreflang as the mechanism for indicating
*alternate* language or region versions. With a single locale there is no alternate to
point at, so a self-referencing `x-default` is a no-op. Source:
[Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions).

**Consequence:** when translations ship, hreflang becomes real work and must be done
properly — every variant links to every variant including itself, and the region code for
the United Kingdom is **`GB`**; Google explicitly ignores `UK`.

**Verified this session:** `npx tsc --noEmit` exit 0 · `node scripts/generate-posts.js`
exit 0 · served homepage and `/contact` both HTTP 200 with zero matches for
`smartlivetv.co.uk`, `iptv`, `wa.me`, `whatsapp` or `free trial`.

---

## 2026-08-16 — No emoji anywhere in the product

**Decision:** Remove every emoji from shipped code, replacing icon-duty emoji with
lucide-react SVGs and deleting decorative ones. Recorded as standing rule 5a in
`OWNER-INSTRUCTIONS.md`.

**Considered:** deleting all of them outright. Rejected — several were doing an icon's
job (a pin before a venue, a calendar before a date, per-type icons in search results),
and deleting those leaves dangling text with no affordance.

**Evidence:** emoji are font-dependent glyphs, not images. They render differently on
every platform, cannot inherit theme colour, and carry no reliable accessible name. An
SVG icon does all three. Every replacement is marked `aria-hidden="true"` because each
sits beside text that already says the same thing.

**Scope:** 128 emoji across 34 files in `app/`, `components/`, `lib/`, `scripts/`. Not
touched: `.claude/` and `.cursor/` agent rule files (4,397 occurrences, agent-facing
tooling rather than the product) and `memory-bank/` (84, internal documentation).

**Notable calls:**

- Twelve error pages each opened with a *different* decorative emoji at `text-5xl` — a
  football, a trophy, a magnifying glass. Twelve glyphs for one state. All now one
  `AlertTriangle`.
- Console output in scripts: decoration deleted, but where a glyph carried the whole
  signal (tick versus cross in a validation report) it became a **word**, `PASS`/`FAIL`.
- `⌘K` in the command palette was **kept and made platform-aware**. It is a keyboard
  symbol, not decoration — but the handler accepts `metaKey || ctrlKey` while the hint
  always showed the Command symbol, so Windows and Linux visitors were shown a key
  their keyboard does not have. Now `Ctrl K` unless the platform is Apple.
- Typography is not emoji: arrows, dashes, curly quotes and bullets stay.

**Process lesson:** the first sweep used too narrow a codepoint range and missed
U+23F0 by omitting Miscellaneous Technical (U+2300–U+23FF). That one line was also
printing a false timezone — see below. Audit with a wide range.

---

## 2026-08-16 — A literal "BST" was labelling a UTC value

**Decision:** Add `components/ui/local-time.tsx` and use it for match kick-off times.

**Evidence:** `app/match/[id]/page.tsx` rendered
`{match.strTime.split('+')[0]} BST` on every match page. That `strTime` is UTC is not
an assumption — `app/api/spotlight/route.ts:44` builds `new Date(`${date}T${time}Z`)`
from the same field. So the label was wrong for every visitor outside Britain, and
wrong for British ones from November to March when the country is on GMT.

**How it works:** the first client render deliberately reproduces the server's output
(UTC, explicitly labelled) so hydration matches, then an effect swaps to the viewer's
own zone with the abbreviation supplied by `Intl` rather than hardcoded. The
machine-readable instant always sits in `<time dateTime>`.

---

## 2026-08-16 — The build guard never inspected source files

**Decision:** Extend `scripts/generate-posts.js` with `assertSourceCompliant()`, which
runs the forbidden-phrase patterns over `app/` and `components/` and fails the build.

**Evidence — this is the significant finding of the session.** The MDX guard has run on
every dev start and every build for months. Meanwhile:

- `app/watch/formula-1/page.tsx` rendered *"Smart Live TV works worldwide with no
  regional restrictions or VPN required. Stream every F1 race from anywhere in the
  world."* The phrase `no VPN required` was **already in the guard's FORBIDDEN list**.
  Worse, it was a FAQ answer, so `generateFAQSchema` emitted it as structured data —
  the claim was being handed to Google.
- `app/watch/world-cup-2026/page.tsx` rendered *"Smart Live TV includes all broadcast
  channels — Sky Sports Main Event, Sky Sports Premier League, TNT Sports 1 and
  international feeds — so you never miss a fixture,"* above four channel tiles each
  labelled "Included".

Both are false: this site transmits no video, sells no access and bundles nobody's
subscription. The guard simply never looked at `.tsx`.

**Design note:** comments are stripped before matching, because the fix for each past
violation quotes the removed wording so the next reader understands what was wrong.
Only whole-line `//` comments are stripped, so `https://` inside a string survives.

**Verified by injection, not by absence:** re-adding the F1 sentence made the guard
exit 1 naming `app/watch/formula-1/page.tsx:58` and the matching pattern; restoring the
file returned exit 0.

**Still open:** the 17 `draft: true` MDX files in `content/blog/` carry heavy IPTV sales
copy — £12/mo, "230,000+ channels", free-trial links, IPTV-player setup instructions.
They are excluded from the build and from the sitemap, so they reach no user, but they
ship in the repo. They are expired World Cup fixture guides previously earmarked for
conversion into result reports. Deleting versus rewriting is the owner's call.

---

## 2026-08-16 — Deleted 17 expired drafts; replaced with evergreen global guides

**Decision:** Delete all 17 `draft: true` MDX files and publish three new evergreen
guides in their place.

**Evidence for deleting:** every one was a **dated fixture guide** — Argentina vs
Algeria, England vs Ghana, the World Cup quarter-finals, a July UFC Fight Night — with
dates from June and July 2026. All were in the past as of 16 August. They also carried
the IPTV sales copy the project is removing: £12/mo, "230,000+ channels", free-trial
links, IPTV-player setup instructions.

**The pattern is worth recording.** Of the 22 posts in the repo, the 17 that died were
all fixture-specific and the 5 that survived were all evergreen — cost comparisons and
how-to-watch guides. A post pinned to one kick-off has a shelf life measured in days;
a post about how something *works* does not. New content should default to the second
kind.

**The three replacements**, chosen to be evergreen, global, and writable without
inventing anything:

1. `saturday-3pm-blackout-explained` — why Britain blacks out the 3pm kick-off. The
   angle that makes it fit this site: it is a **British** rule, not a football rule.
   England and Scotland are the only UEFA associations still using Article 48 blocked
   hours, so the same fixture is broadcast normally almost everywhere else. That is the
   "availability differs by country" thesis attached to a question people actually ask.
2. `why-different-channel-every-country` — territorial rights, packages, staggered
   cycles, listed-events regimes. The site's positioning argued from first principles.
3. `kick-off-times-timezones-explained` — how to convert a fixture time, and the two
   windows each year when the familiar Europe-to-US offset is wrong because the two
   blocs change clocks on different dates.

**Every factual claim is sourced.** UEFA Article 48 permitting a two-and-a-half-hour
window, the 15:45–18:15 CET declaration for England and Scotland, and the 2026 daylight
saving dates (US 8 March / 1 November, EU 29 March / 25 October) were each verified
against published sources, which are cited in the posts.

**What was deliberately not claimed:** no per-country broadcaster listings beyond what
`lib/data/broadcast-rights.ts` actually holds, and no search-volume or traffic figures.
Keyword tooling was not available in this session, so no post asserts demand it cannot
evidence. The topics were chosen on durability and fit, not on a number.

**Also fixed while in the file:** `app/blog/page.tsx` was headed "Sports Streaming Blog"
and promised "watching every match from anywhere", with a description naming "the
official UK broadcaster". All three replaced.

**Correction for the record:** `/blog` returned 404 on first request during this session
and was briefly reported as a defect. It was a dev-server compile race on the first hit,
not a bug — three consecutive runs afterwards returned 200 for the index and all three
new posts.

**Verified:** tsc 0 errors · vitest 14/14 · `generate-posts.js` exit 0 with 8 posts and
the source guard passing · `/blog` and all three posts HTTP 200 · new posts present on
the index and in `public/llms.txt`.

---

## 2026-08-16 — Film and TV vertical built on TMDB; three bugs found by testing it

**Decision:** Ship `/watch/title/[slug]`, per-country availability for films and series,
and surface it from `/watch`. TMDB key supplied by the owner and verified live.

**The client had a real bug that only live data could reveal.** `lib/api/tmdb.ts` was
written and committed weeks earlier without ever running. TMDB returns a separate **`ads`**
bucket for free-with-advertising availability, distinct from `free`. The client mapped
`free` alone, so `ads` was dropped. For Fight Club, the only free route in Great Britain is
ITVX and it arrives under `ads` — the code was silently hiding the free option and leaving
only paid ones. That is the worst direction to be wrong in. Now mapped and rendered first,
above every paid tier.

**Caching hardened against the owner's rate-limit concern.** TMDB removed hard limits in
2019; the practical ceiling is around 50 requests/second with 20 connections per IP, and
they answer 429 rather than banning an IP. The real exposure was not volume but shape:

- **Negative caching.** `cacheGet` returns null both for "not cached" and "cached null", so
  a bare null could not express a remembered negative. Values are now wrapped in
  `{ v: T | null }`. Without this, title pages rendering on demand made the route an open
  relay — `/watch/title/movie-1-x`, `movie-2-x`, `movie-3-x` each missed cache and proxied
  to TMDB on our key. 404s are now remembered for an hour.
- **In-flight deduplication.** A popular title on a cold cache issued one upstream request
  per visitor. Identical concurrent requests now share a promise.
- **429 and network faults are never cached.** Both are transient; caching either would
  freeze a blip into an hour of wrong answers. A 404 is cached because it is a fact.

**Schema: `Movie`/`TVSeries` only, deliberately NO `WatchAction`.** Google's Watch Action
requires a `target` deep link that opens playback. TMDB does not provide one — it reports
that a provider carries a title in a country, not where to play it. Emitting a WatchAction
aimed at a landing page would mark up a link that does not do what the schema claims. The
availability data is already shaped for `ActionAccessSpecification` and `eligibleRegion`
whenever a licensed source of deep links exists.

---

## 2026-08-16 — A root loading.tsx was causing soft 404s site-wide

**Found while testing the new route, but it was never about the new route.**

`/watch/title/garbage` returned **HTTP 200** while rendering the 404 page. So did
`/watch/nonexistent-league` and `/teams/99999999`. Meanwhile a genuinely unmatched path
like `/this-route-does-not-exist` correctly returned 404.

**Cause:** `app/loading.tsx` at the repository root wraps *every* route in a Suspense
boundary. Next commits response headers and begins streaming the loading shell before the
page body runs, so by the time `notFound()` is called the 200 is already sent and cannot be
changed. The served HTML contained the loading skeleton **and** the 404 page together,
which is what gave it away.

**Why it matters:** a soft 404 tells Google a nonexistent page is a real page. Every invalid
team id, league slug and title slug was an indexable 200 — thin duplicate content and
wasted crawl budget, flagged in Search Console as "Soft 404".

**Decision:** delete `app/loading.tsx`. Verified against a production build and server, not
dev: invalid slugs now return 404 and every valid route still returns 200. Removing it also
stops a full-page skeleton flashing on every navigation, since the App Router keeps the
current page visible while the next one resolves.

**Not fixed, deliberately:** six routes keep their own segment-level `loading.tsx` and still
soft-404 — `/teams/[id]`, `/events/[id]`, `/ufc/fighters/[id]`, `/ufc/events/[id]`,
`/leagues/[id]` and `/blog/[slug]`. The same mechanism applies. Fixing them means removing a
loading state that has genuine UX value on a slow segment, or restructuring with route
groups so the index keeps its skeleton while the detail route does not. That is a UX call
for the owner, not a silent change.

**Also fixed:** `image.tmdb.org` was missing from `next.config.mjs` `remotePatterns`, so
every poster threw at render time while the route still answered 200 — a failure quiet
enough to reach production unnoticed.

**Verified:** tsc 0 errors · vitest 14/14 · production build compiles and pre-renders 20
trending title paths from the live API · `/watch/title/movie-550-fight-club` renders
"Available in 131 countries" with ISO codes resolved to country names · ITVX present under
the recovered `ads` bucket · JustWatch attribution on both the index and the title page.
