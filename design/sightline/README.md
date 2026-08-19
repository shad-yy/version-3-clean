# Sightline design handoff — canonical source

`HANDOFF.md` is the design specification. It is **binding**: colours, type, spacing,
radii, motion timings and copy are final, and the copy wording is part of the product's
position rather than placeholder text.

## What is here

| File | Status |
|---|---|
| `HANDOFF.md` | The specification. Read before any UI task. |
| `Sightline.dc.html` | Reference prototype. Sections `1e` desktop home, `1f` mobile home, `1g` film availability. `1b` is the locked art direction. **Ignore `1a`, `1c`, `1d`.** |
| `world-map.html` | d3 + topojson map. Its data and rendering approach carries over closely. |
| `support.js` | Prototype runtime. Reference only. |

## Not ported, deliberately

`browser-window.jsx` and `ios-frame.jsx` are presentation frames for the mockups. The
handoff says explicitly not to port them, so they are not in this repo.

## How to use it

The HTML files are **references, not code to copy**. Screens are rebuilt with this
project's own stack — Next.js App Router, shadcn/ui, lucide, framer-motion, Tailwind
tokens. Recreate the specification faithfully using the codebase's own primitives.

The seven **design opinions** in `HANDOFF.md` are load-bearing. Each one was a deliberate
rejection of an obvious alternative, and each protects the product's position:

1. No type badges — the lead column and accent carry type.
2. Empty states use the same panel geometry as results. They are answers, not errors.
3. "Verified" is never a green tick — a mono date only.
4. Availability uses shape as well as colour, so it survives colour-blindness.
5. Rows expand rather than navigate, so scroll position is never lost.
6. Discovery is ordered by freshness of verification, never popularity or payment.
7. The honest-gap sentences stay on every screen. Do not delete them to tidy a layout.
