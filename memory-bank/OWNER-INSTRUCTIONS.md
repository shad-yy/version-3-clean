# Owner instructions — READ THIS FIRST, BEFORE ANY TASK

These are standing constraints from the project owner. They are not suggestions and they
do not expire. Every agent working on this repository reads this file before doing
anything else.

If a task appears to require breaking one of these, **stop and ask.** Do not proceed on
the assumption that this file is out of date.

---

## 0. Work only in this folder.

There are two similarly named checkouts on the owner's machine. They are **different
products with different repositories**, and confusing them has already happened once.

| Path | Repo | What it is |
|---|---|---|
| `Legalizedsmart-live-tv\smart-live-tv` | `shad-yy/version-3-clean` · `main` | **This project.** The global where-to-watch information source. |
| `Downloads\smart-live-tv` | `shad-yy/forclaude` · `Version-3` | The commercial store on `smartlivetv.co.uk`. **Not ours. Do not edit it.** |

**Known tooling trap:** the `preview_start` tool resolves `.claude/launch.json` from the
*session's primary working directory*, which is the **store**. Calling
`preview_start({name: "dev"})` therefore boots the wrong project, and it looks convincing —
it serves a real site on `localhost:3000`. It was caught only because the page title read
`Smart Live TV | IPTV UK from £12/mo — Free Trial`, which cannot come from this codebase.

Start this project's dev server explicitly instead, on a port the store is not using:

```bash
cd "C:/Users/u2000/Downloads/Legalizedsmart-live-tv/smart-live-tv" && PORT=3200 npm run dev
```

Before trusting any `curl` or browser check, confirm which project answered. A served page
containing `iptv`, a channel count or a price is the store, not this site.

## 1. Never fabricate data. Ever.

This is the first rule because it is the one that destroys the product if broken.

The entire value of this site is that its answers are correct. A wrong broadcaster
listing, an invented statistic, a made-up availability window or a guessed kick-off time
is worse than publishing nothing at all.

- If you cannot verify something, **say "I was unable to verify this"** and omit it.
- Never fill a schema property with a plausible-looking guess. Omit the property.
- Never present an estimate as a measurement. If you did not measure it, say so.
- This applies to code comments, documentation and commit messages too.

## 1a. Every factual claim carries its source. No exceptions.

Rule 1 says never fabricate. This says how it is enforced, because "do not fabricate" was
already the rule when a fabricated World Cup scoreline went live for a month.

**Any assertion about the real world — a result, a record, a statistic, an announced date —
lives in `lib/data/editorial-claims.ts` with the source it came from, and the page renders
`<ClaimSources>` beneath it. A claim with no registry entry does not get published.**

The full rules are in that file's doc-block and enforced by
`tests/editorial-claims.test.ts`. The two that matter most:

*   **Results and records need two independent publishers.** Not one source twice.
*   **Cite only what was actually opened and read.** A search result that was never
    fetched is not a source, however official the site would have looked in the list.

**What went wrong, so it is not repeated:** `/watch/world-cup-2026` published the 2026
final as "Spain 4–1 Argentina" and called Spain champions "for the fifth time". The real
result was 1–0 after extra time, their second title. It was in the page title, the
OpenGraph description, a `FAQPage` answer and a `SportsEvent` schema at once.

The page was correct about the winner, the opponent, the date and the venue. That is what
made it dangerous — **a page wrong about everything gets caught; a page wrong about one
number reads as authoritative.**

If a claim cannot be sourced, the claim comes out. A page that says less is not a failure;
a page that says something false is.

---

## 2. Never build on weak data.

Distinct from rule 1, and just as important.

Small samples and unconfirmed reports are not evidence. Do not derive strategy from them,
and do not let them into documentation as if they were established.

- State the sample size whenever you cite a number.
- A percentage change on a base of single digits is noise, not a trend.
- Third-party SEO blogs are not authoritative. Prefer Google, MDN, web.dev, OWASP, W3C
  and official vendor documentation. When a blog conflicts with a primary source, the
  primary source wins.
- Where an industry claim is unconfirmed, record it as unconfirmed or leave it out.

## 3. Global, not UK.

This site serves a worldwide audience. Any assumption that the visitor is British is a
ceiling on the addressable market and a defect to be fixed.

- No hardcoded `en-GB` formatting, no hardcoded `Europe/London`, no literal `BST`/`GMT`.
- Broadcast information is **per country**, sourced from data — never prose that assumes
  one market.
- Use ISO 3166-1 alpha-2 country codes. **`UK` is not one of them — the code is `GB`,**
  and Google explicitly ignores `UK` in hreflang annotations.
- Legal and regulatory copy must not assume a single jurisdiction.

## 4. No trace of the previous IPTV project.

This codebase was extracted from an IPTV reselling site. Nothing from that project may
appear here — in content, metadata, structured data, images, documentation or archives.

- No channel counts, no subscription prices, no free-trial offers, no device-sideloading
  instructions, no links to any store.
- **This site links to no store and has no commercial funnel.** It is an information
  source, funded and positioned independently.
- `scripts/generate-posts.js` enforces part of this at build time and will fail the build
  on a violation. Do not weaken or bypass that guard.
- **Text search is not sufficient to audit this.** The worst offender found to date was
  rendered text inside a PNG (`og-default.png`, "15,000+ Channels · 4K · Free Trial")
  that survived every text-based audit. Check images, generated assets and binaries.

## 4a. This site sells nothing. No prices, no value arguments, ever.

The original project was an IPTV reseller. Its links and CTAs were removed long ago —
**its editorial strategy was not**, and that survived much longer because it does not look
like a remnant. It looks like helpful content.

The shape to recognise:

1.  Establish price pain — *"£82.99 a month"*, *"£843.88 per year"*, *"raising prices
    again"*
2.  Amplify the frustration — *"The Cost Problem"*, *"Hidden Costs"*, *"The Big Missing
    Piece"*
3.  Offer the way out — *"How to Cut the Bill"*, *"The Contract-Free Route"*,
    *"Alternatives"*, *"the cheapest way to..."*

That is a sales funnel for a cheap streaming alternative. With the shop gone it argues for
nothing at all, on a site that sells nothing and takes no commission from anyone it lists.

**Standing rules:**

*   **No prices anywhere.** Not in blog posts, not in comparison tables, not in schema.
    Name the service that carries something; never what it costs. Prices go stale
    silently, vary by bundle and region, and quoting one is inherently a value argument.
*   **No cost comparisons, "cheapest way", "best value", "worth it" or "alternatives to"
    framing.** The question is *where is it shown*, never *what should you buy*.
*   **Free-to-air versus subscription is allowed and useful** — it answers "can I watch
    this without paying". A figure is not needed to say it.
*   **No commission, affiliate links or paid placement**, and listings are never ordered
    by payment. State this plainly where it is relevant rather than leaving it implied.

Applied 2026-08-20: two blog posts deleted outright, two rewritten, and a cost-comparison
table removed from `/watch/europa-league`. See `DECISIONS.md`.

---

## 5. Theme changes must reach every page.

If you change the visual theme, colours or typography, you change it **everywhere**.

- Consult `app/sitemap.ts` and the full route inventory. No page is left on the old look.
- Be aware the theme is currently **not centralised**: roughly 604 hardcoded hex values
  and 953 default Tailwind greys against ~188 semantic tokens, spread over 64 files
  including 20 of 35 page routes. Editing `globals.css` alone repaints about a tenth of
  the site.
- The prerequisite is **normalise, then tokenise** — there are 12 hand-typed variants of
  one intended surface colour. Collapse them before applying tokens.

## 5a. No emoji. Anywhere in the product.

Not in UI copy, headings, buttons, code comments, console output, commit messages or
blog content. This site presents itself as a reference people trust for accuracy;
emoji read as informal and undercut that.

There is also a practical reason. Emoji are **font-dependent glyphs**, not images:
they render differently on every platform, cannot inherit theme colour, and carry no
reliable accessible name. An icon is a better icon than an emoji is.

- Where an emoji was doing an icon's job, replace it with a **lucide-react** SVG and
  mark it `aria-hidden="true"` when the adjacent text already says the same thing.
- Where it was pure decoration — a heading ornament, a `console.log` prefix — delete
  it. If a glyph carried the actual signal, as a tick-versus-cross does in a
  validation report, replace it with a **word** (`PASS` / `FAIL`), never nothing.
- **Typography is not emoji.** Arrows, en and em dashes, curly quotes, bullets and
  the multiplication sign stay.
- **Platform key symbols are not decoration either.** The Command symbol in a
  keyboard hint is correct on macOS and wrong everywhere else — make it
  platform-aware rather than deleting it. See `components/search/command-palette.tsx`.

When auditing, use a **wide** codepoint range. The first sweep of this repo missed a
clock glyph because it omitted the Miscellaneous Technical block (U+2300–U+23FF), and
that one line also happened to be printing a false timezone.

## 5b. Do not mix this project with the previous IPTV business in third-party tools.

The owner's accounts on external platforms contain projects for **both** properties. The
Ahrefs account is a known case: it carries a project for the previous IPTV business
alongside anything created for this site.

- Before pulling data from any connected analytics, SEO or search tool, **confirm which
  project or property it belongs to.** A domain-level metric from the wrong project is
  worse than no metric, because it looks authoritative.
- **Create a new project for this site** rather than reusing or renaming the old one.
- The same caution applies to Search Console properties, analytics accounts and any other
  tool where both businesses may appear.

Where credentials or plan limits block verification of which project is which, say so and
stop rather than guessing.

## 5c. Every page and component follows the declared design system.

The design law lives in [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md). It is not advisory.

- **No page or component is left on an old pattern.** When a rule changes, it is applied
  across the whole project in one pass, and the rollout is proved by re-running the search
  and showing a count of zero. Log it in [AUDIT-REGISTER.md](./AUDIT-REGISTER.md).
- **Use the shadcn skill** at `.agents/skills/shadcn` for UI work. The project already has
  shadcn configured with 60 components in `components/ui/` — compose those before writing
  anything bespoke.
- **The owner has authorised far-reaching design proposals.** Suggest the right design even
  when it departs sharply from what exists. Say so plainly, with the reasoning.
- **Audit before redesign.** Every route is checked for working features and for pattern
  conformance before its appearance is changed. Follow the six-step method in the register;
  step 4 (render visually) is mandatory and has been skipped before with real consequences.
- **Check where every clickable thing actually goes**, not where it is meant to go, and
  cross-check against `app/sitemap.ts`.

## 5d. Content serves the product's one question.

The product answers: **"where can I watch this, from where I am?"** — for sport, film and
television alike.

- Every page, heading, and paragraph is judged against that sentence.
- Copy is written for a viewer, not an engineer. "Real-Time Telemetry" is not a phrase a
  sports fan has ever used.
- Prefer a concrete checkable number over an adjective. "139 countries" beats "global
  coverage".
- Demonstrate rather than assert. Show a real availability answer instead of claiming
  accuracy.
- **Persuasion techniques must be honest ones** — curiosity, self-reference, specificity,
  demonstration. Never fake scarcity, fake urgency, invented counts, or timers on things
  that are not timed. Those were the previous business's tools and they are incompatible
  with a reference brand.

## 5e. The Sightline handoff is binding. Read it before any UI task.

`design/sightline/HANDOFF.md` is the design specification, vendored into this repo so it
travels with the code. Colours, type, spacing, radii, motion timings **and copy** are
final — the wording is part of the product's position, not placeholder text.

- The HTML files are **references, not code to copy.** Rebuild every screen with this
  project's own stack: Next.js App Router, shadcn/ui, lucide, framer-motion, Tailwind
  tokens.
- `Sightline.dc.html` sections: `1e` desktop home, `1f` mobile home, `1g` film
  availability. **`1b` is the locked art direction. Ignore `1a`, `1c`, `1d`.**
- **Never port** `browser-window.jsx` or `ios-frame.jsx` — mockup frames only. They are
  deliberately absent from this repo.
- **The seven design opinions are load-bearing.** Each rejected an obvious alternative on
  purpose. Do not "improve" the design by filling empty states with plausible data, adding
  popularity ranking, or adding a green verified tick.
- **Colour law:** amber means live/sport, blue means film and TV, nothing else is
  coloured. "Verified" gets no colour — a mono date only. Never encode state by colour
  alone.
- **Everything designed for desktop ships on mobile too**, following mobile practice:
  44px minimum tap targets, 18px gutters, no hover-only affordances.

## 5f. Escalate every conflict. Do not silently pick a side.

When two sources of truth disagree — at **any** level: design versus data, design versus
these instructions, spec versus technical constraint, one instruction versus another —
**stop and put the choice to the owner.** State both sides, the consequence of each, and a
recommendation. Never resolve it quietly.

The one exception, because it is already decided: **never fabricate data to satisfy a
design.** If a design calls for a value the data cannot supply, that is a conflict to
raise, never a blank to fill. Rule 1 outranks the handoff.

Log every conflict and its resolution in `DECISIONS.md`.

## 5g. Content follows what is actually happening, and targets answer engines.

The site must keep publishing against real, current events — new fixtures, fight cards,
race weekends, film and series releases — so that both search engines and AI assistants
find a current answer here.

- **Dynamic before static.** Components and page copy should reflect live data rather than
  fixed text, so a page re-crawled next week is not identical to last week's.
- **The target is the question itself.** When anyone — a person or an AI assistant — asks
  *"where can I watch X"*, this site should be the source with the answer. Structure
  content so a machine can lift the answer cleanly: direct answer first, structured data,
  per-country specificity, an explicit date on every claim.
- **This is SEO, GEO and AEO at once.** Answer engines cite sources that are unambiguous,
  current and attributable. Every one of those properties is already a rule here.
- **It never licenses invention.** Publishing about a fixture requires the fixture to be
  real and the claim to be sourced. Trend-following expands *what* is covered, never
  loosens *how* it is verified.

## 5h. Finish means optimised. Every task, no exceptions.

**A feature is not done when it works. It is done when it works and the component it
lives in has been left faster and cleaner than it was found.**

After every task, before reporting it complete, go back over the whole component or
feature just touched — not only the lines changed:

*   **Caching.** Every external fetch goes through the TTL cache. Every route declares its
    caching intent explicitly rather than inheriting a default nobody chose. A route that
    is dynamic must be dynamic for a stated reason.
*   **Loading time.** Server-render what can be server-rendered. Do not ship a client
    bundle for something static. Stream long-running sections behind Suspense rather than
    blocking the page on the slowest query. Parallelise independent fetches; never `await`
    them in series.
*   **Images.** Correct dimensions, modern formats, `sizes` set, lazy below the fold,
    priority only for what is actually above it.
*   **Dead weight.** Remove what the change made redundant — unused props, orphaned
    helpers, duplicated state, components nothing imports any more.

**Quality and functionality are never the thing traded away for speed.** If the only way
to make something faster is to make it worse, it stays as it is and the reason is
recorded.

Optimisation is part of the task, not a follow-up ticket. A task reported complete with
"could be optimised later" is not complete.

---

## 5i. Every image an API returns must be used somewhere.

**If a response carries artwork and the page renders none, that is lost data.** The site is
a reference product, and a wall of text is the fastest way to lose a reader who came to
find one fact. Text serves models and standards; imagery is what keeps a person on the
page. Both are required, and neither is decoration.

The artwork is already paid for — it arrives inside responses the app fetches anyway, so
rendering it costs one more optimised request, not one more API call.

**What the providers actually return** (audited 2026-08-20):

| Entity | Fields |
|---|---|
| Event | `strThumb`, `strPoster`, `strBanner`, `strHomeTeamBadge`, `strAwayTeamBadge`, `strLeagueBadge` |
| Team | `strBadge`, `strLogo`, `strBanner`, `strFanart1`–`strFanart4` |
| League | `strBadge`, `strLogo`, `strPoster`, `strBanner`, `strTrophy`, `strFanart1`–`4` |
| Player | `strThumb`, `strCutout` |
| TMDB | `poster_path`, `backdrop_path`, provider logos |
| ESPN | league logo, fighter country flags |

**Rules:**

*   **Declare the field before blaming the API.** Several of these rendered nothing purely
    because the TypeScript interface never listed them — the data was in the response the
    whole time.
*   **Everything goes through `next/image`.** A raw `<img>` skips webp/avif, srcset and the
    30-day optimised cache. Three separate places were doing this.
*   **Know which URL variant you want.** TheSportsDB serves `/tiny`, `/small`, `/medium`,
    `/large` suffixes on *badges*. Never apply them to event artwork.
*   **Artwork is a backdrop, not a picture**, unless the design says otherwise. Broadcast
    stills are busy and high-contrast; behind text they need low opacity *and* a scrim
    across the whole element, not a one-sided fade.
*   **Always design the absent case.** Provider coverage is uneven — a lettermark or a
    designed blank, never a gap or a broken image, or the list reads as a failed load.

---

## 6. Suggest improvements — with evidence.

The owner wants proactive proposals, not silent execution.

- Raise ideas as they occur: content, features, tooling, strategy, UX.
- Every proposal comes with **backup evidence** for why it will work — a source, a
  measurement, a documented standard. "Best practice" with no citation is not evidence.
- Ask before building anything substantial.
- Say plainly when something is not working, including your own earlier work.

## 7. Research before anything that affects ranking.

Any change that touches SEO, structured data, performance or crawlability requires
checking current guidance first — not recalling it.

- Prefer primary sources. Record the URL alongside the recommendation.
- Standards move; a practice that was right last year may be wrong now.

## 8. Record every change.

`memory-bank/DECISIONS.md` is the append-only decision log. Every meaningful decision goes
in it: what was decided, what was considered, the evidence, and the consequence.

The memory bank must always be enough for a fresh agent to understand what this project
is, where it stands, what remains, and which problems have already been solved.

**Do not mark work complete without recording the command that proves it.** A previous
remediation pass on this codebase recorded nine items done while the code was unchanged.

---

## Current position

- **Repo:** `shad-yy/version-3-clean` (private) · branch `main`
- **Domain:** not yet assigned. Fully parameterised — see `PROJECT.md`.
- **Positioning:** a global information source answering *"where and how can I watch
  this?"* across sport, film, television and entertainment.
- **Sports stays** as one vertical; film/TV is being added alongside it.
