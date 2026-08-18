# Design brief — paste this into Claude (or any design tool)

Everything below the line is self-contained: it assumes the reader has no access to the
repository. Copy from **"You are designing…"** to the end.

Two things to edit before pasting:

1. **The brand name.** It currently says `[BRAND]`. Replace it once the name is decided
   (see [BRAND.md](./BRAND.md) — recommendation is *Sightline*).
2. **The ask at the end.** Trim it to the screens you actually want this round.

---

You are designing the visual identity and interface for **[BRAND]**, a web product being
rebuilt from an existing, working codebase. Below is exactly what it contains today, what
it does, and the constraints. Please do not invent features it does not have.

## What the product is

**One question, answered honestly: "Where can I watch this, from where I am?"**

It covers **sport, film and television together** — which nothing else does well. JustWatch
and Reelgood answer it for film and TV. National listings sites answer it for sport. Nobody
answers both, per country, in one place.

**Critical:** the product is a **reference**, not a streaming service. It transmits no
video, sells no subscription, and bundles nobody's channels. It tells you which service
carries a thing in your country, and links you to information — never to playback. The
design must never imply otherwise: **no play triangles, no "Watch now" buttons over
provider logos, no player chrome.** Its authority comes from being accurate and honest
about what it does not know.

## What it actually holds

**Sport** (live data, updates continuously)
- Live scores and today's fixtures across major football leagues
- League tables and standings
- Team profiles, squads, fixture history
- Player profiles and season statistics
- Full fixture calendar and results archive
- UFC — event schedule, fight cards, fighter records, divisional rankings
- Formula 1 — race calendar, circuits, session times, results
- Sports news, refreshed daily

**Film and television** (per-country availability)
- Any film or series, with where to watch it in **139 countries**
- Per country, split into: free, free-with-ads, subscription, rent, buy
- Data is licensed from JustWatch via TMDB. **Attribution to JustWatch must appear
  wherever this data is shown** — this is a licensing requirement, not a preference.

**Broadcast rights** (hand-verified, deliberately small)
- Currently **2 competitions across 4 countries** — United Kingdom, United States,
  Australia, France, naming Sky Sports, NBC Sports, Optus Sport, TNT Sports, CBS Sports,
  Canal+
- Each listing carries **the date it was last verified**
- Where a country is not verified, **nothing is shown for it**. The design must have a
  graceful, unembarrassed way to say "we have not verified this yet" — honest gaps are a
  feature of the brand, not a failure state to hide.

**Editorial** — explainers on how broadcast rights work, why availability differs by
country, why some matches are not televised at all.

## The site structure

34 pages. The ones that matter for design:

- **Home**
- **Search results** — the primary interaction
- **A film or series page** — availability by country
- **A competition guide** — fixtures, table, who carries it where
- **A match page** — teams, kick-off, venue, broadcasters
- **Live scores** · **League tables** · **Team page** · **Player page**
- **UFC hub** and **F1 hub**
- **Blog index** and **article**
- About · Contact · FAQ · Privacy · Terms

## The central design problem

**The current homepage leads with a headline that lists inventory:** *"Live Sports Scores,
Fixtures & Global Broadcast Guide"*. It describes stock, not value. It asks nothing, and it
never mentions film or television at all.

Meanwhile the best line on the site is buried a thousand pixels down the page: *"The match
is on. But on what channel, where you are?"*

**The core interaction is lookup, not browsing** — yet there is no search field in the hero.
The primary control is a small box in the header.

I want a homepage that:
- Leads with the user's own question
- Puts **search** front and centre as the main action
- Makes it obvious within two seconds that this covers **both** sport and film/TV
- Proves accuracy with something concrete and checkable rather than adjectives
- Earns the scroll honestly — curiosity and specificity, never fake urgency, fake scarcity,
  countdown timers on things that are not timed, or invented user counts

## Constraints

**Technical** — these are fixed:
- Next.js App Router, React, Tailwind CSS
- **shadcn/ui** component library, already installed with 60 components
- **lucide-react** icons only
- framer-motion for animation
- Dark theme is the current default

**Rules:**
- **No emoji anywhere** — in UI, copy, or headings. Icons are lucide SVGs.
- **Accessible**: WCAG AA contrast minimum, visible focus states, respects
  `prefers-reduced-motion`, works at 320px width.
- **Animation must never hide content.** If an animation fails to run, the content must
  still be visible. (We had a bug where scroll-reveal animations left a third of the
  homepage invisible.)
- Core Web Vitals matter: LCP under 2.5s. Avoid enormous hero photographs.

**Current palette** (change it if you have a better answer — it is not sacred):
- Background `#0a0a0f` · Surface `#12121a` · Border `#2a2a3a` · Accent `#00e676`

The green accent is inherited and reads slightly "sports betting". A palette that feels
more like a **trusted reference** — closer to a quality newspaper or a data product than a
bookmaker — is probably right, but I want your opinion rather than my assumption.

## Tone

Authoritative but plain-spoken. It should feel like a reference that knows what it is
talking about and admits what it does not.

**Not:** hypey, salesy, "unlimited access", "stream anything anywhere". That is the register
of the pirate-streaming sites this product is explicitly not.

## What I would like from you

1. **Art direction** — 2 or 3 distinct directions, each with a palette, type pairing, and a
   one-line rationale. Say which you would pick and why.
2. **The homepage**, desktop and mobile, showing above-the-fold in full.
3. **A film/series availability page** — the hardest layout here: up to 139 countries, each
   with several services split across free / ads / subscription / rent / buy. It must stay
   scannable, let someone find their own country instantly, and never imply playback.
4. **Search results** mixing sport and film/TV in one list — how do you distinguish a
   fixture from a film without clutter?
5. **The empty state** for "we have not verified a broadcaster for your country yet". This
   appears often and is central to the brand's honesty.
6. **A logo direction.** Must work at 16px as a favicon and in one colour. Avoid the two
   clichés of the category: a play triangle (implies playback, which we do not do) and a
   television set (the scope is wider than TV).

Tell me where you disagree with any of the above. I would rather have an argument than a
polite mockup.
