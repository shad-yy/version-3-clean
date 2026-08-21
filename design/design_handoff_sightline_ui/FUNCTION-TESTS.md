# Function tests — Sightline prototype

Every interactive control in `Sightline - current UI.dc.html` was probed in a live browser by dispatching real click events and reading the resulting DOM. **8 of 8 systems pass. No console errors.**

Run date: 21 Aug 2026.

---

## 1. Fixture accordion (2d) — PASS

Single-open accordion. Opening a row closes the previously open one; the panel renders in place, no navigation.

| | Arsenal panel ("Emirates Stadium") | Bologna panel ("Stadio Renato Dall'Ara") |
|---|---|---|
| Before click | present | absent |
| After clicking Bologna row | absent | present |

## 2. Loading / results toggle (2g) — PASS

Button label swaps with the state. Skeleton and results are mutually exclusive.

- Initial: results visible ("7 results for "arsenal""), no "Checking rights" header. Button reads "Show loading".
- After 1st click: "Checking rights for United Kingdom…" header + shimmering skeleton present.
- After 2nd click: back to "7 results". Round trip clean.

## 3. Match-page country swap (2i) — PASS

One panel, two bodies, same geometry.

- Click "Spain" → "We have not verified a broadcaster in Spain." renders (unverified body).
- Click "United Kingdom" → "Sky Sports Main Event" chip + "2 broadcasters" count render (verified body).

## 4. Copy link (2i) — PASS

Click → label becomes "Link copied" and the status dot turns amber. Reverts after 1800ms via a cleared timeout.

## 5. Country accordion (2j) — PASS

Single-open, and the previously open row genuinely closes (not just visually).

| | France lanes ("France TV") | Germany lanes ("WOW") |
|---|---|---|
| Before click | present | absent |
| After clicking Germany | absent | present |

## 6. Scope chips (3a / 2g) — PASS

Click "Sport" → computed `background-color: rgb(27, 31, 39)` (`raise`) and `color: rgb(232, 229, 222)` (`text`), i.e. the selected treatment. Shared state between hero and toolbar.

## 7. Live motion loops — PASS

- **Counters** settled on `139`, `2`, `4,128` — the rAF ease-out ran to completion and stopped.
- **Live clock** observed at `69'`, incrementing every 4.2s and wrapping 90'→46' as designed.
- **Loader** observed mid-cycle at `96%` (stage 4), advancing every 1.4s.
- **Marquee** carries 18 items (9 unique, duplicated once) so the −50% translate loops seamlessly.

## 8. Image slots — PASS

38 `<image-slot>` elements across the file; the custom element is defined and registered. All are droppable and persist their drop.

---

## Layout defects found and fixed during review

All three were found by measuring `getBoundingClientRect` against `getComputedStyle`, not by eye.

1. **2c compact ledger — text collision.** Bare text nodes as anonymous flex items in a `nowrap` row could not shrink below min-content, so long team names ran under the fixed 150px league column ("Newcastle" overlapped "Premier League" by 13px; "Flamengo" overlapped "Brasileirão" by 20px). **Fixed:** each team name is now a span with `min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis` inside an `overflow:hidden` container. Verified: names now end at x=338/340 against a column starting at x=342.

2. **3a promo card — clipped, then unanchored title.** The card was `display:block`, so the inner column shrank to its content height and `justify-content:flex-end` had nothing to push against — the title first overflowed and was clipped by 31px, then (after a partial fix) sat at the top of the card over the transparent part of the scrim, on un-darkened artwork. **Fixed at the root:** the card now owns `display:flex; flex-direction:column` and the inner owns `flex:1`. Verified after reload: card 165px, inner 164px, title bottom-anchored 17px above the card edge, inside the opaque part of the scrim.

3. **Coverage ribbon (turn 1) — last segment cut off.** Percentage-width segments summed to ~100% but the four 9px flex gaps were never subtracted, so the row overflowed its `overflow:hidden` container by 132px. **Fixed:** ticks are `flex:1 1 5px; min-width:1px` inside shrinkable (`min-width:0`) groups. Verified: `clientWidth 1200 / scrollWidth 1200`, cut 0px, all five segments fit (245.7 + 212.7 + 236.7 + 212.7 + 256.1 + 4×9px gaps).

## Intentional overflow — do not "fix"

These read as clipping to an automated check but are deliberate:

- The marquee track is 3442px wide inside a 1280px strip — that is how the loop works.
- The border-beam span is 1574×872 inside its `overflow:hidden` wrapper — that is how the beam is masked to the border.
- Ken Burns spans sit at `inset:-6%`/`-8%`, overflowing their containers by ~16px — that is the pan headroom.
- Mobile frames are 390×844 with content cropped at the fold; the mobile "Just checked" rail is a horizontal scroller.

## Not tested here

- Real keyboard navigation (↑↓/↵/esc) in the search dropdown — the prototype shows the footer hint and the states, but arrow-key traversal is for the implementation.
- Focus trapping in the mobile bottom sheet.
- Screen-reader output.
- Real data loading, polling and error paths.
