# Project: Sports data platform (clean)

**Repo:** `shad-yy/version-3-clean` (private) · **Branch:** `main`
**Domain:** not yet chosen — see "Changing the domain" below
**Not yet deployed.**

---

## What this is

Live football scores, fixtures, league standings, team and player statistics, and
**official UK television broadcast listings**.

It is an information service. It does **not** sell, resell, or provide access to any
television or streaming subscription, and it does not host or transmit video.

The differentiator is not scores — ESPN, BBC Sport, FlashScore and SofaScore all do
scores better and have for years. It is **"which channel, in which country, at what
local time"**. Nobody owns that answer. Build toward it.

---

## ⚠️ There are two separate projects

| | This project | The other one |
|---|---|---|
| Folder | `Downloads/Legalizedsmart-live-tv/smart-live-tv` | `Downloads/smart-live-tv` |
| Repo | `shad-yy/version-3-clean` | `shad-yy/forclaude` |
| Branch | `main` | `Version-3` |
| What it is | Sports data platform | IPTV/streaming store |
| Commercial content | **Never** | Yes — intentional |

The other project is the live commercial store on smartlivetv.co.uk. Its IPTV content is
deliberate. Do not copy anything from it into here, and do not link to it from here —
the whole point of the split is that search engines and ad networks cannot associate the
two. Shared *design system* is fine; shared brand identity and cross-links are not.

The repos have no shared remote. Keep it that way.

---

## Non-negotiable: the domain-compliance guard

`scripts/generate-posts.js` validates every published article and **fails the build** on
commercial streaming copy — IPTV, channel counts, subscription prices, free trials,
sideloading instructions.

It validates the **raw MDX source**, not the rendered HTML, so link rewriting cannot mask
a violation.

**`lib/blog/posts.ts` and `public/llms-full.txt` are generated.** Both `npm run dev` and
`npm run build` regenerate them from `content/blog/*.mdx`. Editing them directly is the
bug that kept recurring — every previous cleanup was applied to the generated file and
silently overwritten on the next run. **Edit `content/blog/*.mdx`.**

17 expired fixture guides are marked `draft: true`. They are retained for conversion into
result reports and are excluded from the build and the sitemap. Converting them needs
**real final scores — do not invent them.**

## Other standing rules

- **Never fabricate data.** `lib/data/broadcast-rights.ts` carries a `verified` date per
  competition and must be re-checked each rights cycle. It is deliberately
  competition-level, never fixture-level — fixture mappings change weekly and a wrong
  broadcaster listing is worse than none on a site selling accuracy.
- **No `offers`, invented `startDate`, or invented `location` in schema.** The
  `SportsEvent` helper previously emitted a fabricated "£12.00 GBP" Offer. See the
  comments in `lib/schema.ts`.
- Framer Motion needs a mount guard (`.cursorrules` §2) — but **not** at the cost of
  removing navigation from the server-rendered HTML. See the note in
  `memory-bank/AUDIT-PROGRESS.md`.

## Where the work stands

`memory-bank/AUDIT-PROGRESS.md` is the source of truth — per-item status with the
verification command for each. Phase 1 complete; Phases 2 and 3 partial.

**Rule adopted 2026-07-31:** do not mark an item done without recording the command and
its output. A previous pass marked nine items complete while the code was unchanged.

Full audit: `reports/audit-2026-07-31.md` · Plan: `reports/implementation-plan-2026-07-31.md`

## Changing the domain

Fully parameterised — no source change needed:

```bash
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_SITE_NAME="Example"
NEXT_PUBLIC_SITE_HOST=example.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
INDEXNOW_HOST=example.com
```

`lib/config/site-url.ts` is the single source of truth. Do not hardcode a domain anywhere else.

## Build and test

```bash
npm run dev
npx tsc --noEmit   # 0 errors
npx vitest run     # 14 passing
node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build
```

⚠️ `npm run build` pings IndexNow. It is gated behind `INDEXNOW_ENABLED=true`, which must
only ever be set in production. Stop the dev server before building.
