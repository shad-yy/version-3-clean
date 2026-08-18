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
| R4 | Invalid ids must return 404, not 200 | **Partial** | Root `app/loading.tsx` removed. **Six routes still soft-404** — see below |
| R5 | Semantic tokens, no raw hex | **Not started** | ~604 hex + 953 default greys vs ~188 tokens |
| R6 | No single-market (UK) copy or config | **Partial** | Root layout and formatters done; **6 competition pages + ~30 formatters remain** |
| R7 | Film/TV must be discoverable | **Partial** | `/watch` links to titles; **header nav still has no entry** |

---

## Open findings

### F1 — Six routes still return 200 for missing records

Each keeps its own segment-level `loading.tsx`, which starts streaming a 200 before the page
can call `notFound()`. Same mechanism as the root `loading.tsx` already removed.

`/teams/[id]` · `/events/[id]` · `/ufc/fighters/[id]` · `/ufc/events/[id]` ·
`/leagues/[id]` · `/blog/[slug]`

Soft 404s tell Google a nonexistent page is real — thin duplicates, wasted crawl budget,
flagged in Search Console. **Fixing it means removing a loading state that has genuine UX
value, or restructuring with route groups so an index keeps its skeleton while the detail
route does not.** Owner decision, deliberately not made silently.

### F2 — Film and TV are effectively invisible

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
| `/blog/[slug]` | ok | **!** F1 | ok | ? | ? | ? |
| `/contact` | ok | ok 200 | n/a | ? | ? | ? |
| `/events` | ? | ? | ? | ? | ? | ? |
| `/events/[id]` | ? | **!** F1 | ? | ? | ? | ? |
| `/faq` | ? | ? | n/a | ? | ? | ? |
| `/favorites` | ? | ? | ? | ? | ? | ? |
| `/leagues` | ? | ? | ? | ? | ? | ? |
| `/leagues/[id]` | ? | **!** F1 | ? | ? | ? | ? |
| `/match/[id]` | ? | ? | ? | ? | ? | ? |
| `/news` | ? | ? | ok | ? | ? | ? |
| `/players` | ? | ? | ? | ? | ? | ? |
| `/players/[id]` | ? | ? | ? | ? | ? | ? |
| `/privacy` | ? | ? | n/a | ? | ? | ? |
| `/scores` | ? | ? | ? | ? | ? | ? |
| `/search` | ? | ? | ? | ? | ? | ? |
| `/teams` | ? | ok 200 | ? | ? | ? | ? |
| `/teams/[id]` | ? | **!** F1 | ? | ? | ? | ? |
| `/terms` | ? | ? | n/a | ? | ? | ? |
| `/ufc` | ? | ? | ? | ? | ? | **!** F3 |
| `/ufc/events/[id]` | ? | **!** F1 | ? | ? | ? | ? |
| `/ufc/fighters/[id]` | ? | **!** F1 | ? | ? | ? | ? |
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
