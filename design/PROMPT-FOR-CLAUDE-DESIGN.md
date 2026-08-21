# Prompt for Claude Design — Sightline UI/UX pass

Copy everything below the line into Claude Design.

---

## What I need

Two things for an existing, working website:

1. **A new homepage layout.** The current one is seven identical full-width text bands.
   I want it redesigned properly — new structure, new hierarchy, new rhythm.
2. **An interaction and density layer for the rest of the site**: card layouts that use
   their space, hover and press states, motion, loading states, and empty states that do
   not look like failures.

The palette and typography are decided and I am keeping them. **Layout, structure and
interaction are open.**

Give me **concrete screen designs**, not principles. I will implement them in code.

---

## The product

**Sightline** — a global reference that answers one question: *"Where can I watch this,
from where I am?"* for sport, film and television. It names the service carrying a match,
film or series in the reader's country, with the date that answer was last verified by
hand.

It sells nothing. No subscriptions, no affiliate links, no commission from anyone listed.
Listings are never ordered by payment. That non-commercial stance is the product's whole
credibility and the design must not undercut it with sales-page patterns.

Audience arrives from search, usually on mobile, usually wanting one fact fast.

---

## The stack I am implementing into

- Next.js 14 App Router, React 18, TypeScript
- Tailwind, with the design tokens below already wired
- `lucide-react` icons
- `next/image`
- Dark theme only — there is no light mode and none is wanted

Design against these tokens. Do not introduce new colours.

```
--sl-ground        #0b0d11    page background
--sl-panel         #0f1216    panels
--sl-surface       #14171d    cards, inputs
--sl-raise         #1b1f27    selected / hover fill
--sl-line          #262b35    borders
--sl-hair          #1d222b    hairline dividers
--sl-chip-border   #323845
--sl-outline       #5c657a

--sl-text          #e8e5de    primary text
--sl-mid           #b6bac4    secondary
--sl-mute          #8c92a0    tertiary
--sl-dim           #4a5262    quaternary

--sl-amber         #f0a63c    SPORT accent, primary action
--sl-amber-hover   #ffbc5c
--sl-blue          #93a9ff    FILM & TV accent
```

Type: **Archivo** for UI, **IBM Plex Mono** for dates, labels and metadata.
Motion easing already in use: `cubic-bezier(.2,.7,.3,1)`; hover `.16s`; press `.1s`.

---

## Rules that cannot be broken

These are not preferences. Breaking them breaks the product.

1. **No type badges.** Content type is carried by an accent colour and a lead column,
   never a pill labelled "FILM".
2. **"Verified" is never a green tick or a coloured badge.** It is a mono date. Always.
3. **Empty states use the same panel shape as results.** They are answers, not errors.
   "We have not checked Germany" is a legitimate answer and must look like one.
4. **Availability is shown by shape as well as colour** (solid vs outlined), so it survives
   colour-blindness and greyscale.
5. **Discovery is ordered by freshness of verification, never popularity** — except one
   rail that is explicitly labelled "Trending on TMDB · ordered by popularity". If you
   design anything popularity-ordered, it must say so on its face.
6. **The honest gap is stated in copy on every screen.** Do not delete those sentences to
   tidy a layout.
7. **Never invent data.** If a field might be absent, design the absent case. Provider
   coverage is uneven and this happens constantly.
8. **Respect `prefers-reduced-motion`.** Every reveal must resolve to its final state.

---

## What is wrong right now — be specific about fixing these

I have measured these. They are not vibes.

**Cards waste most of their space.** The film/TV browse grid renders a 64px-wide poster
inside a ~440px card, with the remaining ~370px empty except for a title and a year. It
reads as a spreadsheet with a stamp glued on. Poster-forward cards would use the same
space to show ten times more.

**Nothing responds to the pointer.** There are hover colour changes on links and almost
nothing else. No lift, no scale, no reveal, no state change on cards, rows or panels.

**Pages are text with occasional pictures.** Long runs of rows at uniform density, no
rhythm, no visual hierarchy beyond font size, nothing that rewards scrolling.

**No loading identity.** Sections appear abruptly. There is a shimmer skeleton but it is
used in two places out of thirty.

**Empty states look like bugs.** Several sections legitimately have nothing to show —
no fixtures today, a country we have not verified, a UFC card not yet published. These
currently render as blank space or a single grey sentence.

**Mobile is an afterthought.** The desktop layout narrows. Nothing is designed *for* touch.

---

## Screens to design

In priority order. For each: desktop and mobile (390px), plus the states listed.

### 1. The homepage — full redesign, new layout

**This is the main deliverable. Treat the current structure as a starting point to argue
with, not a constraint to preserve.**

It currently stacks seven full-width bands, every one the same width, the same padding and
roughly the same visual weight. There is no rhythm, nothing leads, and the first two bands
are pure text — the first image on the page sits **3,301 pixels down**. A visitor scrolls
past a screen and a half of prose before seeing anything.

What the page has to do, in order of importance:

1. Let someone **search for one thing** and leave. That is the whole product.
2. Show that the answers are **checked by a person**, with dates — the one thing no
   competitor offers.
3. Show it covers **both sport and film/TV**, because visitors assume one or the other.
4. Give someone with no specific query **something to click**.

The sections that exist today, with what data each actually has:

| Section | Real content | Problem |
|---|---|---|
| Hero | Headline, subhead, scope chips (Everything / Sport / Film & TV), search field, five example chips, dimmed poster wall behind | Static; the only thing above the fold is a search box |
| Verified rights ledger | 4 country cells — country name, broadcasters, "VERIFIED 31 JUL 2026" | Pure text, low visual weight for the site's most important claim |
| Live now | Fixture rows: time, two crests, teams, competition, broadcaster | **Renders nothing most days** — there are often no fixtures |
| Trending film & TV | Horizontal poster rail, ~14 titles, name/type/year | Works. The one section that looks alive |
| Scheduled fight nights | UFC cards: date, event name, countdown, crest | Text cards; no artwork exists for future events |
| What changed / what we don't know | Two columns of plain sentences | Reads as footnotes, not content |
| "Just checked" dock | Slides up from the bottom; things re-verified in 24h | **Renders nothing most days** — verification cadence is low |

**Design around the empty cases, not the full ones.** Two of seven sections are usually
empty and a third often is. A homepage that only looks right on a busy Saturday is the
wrong homepage. I would rather have four sections that always have something than seven
that half-work.

Feel free to merge, cut, reorder or invent sections. If the ledger and the changelog want
to be one thing, make them one thing. If the hero should carry live content, say so.

**Constraints for this screen specifically:**
- The search field must stay above the fold on mobile.
- The verification dates must be visible without scrolling far — they are the differentiator.
- Sport and film/TV must both be evident within the first screen or two.
- No auto-advancing carousel.
- It must not become a marketing page. No hero video, no testimonials, no big centred CTA.

### 2. Film & TV browse grid — the worst offender
A grid of ~18 titles. Each has: poster, name, type (film/series), year, and — where known
— the services carrying it in the reader's country.
**States:** default, hover, focus, no-poster (common), loading, empty.

### 3. Fixture list
Rows of matches: kick-off time in the reader's timezone, two team crests, both team names,
competition, venue, and the broadcaster for their country *or* an honest "not verified in
your country".
**States:** upcoming, live, finished, no-broadcaster-known, loading, no fixtures today.
Each fixture also has a wide event still available as an optional backdrop.

### 4. Title detail page
One film or series: poster, name, year, runtime, overview, and a **per-country
availability matrix** across 139 countries — free / ads / subscription / rent / buy, shown
by shape as well as colour. This is the most data-dense screen in the product.

### 5. Search-as-you-type panel
Results appear under the field as you type, mixing sport and film/TV, each with artwork.
**States:** idle, typing, results, no match, error.

---

## What I specifically want from you

- **Card and row layouts that earn their footprint** — especially anything with artwork.
- **A hover and press vocabulary** applied consistently: what lifts, what fills, what
  reveals, at what timing. Name it so I can implement it as one system.
- **Loading states per component type**, matching final dimensions exactly so nothing
  reflows.
- **Empty states that look designed** — same panel geometry as a populated result.
- **Motion with a purpose**: entrances, expansions, transitions between states. Tell me
  what moves, how far, how fast, and what must not move.
- **Mobile designed as its own thing**, with real touch targets, not a narrowed desktop.

## What I do not want

- A light theme, or new colours outside the tokens above.
- Marketing-page patterns: hero videos, testimonials, big centred CTAs, pricing tables.
  It sells nothing.
- Decoration that implies data we do not have — fake ratings, invented percentages,
  progress bars over unknown values, placeholder avatars for real people.
- Carousels that auto-advance.
- Anything that makes "verified" look like a badge or a trust seal.

## Deliverable

Screen designs at desktop and mobile widths for each screen above, every state listed, with
the interaction and motion spec written out — durations, easing, distances, stagger — so I
can implement it directly without guessing.
