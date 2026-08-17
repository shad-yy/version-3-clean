# What the project needs from the owner

Everything blocked on input only the owner can give: decisions, API keys, and access.
Ordered by what it unblocks, not by effort.

Compiled 2026-08-16 by enumerating every `process.env.*` read in source and comparing
it against `.env.local`, so this lists variables the **code expects**, not just ones
somebody already wrote down.

---

## Tier 1 — Blocking. Nothing downstream is correct until these are answered.

### 1.1 The domain

**This is the single biggest blocker.** Canonical URLs, the sitemap, every schema `@id`,
Open Graph URLs, `llms.txt`, IndexNow submission and Search Console registration all
derive from it.

It used to default to `smartlivetv.co.uk` — the commercial store's domain, a different
product in a different repo. That default is gone, and production now **throws** rather
than guessing, because a canonical pointing at a domain you do not own is the most
damaging metadata error a site can ship.

Until a domain exists, local builds fall back to `http://localhost:3200`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, e.g. `https://example.com`, no trailing slash |
| `NEXT_PUBLIC_SITE_HOST` | Bare hostname, e.g. `example.com` — used by the content generator |
| `NEXT_PUBLIC_SITE_NAME` | Brand name in metadata, schema and generated copy |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Public contact address; defaults to `support@<host>` |
| `NEXT_PUBLIC_OG_TAGLINE` | Line rendered into the social share image |

**If the answer is "not yet, keep working locally", that is a valid answer** — say so and
nothing changes. The work queued behind it is deployment, not development.

### 1.2 Ahrefs — the current plan grants no API access

The connector is authorised and working. Every endpoint nonetheless returns
`{"error": "Insufficient plan"}` — including `public-domain-rating-free`, which the docs
describe as free, and a Keywords Explorer call using the `ahrefs` test keyword, which the
docs say consumes no units. When even the free endpoints refuse, it is the plan tier, not
the credentials.

Ahrefs API v3 is available from the **Lite** plan upward. **Starter and free tiers get no
API access at all**, which matches exactly what is being returned.

**What this means:** I cannot pull search volumes, keyword difficulty, SERP data, or
competitor gaps. Content topics are currently chosen on durability and fit rather than on
measured demand — which is defensible, but it is judgement, not data.

**To unblock:** upgrade to Lite or above, or accept that content selection stays
evidence-light and say so.

> **Standing instruction from the owner (2026-08-16):** the Ahrefs account also contains a
> project for the previous IPTV business. **Do not mix the two.** If Ahrefs data is ever
> pulled, confirm which project it belongs to first, and create a new project for this
> site rather than reusing the old one. No project list could be retrieved to check
> against, because the management endpoints are blocked by the same plan limit.

---

## Tier 2 — Keys that unlock work already queued

### 2.1 `TMDB_API_KEY` — free, and blocks an entire planned vertical

`lib/api/tmdb.ts` is written, typed and committed but **has never run against a live
key**. It is the foundation of the film and television side: TMDB's Watch Providers
endpoints are powered by JustWatch and return per-country streaming, rental and purchase
availability — which is precisely the "where can I watch this, in my country" answer the
site is being repositioned around.

Without it, that vertical cannot be built or verified.

- Free to obtain from a TMDB account
- **Attribution to JustWatch is mandatory** wherever the data appears, and is already
  implemented as `JUSTWATCH_ATTRIBUTION`
- Note the API returns availability only — **no deep links to play a title**

### 2.2 `THESPORTSDB_API_KEY` — currently running on the public free key

`lib/api/the-sports-db.ts` falls back to the shared public key `"123"` and logs a warning
on every boot. Everything works, but on a key shared with the entire internet: tighter
rate limits and fewer endpoints. The codebase already throttles itself to 25 requests per
minute against a 30/min ceiling.

A paid key removes the ceiling risk and unlocks endpoints the free tier withholds.

### 2.3 `FOOTBALL_DATA_API_KEY` — optional, client already exists

`lib/api/football-data.ts` exists and reads this variable. It is unset, so that client is
inert. football-data.org has a free tier. Worth having only if we intend to use it as a
cross-check against TheSportsDB — otherwise the honest move is to delete the client.

---

## Tier 3 — Values that look configured but are placeholders

These are more dangerous than missing variables, because nothing warns you.

| Variable | Current value | Consequence |
|---|---|---|
| `JWT_SECRET` | `your-strong-secret` | **Security.** Signs the admin session cookie for `/admin`. A guessable literal means admin auth is effectively open to anyone who reads this repo. Replace before any deployment. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-your-id` | Google Analytics loads with an invalid ID. No analytics are being collected, and the tag still executes. |
| `GOOGLE_SITE_VERIFICATION` | `your-code` | Placeholder **and wired to nothing** — there is no `verification` field in `app/layout.tsx`. Search Console verification is not happening by meta tag. Needs both a real code and the code change, or verify by DNS instead. |
| `RESEND_API_KEY` | `your-resend-key` | Placeholder. No source file reads it — see Tier 5. |

---

## Tier 4 — Access rather than keys

- **Google Search Console** for the new domain, once one exists. Needed to see real
  queries, impressions and coverage errors. Everything before that is inference.
- **IndexNow**, only if wanted: requires `INDEXNOW_ENABLED=true`, `INDEXNOW_HOST`, and
  `INDEXNOW_KEY` with a matching `{key}.txt` served from the site root. All three are now
  mandatory with no defaults — the script previously defaulted to the store's hostname
  and the store's key, which would have submitted this site's paths under the store's
  domain to Bing and Yandex.

---

## Tier 5 — Configured but dead; safe to delete

Set in `.env.local`, read by no source file:

- `RESEND_API_KEY` and `ORDER_NOTIFY_EMAIL` — left from the store's order-notification
  flow. This project has no commerce.
- `FIRECRAWL_API_KEY` — a real key, but nothing in the codebase uses it. It is tooling for
  the agent, not the application. Harmless; noted so nobody assumes a dependency exists.

---

## Decisions, not credentials

1. **Film and TV: build it or defer it?** The plan adds a film/TV vertical alongside
   sports. It is gated on 2.1. Confirm it is still wanted before the routes get built.
2. **The six UK-pinned competition pages.** `/ufc`, `/watch/champions-league`,
   `/watch/europa-league`, `/watch/formula-1` and two others carry UK-only broadcaster
   prose. Making them global is a **research** task — someone has to verify rights holders
   per country and add them to `lib/data/broadcast-rights.ts`, which currently covers 2
   competitions across 6 listings. Options: research them, restrict those pages to the
   markets we can verify, or leave them and accept the ceiling.
3. **Theme.** Deferred by earlier decision. When it happens it is a normalise-then-tokenise
   job across 64 files, not a palette swap — see `OWNER-INSTRUCTIONS.md` rule 5.
