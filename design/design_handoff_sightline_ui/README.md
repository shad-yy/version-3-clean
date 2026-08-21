# Handoff: Sightline — animated homepage, loading sequence, browse grid, fixture list, search, match page, 139-country availability

## Overview

Sightline answers one question: **"where can I watch this, in my country, and when did you last check?"** It covers sport (hand-verified broadcast rights, a small number of competitions and countries) and film/TV (139 countries of catalogue availability). It transmits no video and sells no subscription — every answer is a channel or service *listing* plus the date it was verified.

This bundle covers nine screens across two design passes:

- **Pass 3** — the animated homepage and the loading sequence. This is the newest work and the reason for the handoff: the homepage previously had no motion and no imagery.
- **Pass 2** — the five core screens (browse grid, fixture list, hero, search, match page, 139-country matrix) plus mobile, a component state board, and a motion spec table.

Everything is built on the project's existing binding spec, `SPEC-binding-source.md` (a copy of `design/sightline/HANDOFF.md` from the repo). **That file wins on any conflict with this one.** No new colours, fonts, or spacing values were invented.

---

## About the design files

The files in this bundle are **design references created in HTML** — a prototype demonstrating intended look and behaviour. They are **not production code to copy directly**.

The target codebase is a **Next.js App Router project with React, TypeScript and Tailwind** (`smart-live-tv/`), with existing Sightline components under `components/sightline/`. Your task is to **recreate these designs in that environment using its established patterns** — server components where the data allows, `"use client"` only where interaction demands it, Tailwind classes mapped to the existing token names, `next/image` for artwork, `lucide-react` for icons.

Do not port the prototype's inline styles. Do not add an animation library — every animation here is plain CSS keyframes and belongs in `app/globals.css` (or Tailwind's `theme.extend.keyframes`).

**Existing components you should extend rather than replace:** `page-shell.tsx`, `hero.tsx`, `hero-search.tsx`, `poster-thumb.tsx`, `live-now.tsx`, `team-badge.tsx`, `event-backdrop.tsx`, `availability-explorer.tsx`, `coverage-ribbon.tsx`, `logo.tsx`, `components/layout/header.tsx`, `header-nav.tsx`.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, motion timings and copy. Recreate pixel-perfectly using the codebase's existing tokens and components. Every hex value, duration and easing curve in this document is the intended production value.

Two caveats:

1. **Artwork is placeholders.** The prototype uses droppable `<image-slot>` elements where posters and stills go. In production these are TMDB / TheSportsDB images via `next/image` (see **Assets**).
2. **Data is representative, not real.** Fixtures, scores, countries and dates are plausible samples. Wire to the real APIs; keep the exact *copy* for all static and empty-state strings (see **Copy — use verbatim**).

---

## What to build, and what is an alternative

The prototype presents alternatives side by side. **Build only the recommended option in each pair.**

| Screen | Build this | Rejected alternative | Why |
|---|---|---|---|
| Homepage (animated) | **3a** | — | The deliverable |
| Loading | **3b** | — | The deliverable |
| Browse grid | **2b** poster card, 4 across | 2a poster wall, 6 across | 2a fits 12 titles but only as a one-line summary; 2b shows which services + the checked date without hovering |
| Fixture list | **2d** live rows carry the still | 2c compact 44px ledger | 2c is a better pure scanning tool; 2d makes "live" read as live and opens in place |
| Hero | **2e** quiet / type-forward | 2f live still behind the ask | 2f dates instantly if the feed stalls and reads as a sports app, not a film+TV reference. **Note:** 3a supersedes both — it is 2e's structure with 2f's imagery, resolved |
| Search | **2h** grouped dropdown | — | 2g is the full results page; build both, they are different surfaces |
| Match page | **2i** | — | Verified and unverified share one panel geometry |
| 139 countries | **2j** rows open in place | 2k tile grid | 2k puts a continent on one screen but shrinks country names to ISO codes and hides service names |
| Mobile | **2l** | — | Inline for lists, bottom sheet for the matrix |

**2m** (state board) and **2n** / **3c** (motion tables) are documentation, not screens. Use them as your acceptance checklist.

---

## Design tokens

Token names below match `SPEC-binding-source.md`. Use the codebase's existing CSS custom properties / Tailwind theme keys — do not hardcode hex.

### Colour (dark theme only)

| Token | Hex | Use |
|---|---|---|
| ground | `#0b0d11` | page background |
| panel | `#0f1216` | panels, sticky bars, dock |
| surface | `#14171d` | inputs, cards on ground, row hover |
| raise | `#1b1f27` | selected chip, open row background, skeleton base |
| line | `#262b35` | container borders |
| hair | `#1d222b` | internal dividers, row borders |
| chipBorder | `#323845` | input and chip borders |
| outline | `#5c657a` | empty-slot outlines, hover borders |
| outlineText | `#a2a9b8` | text inside empty slots |
| text | `#e8e5de` | primary text |
| mid | `#b6bac4` | secondary text |
| mute | `#8c92a0` | tertiary text, mono labels |
| dim | `#4a5262` | separators, inert icons, provenance dates |
| amber | `#f0a63c` | **live / sport only** |
| amberHover | `#ffbc5c` | primary button hover |
| blue | `#93a9ff` | **film & TV only** |
| blueMid | `#5b6ea8` | matrix/ribbon: 3 offer kinds |
| blueLow | `#39456b` | matrix/ribbon: 1–2 offer kinds |

**Colour rules — enforce in review.** Amber means live/sport. Blue means film/TV. Nothing else is coloured. "Verified" gets **no colour** — only a mono date. Never encode state by colour alone: empty availability slots are *outlined*, filled slots are *solid*, and every slot carries a letter.

Derived values used in the prototype (all from the above): amber focus ring `0 0 0 3px rgba(240,166,60,.13)`, amber keyboard focus `0 0 0 2px rgba(240,166,60,.55)`, sticky bar `rgba(11,13,17,.94)` + `backdrop-filter: blur(9px)`, dock shadow `0 20px 44px rgba(0,0,0,.5)`, poster hover shadow `0 14px 30px rgba(0,0,0,.5)`.

### Typography

**Archivo** 400/500/600 — all interface and editorial text. **IBM Plex Mono** 400/500/600 — timestamps, counts, labels, eyebrows, data. Both from Google Fonts.

| Role | Size / line-height / tracking | Weight |
|---|---|---|
| Desktop hero h1 | 60–62px / 1.02–1.03 / −0.038em | 600 |
| Mobile hero h1 | 35px / 1.06 / −0.034em | 600 |
| Match page h1 | 42px / 1.05 / −0.032em | 600 |
| Mobile title h1 | 28px / 1.06 / −0.03em | 600 |
| Section heading | 20px / 1 / −0.022em | 600 |
| Panel heading | 17–19px / 1 / −0.02em | 600 |
| Hero body | 17px / 1.55 | 400 |
| Body | 13–14px / 1.55–1.6 | 400 |
| Row title | 14–17px / 1.2 / −0.012em | 500 |
| Mono eyebrow | 10–11px, tracking .12–.18em, uppercase | 500 |
| Mono data | 9.5–12px, tracking .06–.10em | 400 |
| Counter numeral | 34px / −0.02em, `font-variant-numeric: tabular-nums` | 500 mono |
| Loader percentage | 22px, tabular-nums | 400 mono |

Nothing below 9px anywhere; nothing below 10px for reading text. Mobile tap targets minimum 44px. `text-wrap: pretty` on all multi-line prose. `font-variant-numeric: tabular-nums` on every live-changing number (clock, score, counters, percentage) so digits don't jitter.

### Spacing, radius, shadow

- Gutters: desktop page 60–80px, availability page 40px, mobile 18px.
- Rhythm: 60–66px hero top padding, 34–46px between sections, 14–22px inside panels.
- Radius: 3px matrix slots, 5px small chips, 6–7px inputs/buttons/cards, 8px panels, 9px beam wrapper, 14px sheet top corners, 20px pill chips.
- One shadow only, on floating surfaces (dropdown, sheet): `0 20px 44px rgba(0,0,0,.5)`. Plus the poster hover lift above.
- Row heights: live fixture 64px, scheduled fixture 52px, compact ledger 44px, search result min 74px, country row 44px min, homepage feed row 62px.

---

## Screens

### 3a — Homepage (animated) — **primary deliverable**

**Purpose.** Establish what Sightline knows, let the user search, and prove freshness continuously.

**Layout, top to bottom.**

1. **Sticky header**, 62px, `position:sticky;top:0;z-index:6`, `panel` at 94% + `blur(9px)`, bottom border `line`, gutter 60px. Left: logo mark (19px SVG chevrons + amber 2.4r dot) + "Sightline" 17px/600/−0.02em. Centre: nav links 13px `mid`, 8px×12px padding, radius 5px, hover → `text` on `surface`. Right: country button 36px, `surface`/`chipBorder`, radius 5px, chevron 14px.
2. **Hero**, `position:relative;overflow:hidden`, padding 60px 60px 34px.
   - **Backdrop:** `inset: 0 0 0 46%`, a Ken Burns `<image-slot>` (see Motion).
   - **Scrim 1:** `linear-gradient(90deg, ground 0%, ground 34%, rgba(11,13,17,.86) 54%, rgba(11,13,17,.5) 78%, rgba(11,13,17,.62) 100%)`.
   - **Scrim 2:** `linear-gradient(to top, ground 0%, transparent 40%)`.
   - **Grid pattern:** 40×40px `hair` 1px lines, opacity .5, masked `radial-gradient(120% 90% at 12% 30%, #000 0%, transparent 62%)`, drifting (see Motion). All three are `pointer-events:none`.
   - **Live eyebrow:** 11px mono/500/.18em uppercase amber — pulsing 7px amber dot, `mute` "Live now ·", then "Arsenal 2–1 Aston Villa", then the live clock in amber tabular-nums.
   - **h1:** 60px, word-by-word blur-in. "United Kingdom" is an inline-flex span with `border-bottom: 3px solid amber`, 2px bottom padding, 26px chevron, hover → `amberHover`.
   - **Body:** 17px `mid`, max-width 560px.
   - **Search block**, max-width 720px: scope chips row (8px gap, 12px below), then a 62px field + 62px amber Search button (8px gap), then a "Try" row of 5 pill chips.
     - Field: `flex:1`, `surface` at 94% + `blur(9px)`, `chipBorder`, radius 7px, 16px padding, 19px search icon `mute`, 16px gap, input 15px `text`, `caret-color: amber`. Focus: border `amber` + ring `0 0 0 3px rgba(240,166,60,.13)`. Carries a 34%-wide sweep highlight.
     - Button: amber, `#0b0d11` label 15px/600, radius 7px, 24px horizontal padding, hover `amberHover`, active `scale(.98)`, 40%-wide white sweep at 32% opacity.
     - Pill chips: 6px×12px, radius 20px, `line` border on `rgba(15,18,22,.7)`, 13px `mid`; hover border `outline`, colour `text`, `translateY(-2px)`; active `scale(.97)`.
   - **Counter row**, 40px gap, 34px top margin: three stat columns, 34px mono tabular-nums value over a 10px mono/.14em uppercase `mute` label. Values: `139` / "Countries for film & TV", `2` / "Competitions hand-verified", `4,128` / "Checks in the last 7 days".
3. **"Just re-checked" marquee strip.** `panel`, 1px `hair` top and bottom. Header row: pulsing 6px amber dot + 9.5px mono/.18em uppercase `mute` label, padding `9px 60px 0`. Track: `display:flex;width:max-content;gap:10px`, masked `linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)`. Each item: 7px×12px, `surface`, `line` border, 2px left border (amber for fixtures, blue for film/TV), radius 6px, `white-space:nowrap` — 13px `text` title, 12.5px `mid` service (`mute` when unverified), 9.5px mono `dim` timestamp. **The item array is duplicated once** so the −50% translate loops seamlessly.
4. **Two-column band**, padding `34px 60px 40px`, 20px gap.
   - **Left, `flex:1.35` — live card with border beam.** Wrapper: `position:relative;border-radius:9px;padding:1px;overflow:hidden;background:line`, containing (a) a rotating conic-gradient span at `inset:-70%` and (b) the real card at `border-radius:8px;background:panel`. Card header 13px×18px: pulsing dot, "Live now" 10.5px mono/.16em `mid`, right-aligned "Updating every 30s" 10px mono `dim`. Then 4 feed rows, 62px min, 2px amber left border, `hair` bottom border; live rows carry a Ken Burns still at `inset:0 0 0 auto;width:44%;opacity:.28`, masked `linear-gradient(90deg,transparent,#000 66%)`. Row content: 58px lead column (pulsing dot + mono minute/kick-off), flexible teams column (15.5px/500 names, 13px mono tabular score, 10px mono uppercase league), 180px right-aligned service column. Footer: 10px mono `dim` "Channel listings only — Sightline plays nothing" + a blue "All live scores" link.
   - **Right, `flex:1`, 14px gap.** (i) Hand-verified rights panel: header + 2×2 grid of country cells (14px/500 name over 12.5px `mute` casters, `hair` borders, hover `surface`) + a 12.5px `mute` footer line. (ii) Editorial promo card: `flex:1`, `min-height:164px`, **`display:flex;flex-direction:column`**, `overflow:hidden`; an absolute Ken Burns still at opacity .34, an absolute scrim `linear-gradient(to top, panel 12%, rgba(15,18,22,.5) 70%, transparent)`, and a **`flex:1`** content column with `justify-content:flex-end`, 16px padding, 6px gap — 9.5px mono blue eyebrow over a 16px/1.25/−0.014em title. *The card owns the column layout and the inner owns `flex:1` — do not put `height:100%` on the inner or the title unanchors from the scrim and lands on bright artwork.*
5. **Poster rail**, padding `0 60px 46px`. Heading row: 20px/600 "Checked in the last 24 hours" + 10.5px mono `mute` "Hover a poster". Grid: `repeat(6, 1fr)`, 12px gap. Each card: radius 7px, `overflow:hidden`, 2/3 aspect poster, and an absolute bottom caption block with `padding: 36px 11px 11px` over `linear-gradient(to top, rgba(11,13,17,.97) 26%, transparent)` and `pointer-events:none` — 9.5px mono blue kind, 13.5px/500 name, 11.5px `mute` services, then a hairline `rgba(90,98,114,.4)` above a 9px mono `dim` timestamp. Hover: `translateY(-4px)` + `0 14px 30px rgba(0,0,0,.5), 0 0 0 1px outline`.

### 3b — Loading: the four-stage rights check — **primary deliverable**

**Purpose.** Make the wait explain the product instead of hiding it.

- **Header row**, 14px gap, 20px below: a 22px spinner (a static `line` circle plus a rotating amber 90° arc), then a stacked 16px/500 stage title + 10.5px mono/.10em uppercase `mute` sub-line, then a right-aligned 22px mono amber percentage.
- **Stages** (1.4s each, determinate): `Reading your region` / "Header, then IP — never a guess" / 12% → `Matching the title` / "TMDB · TheSportsDB" / 38% → `Checking 139 catalogues` / "Film and television availability" / 71% → `Confirming broadcast rights` / "Hand-verified competitions only" / 96%.
- **Bar**: 3px, radius 2px, `raise` track, amber fill with `transition: width .9s cubic-bezier(.4,0,.2,1)`, plus a 26%-wide white sweep at 45% opacity looping 1.6s so it never looks stalled.
- **Step legend**: 4 equal columns, 6px gap — a 2px bar (amber once reached, else `raise`) over a 9.5px mono uppercase label (`mid` once reached, else `dim`), both transitioning at .4s.
- **Row skeleton** (left, `flex:1`): geometry **identical to the real search result row** — 74px min height, 2px `hair` left border, 88px lead column (13px×48px + 9px×34px bars), flexible middle (17px×52% + 12px×30%), 150px right column right-aligned (13px×130px + 9px×84px). All bars radius 3px, shimmering.
- **Slot skeleton** (right, 300px): 6 rows of 44px — a flexible 12px name bar (widths 78/62/88/54/70/60%) plus five 20px `raise` squares that **breathe** rather than shimmer. Caption explains why: a sweep across five squares would read as one loading bar, not five separate answers.

### 2b — Browse grid

4-across `repeat(4, 1fr)` grid, 14px gap, on `ground` with 40px padding. Heading row: 20px/600 "Checked recently" + 10.5px mono/.12em uppercase `mute` "139 countries covered". Card: `line` border, radius 7px, `surface`, `overflow:hidden`, hover border `outline` + `translateY(-2px)`, active `scale(.995)`. Body: 3/4 aspect poster, then a 14px-padded column with 8px gap — 10px mono/.14em uppercase blue kind + `dim` "·" + `mute` year; 16px/500/−0.01em title; wrapped 11.5px service chips (`line` border, radius 5px, 4px×8px); 10px mono uppercase `dim` "Checked 14 Aug".

### 2d — Fixture list

Section header: pulsing amber dot, 10.5px mono/.16em "Live now", 10.5px mono `dim` "2 live · 6 later today", right-aligned "All live scores". Container: `line` border, radius 8px, `panel`. Rows: 2px amber left border, `hair` bottom border, 64px live / 52px scheduled, hover `surface`. Live rows only carry a still at `inset:0 0 0 auto;width:520px;opacity:.3` masked from 62%. Row content: 76px lead (pulsing dot + mono minute), teams column (20px crest boxes, 16px/500 names, 13px mono score, 10.5px mono uppercase league), 250px right column (13.5px service + 10px mono uppercase provenance), 16px chevron rotating 180° when open.

**Expanded panel** (`padding: 4px 16px 16px 92px`, `surface`): a wrapping 28px-gap row of labelled groups — "Shown in United Kingdom" (channel chips with 20px logo squares), "Kick-off", "Venue", and a right-aligned "Checked by hand" + mono timestamp — then a 12.5px `mute` line "These are channel listings, not links to video. Sightline plays nothing."

### 2e — Hero (quiet)

Same header and search block as 3a without the backdrop, imagery or counters: 66px top padding, 11px mono/.18em `mute` eyebrow "Sport · Film · Television — 139 countries", the 62px h1, 17px body, search block at max-width 820px, then the **hand-verified ledger** — a full-width `panel` section with a header row (10.5px mono `mid` "Hand-verified broadcast rights" + 10.5px mono `mute` "2 competitions · 4 countries · last checked 14 AUG 2026"), a 4-column grid of country cells (15px/500 name, 13px `mid` casters, 10px mono `dim` "Verified …"), and a footer row on `ground` with the "Everywhere else … We show nothing rather than guess." line and a blue "How verification works" link.

### 2g — Search results page

Toolbar: a 50px field (max-width 560px) + scope chips + a right-aligned mono toggle button. Results: `line` border, radius 8px, `panel`; rows 74px min, 20px padding, 2px left border (amber fixture / blue film-TV / `mute` reference), hover `surface`. Row: 104px lead column (14px mono lead over 9.5px mono uppercase sub), flexible middle (17px/500/−0.014em title over 13px `mute` meta), 280px right column (13.5px service over 10px mono uppercase provenance), 16px chevron. **No type badges anywhere** — the lead column's colour and content carry the type.

### 2h — Search-as-you-type dropdown

Field 62px, focused (amber border + ring), with a rotating 16px arc on the right while loading. Panel: 8px below, `line` border, radius 8px, `panel`, `0 20px 44px rgba(0,0,0,.5)`. Groups ("Film & TV", "Fixtures"): a 9.5px mono/.16em uppercase `mute` header on `ground` with a `hair` bottom border, then rows of 9px×12px — a 36×54px poster (radius 3px, `line` border), a 14.5px `text` label over a 10px mono uppercase accent sub-line, and a right-aligned 12.5px `mute` "where". Footer on `ground`: 9.5px mono `dim` "↑↓ move · ↵ open · esc close" + a blue "See all 7 results".

**Three more panel states**, all same border/radius/background: **idle** (a "Checked in the last 24 hours" group — 2px accent bar, 13.5px label, 9.5px mono `dim` time), **nothing found** (13.5px `text` line + 12.5px `mute` explanation), **failed** (13.5px `text` line + a mono "Try again" button).

### 2i — Match page

Back link, 10.5px mono/.16em `mute` competition eyebrow, 42px h1, a 13.5px `mid` meta line (date · mono kick-off · venue with `dim` "·" separators), then two 38px secondary buttons (`surface`/`chipBorder`, radius 6px) — "Copy link" (with a 7px status dot) and "Add to calendar".

"Where it is shown" 20px/600 heading, then a wrapping row of 20px-radius country pills, then **one panel** whose geometry is identical in both states: `line` border, radius 8px, `panel`, a header row (17px/600 country + right-aligned 10.5px mono `mute` count or "Not verified"), a body, and a footer.

- **Verified body:** wrapped broadcaster chips (26px logo square + 14px name, `surface`, `line`, radius 6px, 10px×14px). Footer on `ground`: mono "Checked by hand · 14 AUG 2026" + the "channel listings, not links to video" line.
- **Unverified body:** a 20px info circle icon plus a max-620px column — 15px/500 "We have not verified a broadcaster in {country}.", then two 13.5px/1.6 `mid` paragraphs, then an amber primary "Tell us who carries it in {country}" and a secondary "What "verified" means". Footer: the same "channel listings" line.

### 2j — 139-country availability

Toolbar: a 250px 42px filter field + a legend (five 20px slot swatches with letters F/A/S/R/B + an outlined "—" for "none held"). Continent header: 15px/600 name, 10.5px mono count, right-aligned 10.5px mono breakdown, rotated chevron. Country rows: 12px×20px, `hair` bottom border, open row sits on `raise`; 170px name (14px/500), five 20px slots (radius 3px, mono letters), right-aligned mono count ("4 of 5 offer kinds" / `dim` "No offers recorded"), a 104px right-aligned mono **checked date**, chevron.

**Expanded panel** (`padding: 2px 20px 16px 190px`, `raise`): five lane rows, 9px apart — a 118px 10px mono/.12em uppercase lane label, then either service chips (12.5px name + 10px mono `mute` price, `panel` background) or a 12.5px `dim` "No {lane} offer recorded". If nothing is held at all, a single 13px/1.6 `mute` paragraph: "We hold nothing for {country} — no service in our data carries this film there. That is a gap in what we know, not proof the film is unavailable."

*One addition to the old build: the per-country **checked** column. The date is the product.*

### 2l — Mobile (390×844)

- **Home:** 18px gutter, 35px h1, a segmented 3-up scope control (44px min height, `line` border, radius 6px, dividers between), a 52px field, the hand-verified panel as a 2×2 grid, a live-now list (2px amber left border, 15px/500 teams, mono minute + service), and a horizontally scrolling "Just checked" rail of 214px cards with a hairline-separated mono checked timestamp.
- **Matrix:** 44px country rows with five 18px slots and a chevron; tapping opens a **bottom sheet** — `radius: 14px 14px 0 0`, `panel`, `line` top border, `0 20px 44px rgba(0,0,0,.5)`, a 36×4px grab handle, a 19px/600 country + mono checked date header, then lane groups (10px mono label + 13px chips) and the "Every name links to that service's own page. Sightline transmits no video." line.
- **Rule:** lists open **inline**; a country in the 139 opens as a **sheet** (five lanes plus prices is too much to unfold inside a scroll of 139 rows, and the sheet preserves list position). The coverage ribbon stays desktop-only. 44px minimum targets throughout.

### 2m — Component state board

Pinned rest/hover/press/open/focus/disabled states for: **row** (fixture/country), **primary button**, **scope chip**, **search field**, **availability slot**, **answer line**. Use this as the acceptance checklist — see **Interactions** for the values.

---

## Interactions & behaviour

### State-by-state values

| Component | Rest | Hover | Press | Selected / Open | Focus | Disabled |
|---|---|---|---|---|---|---|
| Row | `panel`, 2px amber left border | bg `surface` | `scale(.995)` | bg `raise` | ring `0 0 0 2px rgba(240,166,60,.55)` | — |
| Primary button | amber on `#0b0d11`, 600 | `amberHover` | `scale(.98)` | — | amber ring | `raise` bg, `line` border, `dim` text |
| Scope chip | transparent, `mute` text | border `outline`, text `text` | `scale(.97)` | `raise` bg, `line` border, `text` | amber border + `0 0 0 3px rgba(240,166,60,.13)` | — |
| Pill chip | `line` border, `mid` | border `outline`, `text`, `translateY(-2px)` | `scale(.97)` | — | amber ring | — |
| Card / poster | `line` border | border `outline`, `translateY(-2px..-4px)` (+ shadow on posters) | `scale(.995)` | — | amber ring | — |
| Search field | `chipBorder` border | — | — | — | amber border + `0 0 0 3px rgba(240,166,60,.13)`, amber caret | — |
| Nav link | 13px `mid` | `text` on `surface` | — | — | amber ring | — |
| Availability slot | solid `blue` (4–5 kinds) / `blueMid` (3) / `blueLow` (1–2), letter in `#0b0d11` or `text` | — | — | — | — | outlined `outline` + `outlineText` "—" when none held; `hair` border + `dim` "?" when not checked |

Transitions: colour and border `.16s ease`, transform `.1s ease` for presses, `.2s cubic-bezier(.2,.7,.3,1)` for card lifts, `.22s cubic-bezier(.2,.7,.3,1)` for chevron rotation.

### Behaviour

- **Fixture row (2d, 3a) and country row (2j) open in place** — never navigate. Single-open accordion: opening one closes the other. Chevron rotates 180°. Position in the list must never be lost.
- **Country pills (2i)** swap the panel between verified and unverified. The panel re-keys on country so it crossfades (`.34s`).
- **Copy link (2i)** flips its dot to amber and its label to "Link copied" for **1800ms**, then reverts.
- **Scope chips** filter the search domain (Everything / Sport / Film & TV) and are shared between hero and results toolbar.
- **Loading (3b)** advances every 1.4s. In production, drive stage from the real request phase; if a phase resolves faster, skip ahead rather than waiting out the 1.4s.
- **Mobile:** lists inline, matrix in a bottom sheet.
- **Keyboard (2h):** ↑↓ moves through grouped results across group boundaries, ↵ opens, esc closes. Footer states this literally.
- **Empty and error states are answers, not errors.** Unverified rights render in `mute`, never red. "No offers recorded" is `dim`. Every gap gets a sentence explaining it is a gap in what Sightline knows.

---

## Motion

Ten patterns. All hand-written CSS keyframes — **do not add an animation library.** Patterns are adapted from Magic UI (marquee, number-ticker, border-beam, animated-list, shimmer) and re-implemented on Sightline's tokens.

| Name | Keyframe | Duration / easing | Where |
|---|---|---|---|
| `fade-rise` | opacity 0→1, `translateY(5px)`→0 | .45–.55s `cubic-bezier(.2,.7,.3,1)` | Ledger cells (75ms apart), results after skeleton, match panel on country change (.34s) |
| `word-in` | opacity 0→1, `blur(7px)`→0, `translateY(9px)`→0 | .62s same curve, **52ms apart** | Hero h1 words (from 60ms), eyebrow, body, search block, counters |
| `expand` | opacity 0→1, `translateY(-5px)`→0 | .22s same curve | Row opening in place, dropdown |
| `list-in` | opacity 0→1, `translateY(10px) scale(.985)`→none | .42s same curve, **90ms apart** | Homepage live feed rows |
| `slot` | opacity 0→1, `scale(.74)`→1 | .38s same curve, **45ms apart** | Five availability slots per row, once per row |
| `shimmer` | `background-position` −340px→340px | 1.15s linear, **0/90/180/270/360ms** | Skeleton bars; gradient `linear-gradient(90deg, raise, line 50%, raise)` at `background-size: 340px 100%` |
| `breathe` | opacity .5→.9→.5 | 1.5s ease-in-out | Skeleton availability slots only |
| `pulse` | opacity 1→.35→1 | 2s ease-in-out | Live dots |
| `ken-burns` | `scale(1.02)`→`scale(1.13) translate3d(-1.5%,-1.5%,0)` | 26–30s ease-in-out **alternate** infinite | Hero backdrop, live-row stills, promo card |
| `marquee` | `translateX(0)`→`translateX(-50%)` | 42s linear infinite | Just-re-checked strip (items duplicated once) |
| `spin` (beam) | `rotate(0)`→`rotate(360deg)` | 5.5s linear infinite | Live card only — a `conic-gradient(from 0deg, transparent 0 78%, rgba(240,166,60,.9) 88%, transparent 96%)` span at `inset:-70%` |
| `sweep` | `translateX(-100%)`→`translateX(320%)` | 3.6s (button) / 5.4s (field) / 1.6s (loader) `cubic-bezier(.4,0,.2,1)` | Search field, Search button, loader bar |
| `arc` | `rotate(0)`→`rotate(360deg)` | 1.1s linear | Loader spinner, dropdown loading icon |
| `drift` | `translate3d(0,0,0)`→`translate3d(-40px,-40px,0)` | 34s linear | Hero grid pattern |
| `digit` | opacity 0→1, `translateY(7px)`→0 | .5s `cubic-bezier(.2,.7,.3,1)` | Live clock on each tick |

**Rules.**

- **`prefers-reduced-motion: reduce` must resolve every animation and transition to its end state.** The prototype does this with a blanket `*{animation:none!important;transition:none!important}`; in production prefer per-rule handling so `fade-rise` elements still land at opacity 1.
- **Three surfaces stay still on purpose:** the availability matrix body, the unverified panel, and all provenance dates. A page about what is true should not have its facts moving.
- **The border beam is used exactly once**, on the one card whose data is actually changing. Used twice it means nothing.
- **Counters run once on mount**, not on every scroll into view: cubic ease-out over 1.7s to 139 / 2 / 4,128.
- **In production, move the reveal animations to native scroll-driven CSS:** `animation-timeline: view(); animation-range: entry 0% entry 40%;` with `animation-fill-mode: both`, wrapped in `@supports (animation-timeline: view())`, keeping the time-based version as the fallback. Transform and opacity then run on the compositor thread instead of the main thread — it stays smooth on a phone mid-match. Support is Chrome/Edge 115+, Firefox 132+, Safari 18+ (~84% globally), hence the `@supports` guard.
- **Never animate layout properties** (width, height, margin). Use `transform` and `opacity`. Don't add `will-change` preemptively.

---

## State management

Client state needed (the prototype holds all of it in one component; in production split per screen):

| State | Type | Initial | Trigger | Affects |
|---|---|---|---|---|
| `openFixture` | `string \| null` | first live id | Row click; clicking the open row closes it | 2d, 3a expanded panel + chevron |
| `openCountry` | `string \| null` | none | Country row click / sheet open | 2j panel, 2l sheet |
| `matchCountry` | `string` | viewer's country | Country pill click | 2i panel (verified vs unverified) |
| `scope` | `"Everything" \| "Sport" \| "Film & TV"` | `Everything` | Chip click | Search domain, hero + toolbar chips |
| `searchState` | `"idle" \| "typing" \| "loading" \| "results" \| "empty" \| "error"` | `idle` | Input, request lifecycle | 2g/2h panel body |
| `loadPhase` | `0–3` | `0` | Real request phase (prototype: 1.4s interval) | 3b title, sub, %, bar, legend |
| `counters` | `{countries, comps, checks}` | zeros | rAF on mount, 1.7s | 3a stat row |
| `liveClock` / `scores` | per fixture | from API | Poll every 30s | 3a eyebrow + feed, 2d lead column |
| `copied` | `boolean` | `false` | Copy click; auto-clears after 1800ms | 2i button label + dot |

**Data requirements.** Viewer country (header, then IP — never a guess). Fixtures with kick-off, competition, venue, score, minute, and per-country verified broadcasters + verification date. Titles with poster, kind, year, and per-country offers grouped into five lanes (free / free-with-ads / subscription / rent / buy) with prices, plus a per-country checked date. Live polling at 30s. **Every answer must carry its verification date** — if you don't have a date, the answer is "not verified", not a guess.

**Clean up on unmount:** the rAF counter loop, the 30s poll, the loader interval, and the 1800ms copy timeout.

---

## Copy — use verbatim

These strings are load-bearing legal and trust copy. Do not paraphrase.

- "These are channel listings, not links to video. Sightline plays nothing."
- "Channel listings only — Sightline plays nothing"
- "Every name links to that service's own page. Sightline transmits no video."
- "Availability differs by country because rights are licensed territory by territory. A service named here carries the title in {country} — Sightline transmits no video and sells no subscription."
- "Everywhere else — Germany, Spain, Japan and 130 more — is not verified. We show nothing rather than guess."
- "We have not verified a broadcaster in {country}."
- "Our broadcast coverage is built by hand, one competition and one country at a time. {country} is not among the four countries we check for the Premier League, so we would be guessing — and a guess here costs you a kick-off."
- "We hold nothing for {country} — no service in our data carries this film there. That is a gap in what we know, not proof the film is unavailable."
- "No title or fixture matches "{query}"." / "We hold 139 countries for film and TV, and hand-verified rights for 2 competitions. If it should be here, tell us."
- "The metadata provider did not answer." + "Try again"
- "Not verified in {country}" / "No offers recorded" / "Nothing recorded" / "We show nothing rather than guess"
- Loader stages: "Reading your region" / "Header, then IP — never a guess"; "Matching the title" / "TMDB · TheSportsDB"; "Checking 139 catalogues" / "Film and television availability"; "Confirming broadcast rights" / "Hand-verified competitions only"
- Hero: "Where can I watch this in {country}?" / "One lookup for sport, film and television. We tell you which service carries it where you are — and the date we last checked."
- "Checked by hand" / "Verified {date}" / "Checked {date}" / "Hand-verified broadcast rights"
- Dropdown footer: "↑↓ move · ↵ open · esc close"

Date formats: mono uppercase `14 AUG 2026` for provenance stamps, `14 Aug` in dense card contexts, `09:12` for same-day times.

---

## Assets

Nothing in this bundle is a shippable asset — all artwork is a placeholder.

- **Posters** (2/3 and 3/4 aspect): TMDB `poster_path` via the existing `tmdbImage()` helper and `poster-thumb.tsx`.
- **Stills / backdrops** (hero, live rows, promo card): TMDB `backdrop_path` and TheSportsDB event thumbnails, via the existing `event-backdrop.tsx`. **The prototype raises live-row still opacity from 0.05 to 0.3 with a 62% mask fade, live rows only** — this is a deliberate change from the current build.
- **Team crests:** TheSportsDB, via `team-badge.tsx`. The prototype's 20px letter boxes are placeholders for these.
- **Service logos:** the 20–26px squares in channel and lane chips.
- **Icons:** `lucide-react` — chevron-down/right/left, search, info, refresh. The Sightline logo mark is inline SVG (two chevrons + an amber dot); use the existing `logo.tsx`.
- **Fonts:** Archivo and IBM Plex Mono from Google Fonts, already loaded in the app.
- `<image-slot>` elements exist only so a reviewer can drag real artwork into the prototype. **Do not port them.**

---

## Accessibility

- Contrast: `text` on `ground` ≈ 14:1, `mid` ≈ 8:1, `mute` ≈ 5:1. `dim` (`#4a5262`) is for non-essential mono metadata only — never for reading copy. Amber on `#0b0d11` for the primary button ≈ 10:1.
- **Never colour alone.** Availability slots carry a letter (F/A/S/R/B) and a shape (solid vs outlined) as well as a colour, so the matrix survives greyscale and colour blindness.
- Visible keyboard focus everywhere: `0 0 0 2px rgba(240,166,60,.55)` on rows, `0 0 0 3px rgba(240,166,60,.13)` plus an amber border on inputs and chips.
- Accordion rows are real buttons with `aria-expanded`; the bottom sheet is a focus-trapped dialog with an escape and a visible handle.
- Marquee content is decorative and duplicated — mark the clone `aria-hidden="true"`. The strip should pause on hover and focus, and stop entirely under reduced motion.
- Live regions: score and minute updates should be `aria-live="polite"`, not assertive.
- Mobile tap targets ≥44px, enforced in 2l.

---

## Verified function tests

Every interactive control in the prototype was probed in the browser. See `FUNCTION-TESTS.md` for the raw results. Summary: 8/8 systems pass — fixture accordion, loading toggle, match-page country swap, copy-link timeout, country accordion, scope chips, the three live motion loops (counters, clock, loader), and all 38 image slots.

---

## Files in this bundle

| File | What it is |
|---|---|
| `Sightline - current UI.dc.html` | The design reference. Open in a browser. Turn 3 (top) is the animated homepage + loading; turn 2 is the five core screens with alternatives; turn 1 (bottom) is the recreation of the **current** production UI, for before/after comparison. |
| `support.js` | Runtime the prototype needs to render. Not for production. |
| `image-slot.js` | The droppable placeholder element. Not for production. |
| `SPEC-binding-source.md` | The project's canonical, **binding** design spec (`design/sightline/HANDOFF.md`). Wins on any conflict with this README. |
| `FUNCTION-TESTS.md` | Raw interaction test results. |

**Known prototype quirk:** screenshot/PNG capture of this file can time out because of the conic-gradient beam plus ~20 concurrent animations. Pause the beam before capturing. This does not affect the design.

## Acceptance checklist

- [ ] Recommended option built for each screen; rejected alternatives not built
- [ ] Every colour comes from a token; no new hex values
- [ ] Amber only for live/sport, blue only for film/TV, "verified" is a date with no colour
- [ ] Every answer surface shows its verification date
- [ ] Empty and unverified states use `mute`/`dim` with an explanatory sentence — never red, never a bare zero
- [ ] Availability slots encode state by letter + fill, not colour alone
- [ ] Rows open in place; list position never lost
- [ ] Skeleton geometry matches the real row exactly — nothing shifts when data lands
- [ ] All 15 motion patterns match the durations, easings and stagger intervals in the table
- [ ] Border beam appears exactly once
- [ ] `prefers-reduced-motion` resolves everything to its end state
- [ ] Matrix body, unverified panel and provenance dates do not animate
- [ ] Reveals use `animation-timeline: view()` behind `@supports`, with the time-based fallback
- [ ] Verbatim copy strings unchanged
- [ ] Mobile: 44px targets, inline lists, sheet for the matrix, no ribbon
- [ ] Keyboard focus visible on every interactive element; accordions expose `aria-expanded`
- [ ] Timers, polls and rAF loops cleaned up on unmount
