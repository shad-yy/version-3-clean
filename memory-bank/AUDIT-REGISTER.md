# Audit register

The working tracker for the page-by-page, feature-by-feature audit the owner requested
before any redesign. **34 page routes, 38 API routes.**

Two jobs, kept separate on purpose:

- **Part A — does it work?** Backend and feature correctness, route by route. Must be clean
  before publishing.
- **Part B — does it follow the pattern?** Conformance to
  [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md), route by route. Drives the redesign.

---

## How to audit one route

Do all six steps. Step 4 is the one that has repeatedly been skipped, with consequences.

1. **Reach it.** Is it linked from anywhere? Is it in `app/sitemap.ts`? An unreachable page
   is either a bug or dead weight.
2. **Status codes.** A valid request returns 200. An invalid id returns **404, not 200** —
   see the soft-404 rule below.
3. **Data path.** Which API or client does it call? What does it render when that returns
   empty, and when it throws? "Data temporarily unavailable" is correct; a blank region is
   not.
4. **Render visually.** Screenshot or computed-style check. **`curl` cannot detect this
   class of bug** — transparent markup is present in the HTML, so a server-side check passes
   while the page is invisible to a human. This is exactly how four homepage sections stayed
   broken through multiple "verified" passes.
5. **Every clickable thing.** Follow each link and button. Record where it actually lands,
   not where it is supposed to.
6. **Pattern conformance.** Tokens vs hardcoded hex, lucide vs emoji, shadcn components vs
   bespoke markup, animation rules, no playback implications, no single-market copy.

---

## Standing rules and rollout status

A rule is not "done" until the proving command returns zero.

| # | Rule | Status | Proof |
|---|---|---|---|
| R1 | No emoji in shipped code | **Done** | Wide-range codepoint scan over `app components lib scripts` returns 0 |
| R2 | No IPTV / streaming-claim phrases in source | **Done, enforced at build** | `assertSourceCompliant()` in `scripts/generate-posts.js`; verified by injection |
| R3 | Animations must never hide content | **Done for the two wrappers** | `ScrollReveal`, `FadeIn` rewritten to `whileInView`; all homepage sections at opacity 1 |
| R8 | Sightline handoff conformance | **In progress** | Done: tokens, type, header, hero, footer, Film & TV index, availability page + ribbon, search results, match rights panel, rights ledger, live-now. Remaining: world map, discovery dock (**blocked — see DECISIONS**), legacy homepage sections |
| R4 | Invalid ids must return 404, not 200 | **Done** | All 8 invalid routes return 404, all 14 valid routes 200, verified on a production server |
| R5 | Semantic tokens, no raw hex | **In progress** | Sightline `--sl-*` scale live. Header, hero, footer, `/watch/title` migrated. **18 large blocks still on legacy grounds** (measured in-browser) |
| R6 | No single-market (UK) copy or config | **Partial** | Root layout, formatters, hero, header, footer, match page done. Homepage resolver replaced by the ledger. **6 competition pages + ~28 formatters remain** |
| R7 | Film/TV must be discoverable | **Done** | In the header nav, its own index at `/watch/title`, and a footer column. All links 200. |

---

## Open findings

### F1 — Soft 404s across dynamic routes — RESOLVED

All six routes now return 404. Three distinct causes, which is why removing one file was
not enough:

**Cause 1 — segment `loading.tsx` boundaries.** A `loading.tsx` wraps its whole segment
*including descendants*, so the shell streams with a 200 before a child page can call
`notFound()`. Removing them fixed `/events/[id]` and `/blog/[slug]` outright. Note the
parent-segment trap: deleting `app/ufc/fighters/[id]/loading.tsx` changed nothing until
`app/ufc/loading.tsx` also went, because the parent covers every descendant.

**Cause 2 — `notFound()` called inside an in-page Suspense boundary.** `/teams/[id]` and
`/leagues/[id]` returned 200 even with no `loading.tsx`, because the existence check lived
in a component *inside* `<Suspense>`. By the time it ran the shell had streamed. Fixed by
awaiting the existence check in the page body before any JSX is returned. Both lookups are
TTL-cached, so the inner component's own fetch is a cache hit rather than a second call.

**Cause 3 — a null result that was never checked.** `/ufc/events/[id]` called
`getUFCEvent()`, which correctly returns null for an unknown id, then ignored it and fell
through to a hardcoded `'UFC Event'` placeholder. It rendered an empty shell reading "UFC
Event Details Loading" forever, with a 200.

**Loading states were replaced, not just deleted**, per the owner's instruction:

- `/blog` is statically rendered from the generated posts file, so it never needed a
  loading state. Removing its skeleton is correct rather than a regression.
- `/teams` had a `loading.tsx` that returned `null` — no UI at all, pure cost.
- `/ufc` is genuinely async, so its skeleton moved to
  `components/ufc/ufc-skeleton.tsx` and is now mounted via `<Suspense>` *inside*
  `app/ufc/page.tsx`. The index keeps its skeleton; the dynamic routes beneath it no longer
  inherit a boundary.
- `/events`, `/leagues`, `/players`, `/search`, `/teams` already had in-page Suspense
  fallbacks, so their loading UX is unchanged.

Proof, on a production server:

```
404: /teams/99999999  /events/99999999  /ufc/fighters/99999999  /ufc/events/99999999
     /leagues/99999999  /blog/does-not-exist  /watch/title/garbage  /watch/nonexistent
200: /  /teams  /events  /leagues  /blog  /ufc  /news  /scores  /watch  /search
     /players  /about  /faq  /contact
```

### F2 — Film and TV are effectively invisible — RESOLVED

The owner could not find them, and was right. `/watch/title/[slug]` works and `/watch` links
to it, but:

- **The header nav has no entry.** It reads Live Scores · Leagues · News · UFC · Blog.
- **The homepage has no film/TV section at all.**
- **The footer has no entry.**
- The hero names six sports competitions and no film.

A vertical reachable only from the middle of one page does not exist as far as a visitor is
concerned.

### F3 — UK is still present in user-facing copy

Confirmed still live:

- `/watch/formula-1` page title reads "F1 2026 Race Calendar & **UK TV Guide**".
- Six competition pages carry UK-only broadcaster prose — `/ufc`,
  `/watch/champions-league`, `/watch/europa-league`, `/watch/formula-1`,
  `/watch/formula-1/race/[id]`, `/watch/world-cup-2026`.
- The homepage "where to watch" panel leads with United Kingdom in both examples.
- ~30 hardcoded `en-GB` formatter calls remain in server components.

Making the competition pages global is a **research** task: rights holders must be verified
per country and added to `lib/data/broadcast-rights.ts`, which today covers 2 competitions
across 6 listings. It is not a code change.

### F4 — Hero is off-concept

See [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) §2 for the full assessment and direction.

---

## Route inventory — Part A and Part B status

Legend: `?` not yet audited · `ok` verified · `!` finding recorded

| Route | Reachable | Status codes | Data path | Visual | Links | Pattern |
|---|---|---|---|---|---|---|
| `/` | ok | ok | ? | **!** F4 | ? | **!** F2, F3 |
| `/about` | ? | ? | ? | ? | ? | ? |
| `/blog` | ok | ok 200 | ok | ? | ? | ? |
| `/blog/[slug]` | ok | ok 404 | ok | ? | ? | ? |
| `/contact` | ok | ok 200 | n/a | ? | ? | ? |
| `/events` | ? | ? | ? | ? | ? | ? |
| `/events/[id]` | ? | ok 404 | ? | ? | ? | ? |
| `/faq` | ? | ? | n/a | ? | ? | ? |
| `/favorites` | ? | ? | ? | ? | ? | ? |
| `/leagues` | ? | ? | ? | ? | ? | ? |
| `/leagues/[id]` | ? | ok 404 | ? | ? | ? | ? |
| `/match/[id]` | ? | ? | ? | ? | ? | ? |
| `/news` | ? | ? | ok | ? | ? | ? |
| `/players` | ? | ? | ? | ? | ? | ? |
| `/players/[id]` | ? | ? | ? | ? | ? | ? |
| `/privacy` | ? | ? | n/a | ? | ? | ? |
| `/scores` | ? | ? | ? | ? | ? | ? |
| `/search` | ? | ? | ? | ? | ? | ? |
| `/teams` | ? | ok 200 | ? | ? | ? | ? |
| `/teams/[id]` | ? | ok 404 | ? | ? | ? | ? |
| `/terms` | ? | ? | n/a | ? | ? | ? |
| `/ufc` | ? | ? | ? | ? | ? | **!** F3 |
| `/ufc/events/[id]` | ? | ok 404 | ? | ? | ? | ? |
| `/ufc/fighters/[id]` | ? | ok 404 | ? | ? | ? | ? |
| `/watch` | ok | ok 200 | ok | ? | ? | ? |
| `/watch/[slug]` | ok | ok 404 | ? | ? | ? | **!** F3 |
| `/watch/champions-league` | ok | ? | ? | ? | ? | **!** F3 |
| `/watch/europa-league` | ok | ? | ? | ? | ? | **!** F3 |
| `/watch/formula-1` | ok | ? | ok | ? | ? | **!** F3 |
| `/watch/formula-1/race/[id]` | ? | ? | ? | ? | ? | **!** F3 |
| `/watch/title/[slug]` | ok | ok 404 | ok | ? | ? | ok |
| `/watch/world-cup-2026` | ok | ? | ? | ? | ? | **!** F3 |
| `/admin/api-health` | ? | ? | ? | ? | ? | ? |
| `/admin/api-management` | ? | ? | ? | ? | ? | ? |

Admin routes are gated by `JWT_SECRET`, which is currently the literal
`your-strong-secret` — see [SETUP-REQUIRED.md](./SETUP-REQUIRED.md) §3. Treat that as a
security finding, not a config nicety.

---

## Sitemap conformance

`app/sitemap.ts` emits 29 URLs. Known gaps: `/favorites` and `/watch/title/[slug]` are
absent. Every URL currently emitted resolves.

Once the film/TV vertical is public, decide whether trending title pages belong in the
sitemap — they change weekly, so a churning sitemap is a real cost against little gain.
