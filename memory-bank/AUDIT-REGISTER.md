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
| R8 | Sightline handoff conformance | **In progress** | Done: tokens, type, header, hero, footer, Film & TV index, availability page + ribbon + world map, search results, match rights panel, rights ledger, live-now, legacy section migration. Remaining: discovery dock (**blocked — see DECISIONS**) |
| R4 | Invalid ids must return 404, not 200 | **Done** | All 8 invalid routes return 404, all 14 valid routes 200, verified on a production server |
| R5 | Semantic tokens, no raw hex | **Done for app + components** | 1,261 replacements across 57 files. Legacy dark-theme CSS variables now alias the Sightline tokens, so anything still using `bg-background` inherits correctly. **Zero legacy hex remains in `app/` or `components/`**, and an in-browser scan of the rendered homepage finds zero legacy colours |
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

---

## 2026-08-20 — Correction: the token migration was reported complete while 93 references remained

I previously reported the Sightline token migration finished with "zero legacy remaining".
That was wrong, and the way it was wrong is worth recording so the same check is not
trusted again.

**What I verified:** hex literals inside Tailwind class strings (`bg-[#00e676]`).
**What I did not verify, and what was still live:**

| Form | Count | Why the check missed it |
|---|---|---|
| `#00e676` | 15 | inside `globals.css` rulesets, not class strings |
| `rgba(0,230,118,…)` | 17 | rgba literal — the hex grep could not match it |
| `emerald-*` | 29 | Tailwind named colour, no literal to grep |
| `green-*` | 32 | same |

The visible consequences: **every blog article rendered its links and inline code in the
old IPTV green**, and thirteen buttons across the site carried a green glow shadow — which
the handoff forbids twice over, once on colour and once because it permits exactly one
shadow in the entire system (the discovery dock).

**The lesson is about the grep, not the colours.** A palette can be abandoned in at least
four syntaxes, and searching for one of them proves nothing about the other three. The
check that actually works is the inverse: enumerate the colours the design *permits* and
find everything that is not one of them.

### Dead subsystems removed while fixing it

Each was confirmed to have zero importers before deletion:

*   **`lib/utils/sport-themes.ts`** — a per-sport palette (green/emerald football, etc.).
*   **`components/sport-theme-provider.tsx`** — wrapped the entire app in `layout.tsx` and
    did nothing except read a stale `sport-theme` key from `localStorage` and apply a
    `theme-*` class from it. Worse than inert: those classes were the malformed ones below,
    so a leftover value from the old site would have applied a broken theme.
*   **83 lines of `.theme-ufc/football/basketball/tennis` CSS** — unreachable once the
    provider went, and broken from the start: they defined HSL triplets while
    `tailwind.config.ts` maps the same variables with no `hsl()` wrapper.
*   **`.gradient-text`** (blue→purple→green) and **`.match-status.*`** — both dead, and
    `.match-status` was a second status palette contradicting the one `/scores` uses.
*   **`components/ui/progress.tsx`** and **`getPopularityColor()`** — no consumers.

Left in place deliberately: the `success` variant in `components/ui/toast.tsx`. Green means
success in a toast by universal convention, and that file is live shadcn infrastructure
rather than old-design residue.

---

## 2026-08-20 — The FAQ page was the most inaccurate page on the site

Rewritten as `/faq` "Help and questions", on the Sightline shell, and reorganised around
what a reader is trying to do rather than around topics. Four separate problems, and each
one had been sitting on a page whose entire job is to explain how the site works:

*   **It opened by calling the site "a live scores and fixtures hub".** The owner has said
    plainly that this is not a scores product. The page contradicted the positioning on
    its first line.
*   **"Refreshed automatically every 60 seconds."** Nothing in the codebase refreshes on
    that interval — the real figures are 6 hours for film and television availability,
    days for reference data, and by-hand for broadcast rights. A number with no source, on
    a site whose premise is that its numbers have sources.
*   **"Broadcast listings reference the official UK rights holders."** The single most
    limiting sentence available to a site built on per-country answers.
*   **"Contact our support team anytime."** There is no support team.

The replacement leads with the questions people actually arrive stuck on — why a match is
not shown in their country, why the channel changed since last season, why kick-off times
look wrong — and links each to the explainer that already covers it, which is also the
cheapest way to keep a reader on the site.

Its FAQ schema carries only the four questions whose answers are self-contained. A
question whose real answer is "it depends on your country" makes a bad rich result: Google
would index it as a flat claim and read it back to the people it is wrong for.

### Every match page asserted UK rights

`app/match/[id]/page.tsx` told every reader, for every competition, that the fixture was
"covered by the official UK rights holders" — and a step captioned "See which UK rights
holder is showing this fixture live".

The page had been calling `resolveRights(league, getViewerCountry())` the whole time and
rendering a country-aware panel directly above the paragraph that contradicted it. The
prose was a leftover that had outlived its data. It now describes rights as sold per
country, points at the panel, and says where a country is missing we have not checked it.

**Left alone deliberately:** `app/watch/world-cup-2026/page.tsx` also says "UK rights
holder", but it says so as an explicit label inside a section about the Premier League,
where it is accurate and country-qualified. Honest scoping is not the same defect as an
unqualified global claim.

---

## 2026-08-20 — A fabricated scoreline was live, in structured data, for a month

`/watch/world-cup-2026` published the 2026 World Cup final as **Spain 4–1 Argentina** and
called Spain champions "for the fifth time". Both were false. Verified against two
independent sources:

*   The final was **Spain 1–0 Argentina, after extra time**, Ferran Torres scoring in the
    106th minute.
*   It was Spain's **second** world title, their first since 2010.

Everything else on the page was right — Spain did win, against Argentina, on 19 July 2026
at MetLife Stadium. **That mixture is what made it dangerous.** A page that is wrong about
everything gets caught. A page that is right about the winner, the opponent, the date and
the venue, and wrong only about the score, reads as authoritative.

**What gave it away was internal contradiction, not the score.** "Fifth time" is
impossible on its face — Spain had one title before this tournament, so no result in 2026
could make it five. The falsifiable claim exposed the unfalsifiable one sitting next to it.

The scoreline was not merely displayed. It was in the page title, the OpenGraph
description, the `FAQPage` answer and the `SportsEvent` schema with a declared `winner` —
four separate machine-readable assertions handed to search engines and answer engines as
fact, on a site whose entire premise is that its facts are checked.

**The generalisable lesson:** this content long predates the current work and was never
verified because nothing on the page invited verification — no source, no checked-date, no
provenance of any kind. The broadcast listings have a verification log precisely so this
cannot happen to them. Editorial claims about real-world events have no equivalent, and
this is what that gap costs. **Any page asserting a result, a record or a statistic needs
a source recorded next to it, or it needs to not make the claim.**
