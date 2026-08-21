# Handoff: Sightline — homepage, search, match page, and 139-country availability

## Overview
Sightline is a "where can I watch this" reference for sport, film and television: one lookup that answers which service carries a thing **in your country**, with the date the answer was last verified by hand. This bundle covers four screens (desktop homepage, mobile homepage, search results, match page, film availability across 139 countries) plus the motion and interaction system that runs across them.

The product's whole differentiator is **honesty about coverage**: 2 competitions across 4 countries are hand-verified for broadcast rights; everything else shows nothing rather than a guess. Every design decision below serves that. Do not "improve" the design by filling empty states with plausible data, adding popularity rankings, or adding a green verified tick — those were rejected deliberately (see Design opinions).

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes of look and behaviour, not production code to copy. `Sightline.dc.html` uses an in-house HTML template runtime and is not a shippable component.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native, etc.) using its established patterns, component library, router and data layer. If the project has no frontend yet, pick the most appropriate framework and implement there. `world-map.html` is the exception: it is plain HTML + d3 and its data/rendering approach should be carried over closely (see Assets).

## Fidelity
**High fidelity.** Colours, typography, spacing, radii, animation durations and easings are final and are all listed below. Recreate pixel-accurately using the codebase's own primitives. Copy is also final — use the exact strings; the wording is part of the product's position.

---

## Design Tokens

### Colour (dark theme — the only theme)
| Token | Hex | Use |
|---|---|---|
| ground | `#0b0d11` | page background |
| surface | `#14171d` | inputs, cards on ground |
| panel | `#0f1216` | panels, sticky bars, dock |
| raise | `#1b1f27` | selected chip, open row background |
| line | `#262b35` | container borders |
| hair | `#1d222b` | internal dividers, row borders |
| text | `#e8e5de` | primary text |
| mid | `#b6bac4` | secondary text |
| mute | `#8c92a0` | tertiary text, mono labels |
| dim | `#4a5262` | separators ("·", "/"), inert icons |
| outline | `#5c657a` | empty-slot outlines, hover borders |
| outlineText | `#a2a9b8` | text inside empty slots |
| amber | `#f0a63c` | **live / sport only** |
| amberHover | `#ffbc5c` | primary button hover |
| blue | `#93a9ff` | **film & TV only** |
| blueMid | `#5b6ea8` | map/ribbon: 3 offer kinds |
| blueLow | `#39456b` | map/ribbon: 1–2 offer kinds |
| chipBorder | `#323845` | input and chip borders |

Colour rules (enforce in review): amber means live/sport, blue means film/TV, nothing else is coloured. "Verified" gets **no** colour — only a mono date. Never encode state by colour alone: empty availability slots are *outlined*, filled slots are *solid*.

### Typography
- **Archivo** 400 / 500 / 600 — all interface and editorial text.
- **IBM Plex Mono** 400 / 500 / 600 — timestamps, counts, labels, eyebrows, data.
- Scale in use (size/line-height/letter-spacing):
  - Desktop h1 hero: 62px / 1.02 / -0.038em, 600
  - Mobile h1 hero: 35px / 1.06 / -0.034em, 600
  - Match page h1: 42px / 1.05 / -0.032em, 600
  - Film title h1: 44px / 1.03 / -0.035em, 600
  - Section heading: 20px / 1 / -0.022em, 600
  - Panel heading: 17px / 1, 600
  - Hero body: 17px / 1.55, 400
  - Body: 14px / 1.6 and 13px / 1.55, 400
  - Row title: 14–17px / 1.2, 500
  - Mono eyebrow: 10–11px / 1, 500, letter-spacing .12–.18em, uppercase
  - Mono data: 10.5–12px / 1, 400, letter-spacing .06–.08em
- Nothing below 10px. Minimum tap target on mobile 44px.
- `text-wrap: pretty` on all multi-line prose.

### Spacing, radius, shadow
- Desktop page gutter 80px; availability page gutter 40px; mobile gutter 18px.
- Section rhythm: 66px top hero padding, 40–46px between sections, 14–22px inside panels.
- Radius: 5px small chips, 6–7px inputs/buttons/cards, 8px panels, 10px dock, 20px pill chips, 3px matrix slots.
- Only one shadow, on the discovery dock: `0 20px 44px rgba(0,0,0,.5)`.
- Sticky bars: `background: rgba(11,13,17,.94)` + `backdrop-filter: blur(9px)`.

### Motion
Intensity: **noticeable but calm**. Standard easing `cubic-bezier(.2,.7,.3,1)`; hover/colour transitions `.16s ease`; press `.1s ease`.
| Name | Definition | Use |
|---|---|---|
| fade-rise | opacity 0→1, translateY 5px→0, .45–.55s | entrances, panel swaps |
| expand | opacity 0→1, translateY -5px→0, .22–.26s | row/dock expansion |
| slot | opacity 0→1, scale .74→1, .38s | availability matrix slots |
| shimmer | background-position -340px→340px, 1.15s linear infinite | skeleton loading |
| pulse | opacity 1→.35→1, 2s ease-in-out infinite | LIVE dot, "just checked" dot |
Stagger: 70–75ms per item for content reveals, 45ms per matrix slot, 70ms per hero element.
**Respect `prefers-reduced-motion: reduce`** — all reveal animations must resolve to their final state with no animation. Any element hidden at opacity 0 pending a reveal must also have a JS-independent fallback that shows it (the prototype uses a 1.4s timer) so a failed observer can never hide content.

---

## Screens / Views

### 1. Homepage — desktop (1280×848 in-window)
Purpose: ask one question and get to an answer; establish that coverage is small and honest.

Layout, top to bottom, inside a 62px site header (logo + nav "Live scores / Fixtures / Film & TV / Guides" + country selector):
1. **Hero**, padding 66px 80px 40px: mono eyebrow `SPORT · FILM · TELEVISION — 139 COUNTRIES`; h1 "Where can I watch this in **United Kingdom** ?" where the country is an inline amber-underlined (3px `#f0a63c`) hoverable control with a chevron; 17px subcopy, max-width 620px.
2. **Search block**, max-width 820px: scope chips row (Everything / Sport / Film & TV; 8px 15px, radius 5px; selected = `raise` bg + `line` border + `text`; unselected = transparent + `mute`), then a 62px search field (`surface` bg, 1px `chipBorder`, radius 7px) with a 19px magnifier and a 62px amber Search button (radius 7px, `ground` label, 600 15px), then a "TRY" row of 5 example pills (radius 20px, 1px `line`).
3. **Verified-rights ledger** panel: header row `HAND-VERIFIED BROADCAST RIGHTS` + `2 competitions · 4 countries · last checked 14 AUG 2026`; a 4-column grid of countries (United Kingdom / United States / Australia / France), each with broadcasters and `VERIFIED <date>` in mono; footer row on `ground`: "Everywhere else — Germany, Spain, Japan and 130 more — is not verified. We show nothing rather than guess." + "How verification works".
4. **Live now** block: pulsing amber dot + `LIVE NOW` + "All live scores"; three fixture rows (minute in amber mono / teams / score in mono / channel right-aligned, 210px). The third row reads "Not verified in United Kingdom" — keep it.
5. **Two-column footer**: `WHAT WE CHANGED THIS WEEK` (three dated lines, 74px mono date column) and `WHAT WE DO NOT KNOW` + "Read the explainers".
6. **"Just checked" discovery dock** — see Interactions.

### 2. Homepage — mobile (390×844, iOS)
Same content, restacked: 54px top clearance for the status bar (do not reduce), 18px gutters, 35px h1, 52px search field, scope control as a 3-up segmented row (equal flex, 11px vertical padding), a compressed 2-row verified-rights panel, LIVE NOW with two fixture rows, and a **"JUST CHECKED" snap rail** of 214px cards (see Interactions). No dock overlay on mobile.

### 3. Search results
Purpose: disambiguate a query without type badges.
- Same search field at 50px with scope chips beside it; result count + `for "<query>" in United Kingdom`.
- Rows: 2px left accent border (amber = sport, blue = film/TV, mute = reference page); a 104px lead column (kick-off time in amber mono for fixtures, year in blue mono for film/TV, nothing for reference pages) with an uppercase mono sub-label; title 17px/500 + 13px meta; a 280px right column with service + mono provenance note; chevron.
- The type of a result is communicated by the lead column and accent, **not** by a badge.
- Loading: see Interactions.

### 4. Match page
- Back link, mono `PREMIER LEAGUE · MATCHDAY 2`, h1 42px, meta row (date · mono kick-off · venue), then two secondary buttons: **Copy link** (with a state dot) and **Add to calendar**.
- "Where it is shown" + a row of country pill chips (United Kingdom, United States, Australia, France, Germany, Spain).
- **Verified state** (UK/US/AU/FR): panel listing broadcasters as 26px logo-slot cards, footer `CHECKED BY HAND · <date>` + "These are channel listings, not links to video. Sightline plays nothing."
- **Unverified state** (Germany, Spain): same panel shape, info icon, "We have not verified a broadcaster in <country>." + two paragraphs explaining that coverage is hand-built and that the match is still on; primary amber CTA "Tell us who carries it in <country>" + secondary "What 'verified' means". The empty state must use the **same panel geometry** as the verified state — it is an answer, not an error.

### 5. Film availability — 139 countries
Purpose: one film, every country, without a 139-row wall.
- 62px site header, then the **coverage ribbon** (sticky, see Interactions).
- Film header: 136×202 poster slot, mono `FILM`, h1 44px, meta row, description, attribution row (`AVAILABILITY DATA BY` / JUSTWATCH / `VIA TMDB`).
- **Your country** block (United Kingdom, `YOUR COUNTRY · BY IP`, "Change"): five lanes — Free, Free with ads, Subscription, Rent, Buy — each either service chips with prices or an explicit "No free offer recorded" line. Footer: "Every name above links to that service's own page for this film. Sightline transmits no video and sells no subscription."
- **World map** (462px tall, see Assets).
- **Every other country**, grouped into four collapsible continent groups (Europe, Americas, Asia-Pacific, Middle East & Africa). Group header: name 15px/600, mono country count, right-aligned mono summary "<n> subscription · <n> free or ad-supported · <n> nothing recorded", chevron rotating 180° when open. Europe open by default.
- Country row (one line, 12px 20px): name 14px/500 → five 20px matrix slots (solid `blue` with letter F/A/S/R/B when held, outlined `#5c657a` with an em dash when not) → right-aligned service count or "No offers recorded" → chevron. Expanding a row reveals lane-by-lane service chips inline; a country with nothing recorded shows the honest-gap paragraph instead.
- Filter input (250px, 42px) filters by name and auto-opens every continent with a match.
- Legend above the list explains the five letters and "outlined: none held".

---

## Interactions & Behaviour

### Navigation
`home → results → match → (switch country) → unverified state`. Search submit, an example pill, or a discovery card all go to results. A fixture row goes to the match page. Country pills on the match page swap the rights panel in place. Availability rows expand in place — they never navigate, so the user never loses their scroll position.

### Homepage
- Hero entrance on mount: eyebrow (0ms), h1 (70ms), subcopy (140ms), search block (210ms) — fade-rise .55s.
- Search field focus: border → amber, `box-shadow: 0 0 0 3px rgba(240,166,60,.13)`, caret amber.
- Search button: hover `#ffbc5c`, active scale .98. Chips: hover border `#5c657a` + text `#e8e5de`; example pills also translateY(-1px); active scale .97.
- Ledger: the four country cells stagger in (fade-rise, 75ms apart) when the panel enters the viewport, once; each cell highlights to `#14171d` on hover. Changelog lines stagger in the same way. Live rows highlight on hover.
- **"Just checked" dock**: a sticky bottom overlay inside the homepage scroll container, translated fully off-screen (`translateY(128%)`) until `scrollTop > 200`, then slid in over .44s. Collapsed height ~52px: pulsing amber dot, "Just checked", "<n> things verified for United Kingdom in the last 24 hours", right-side mono action `SEE THEM`/`HIDE`, chevron, and a 26px dismiss button. Clicking the bar expands it (expand .26s) into a horizontally scrollable rail of 266px cards, each: 2px left accent (amber fixture / blue film-TV), mono lead + uppercase sub, 15px title, "where" line, and a mono `CHECKED <date, time>` footer above a hairline. Cards stagger in; hover lifts 2px; arrow buttons scroll the rail ±290px smoothly; a card click runs a search for that title. Dismiss hides it for the session and it must not return. It must never block scrolling (`pointer-events: none` on the sticky wrapper, `auto` on the panel) and never cover content permanently.
- Rail content rule: items are things **re-verified in the last 24 hours where an offer exists in the user's country** — not popularity, not sponsorship. The footnote saying so is part of the design.

### Results loading
On entering results: 750ms skeleton of five rows using shimmer bars at staggered delays (0/90/180/270/360ms), plus a pulsing amber dot and `CHECKING RIGHTS FOR UNITED KINGDOM…`. Then the real list fades in. Keep the skeleton's row geometry identical to a real row.

### Match page
- Switching country crossfades the rights panel (fade-rise .34s) — implement by re-keying the panel on country change.
- Copy link: label → "Link copied", dot → amber, reverts after 1800ms.

### Availability page
- **Coverage ribbon** (the signature element). Sticky under the header. One 5px tick per country, grouped by continent with 9px gaps, plus a trailing muted group standing for the countries not yet checked. Tick height encodes how many offer kinds exist (7px + 3.4px each); fill is `blue` (4–5), `blueMid` (3), `blueLow` (1–2), or transparent with a `#5c657a` outline (nothing recorded). Behaviour:
  - **Scroll**: an amber 1px playhead tracks scroll progress across the ribbon; the continent currently in view goes to opacity 1 while others drop to .34; the header label shows that continent's name (or `THE FILM` above the list).
  - **Hover a country row** → its tick scales 1.7× vertically with a 1px amber ring and the header names it; hovering a tick does the same in reverse.
  - **Click a tick** → open that continent, open that country, smooth-scroll the row to 148px below the sticky bar.
  - Header also states `139 CHECKED · 56 NOT CHECKED` permanently.
- Continent headers and country rows highlight on hover (`#14171d`); expansion animates with expand .22s; chevrons rotate.
- Matrix slots stagger in (slot, 45ms apart) per row as the row scrolls into view, once.
- Map → list: clicking a country in the map opens its continent, opens its row.

### Responsive
Only two breakpoints are designed: desktop (≥1280 content width) and mobile (390). The availability page and results are desktop-only in this bundle; if mobile is needed, ask before inventing it.

---

## State Management
Prototype state, ready to map onto your store/router:
- `route`: 'home' | 'results' | 'match' (real app: routes/URLs).
- `q`, `scope` ('Everything' | 'Sport' | 'Film & TV'), `qFocus` — search.
- `loading` — results skeleton (real app: query pending state; keep a minimum visible duration so it doesn't flash).
- `country` (viewer country, by IP), `mc` (country selected on the match page), `copied`.
- `filter` (country filter), `openRegions` (map of continent → open; Europe true initially), `open` (currently expanded country; single-open accordion).
- `dockUp`, `discOpen`, `discDismissed` — discovery dock (persist `discDismissed` for the session).
- Scroll-derived values (ribbon playhead, continent in view, dock visibility) are read from a scroll listener on the page's scroll container and written directly to the DOM in the prototype; in production prefer `IntersectionObserver` for "continent in view" and a throttled/rAF scroll handler for the playhead.

### Data the UI needs
- **Availability per title per country**: five booleans (free, ads, subscription, rent, buy) + the service names (and prices where known) per lane, + `checkedAt`. The UI must be able to distinguish "no offer" from "not checked" — they render differently and that distinction is the product.
- **Broadcast rights per fixture per country**: broadcaster list + `verifiedAt`, or explicitly null → the unverified panel.
- **Recently verified feed** for the dock: title, kind (sport | film | tv), lead (kick-off time or year), sub-label, where-to-watch line, `checkedAt`, filtered to the viewer's country.

## Design opinions to preserve
1. No type badges — the lead column and accent colour carry type.
2. Empty states use the same panel shape as results; they are answers, not errors.
3. "Verified" is never a green tick or coloured badge — a mono date only.
4. Availability uses shape as well as colour (solid vs outlined slots) so it survives colour-blindness and greyscale.
5. Rows expand rather than navigate on the availability page.
6. Discovery is ordered by freshness of verification, never popularity or payment.
7. The honest gap is stated in copy on every screen; do not remove those sentences to tidy the layout.

## Accessibility
- Contrast was audited: all greys sit on the token they were checked against (≥4.5:1 for body text, ≥3:1 for large text and non-text indicators). If you re-theme, re-audit.
- Everything clickable in the prototype is a `div` — in production use `button`/`a`, give the accordion rows `aria-expanded`, the continent groups `aria-controls`, the ribbon ticks accessible names ("Germany — 4 of 5 offer kinds"), and the dock `aria-live="polite"` for its count. Keyboard: chips and ticks must be tabbable; the dock must be dismissible with Escape.
- Provide visible focus rings using the amber focus treatment already used by the search field.

## Assets
- Fonts: Archivo and IBM Plex Mono (Google Fonts). Also loaded in the prototype but only used in the art-direction exploration: Newsreader, Spectral.
- Icons: inline SVG, 1.9–2.4 stroke width, `stroke-linecap: round` — swap for the codebase's icon set at the same weights.
- **Map geometry**: Natural Earth via `world-atlas@2.0.2` `countries-110m.json`, rendered with d3-geo `geoNaturalEarth1` (see `world-map.html`). Public domain. Never hand-draw country shapes. The map keys availability by country name; in production key by ISO 3166-1 alpha-2/3 instead and map to the topology's ids.
- Poster and broadcaster logos are placeholder slots (136×202 poster, 26px logo squares) — real artwork comes from the metadata provider; respect provider attribution ("Availability data by JustWatch via TMDB").

## Files
- `Sightline.dc.html` — all screens and the interaction system. Sections are marked `1a`–`1g`: 1a–1c art-direction studies (**1b is the shipping direction** — the others are context only), 1d logo, 1e desktop homepage, 1f mobile homepage, 1g film availability. Results and match screens live inside 1e's browser frame and are reached by clicking through.
- `world-map.html` — standalone d3 world map with hover tooltip and click-to-select, posting `{type:'sightline-country', name}` to its parent.
- `browser-window.jsx`, `ios-frame.jsx` — presentation frames for the mockups only. **Do not port these.**

## What to ask before building
- Real data sources for availability and rights, and whether `checkedAt` is exposed per country (the design depends on it).
- Which countries are genuinely verified at launch — the "4 countries" figure is copy, not a constant to hardcode.
- Whether the availability page needs a mobile layout.
