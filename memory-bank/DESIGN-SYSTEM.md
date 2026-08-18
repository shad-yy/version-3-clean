# Design system and UI law

The rules every page and component must follow. When a rule changes here, it changes
**everywhere** — see §7 for how that is enforced.

Read alongside [OWNER-INSTRUCTIONS.md](./OWNER-INSTRUCTIONS.md) rule 5 (theme changes reach
every page) and [BRAND.md](./BRAND.md).

---

## 1. What this product is, in one line

**A reference that answers "where can I watch this, from where I am?" — for sport, film and
television alike.**

Every design decision is judged against that sentence. It has three consequences that are
easy to miss:

1. **The core interaction is lookup, not browsing.** The primary control is therefore a
   search field, not a carousel.
2. **The answer is location-dependent.** Country is a first-class part of every answer, not
   a footnote.
3. **We never imply playback.** No play triangles, no "Watch now" buttons on a provider
   logo, no language suggesting we serve video. We do not.

---

## 2. The homepage hero — assessment and direction

The owner asked whether the current hero could be better. **Yes, and the problem is
structural rather than cosmetic.**

### What is wrong now

| Issue | Detail |
|---|---|
| **The headline is an inventory list** | "Live Sports Scores, Fixtures & Global Broadcast Guide" — three nouns joined by punctuation. It describes stock, not value. Nobody wants a "Global Broadcast Guide"; they want to know what channel the match is on. |
| **No question, no tension** | The product answers the single most curiosity-driving question available, and the hero never asks it. |
| **The best line on the page is buried** | Section three reads "The match is on. But on what channel, where you are?" That is excellent copy sitting 1,400px below the fold. The hero should be doing that job. |
| **Jargon** | "Real-Time Telemetry" appears three times. Telemetry is an engineering word; no sports fan uses it. It signals we do not know who we are talking to. |
| **Unfalsifiable trust badges** | "Verified Fixtures", "Instant Updates" are assertions, not evidence. Our own content rule says a verified claim carries a date or it is not a claim. |
| **The background image is wrong twice** | It pulls TheSportsDB league fanart; the live screenshot showed a baseball "REGULAR SEASON" graphic, matching none of the six competitions named in the copy. It is also a busy photograph behind text — poor contrast, and a large LCP element. |
| **No film or television anywhere** | The hero names Premier League, Champions League, La Liga, UFC, F1, NBA. A visitor cannot tell this site covers film at all. |
| **"PLATFORM HIGHLIGHTS" panel** | Four quadrants reading Live / Europe / Real-Time / Official. It communicates nothing. |
| **Two equal CTAs** | "View Live Matches" and "Explore Broadcast Guides" split intent, and neither is the real action. |
| **The actual product is missing** | There is no search field in the hero. The entire interaction model is lookup, and the only input is a small box in the header. |

### The direction

**A search-first hero.** One question, one input, immediate proof.

- Headline: **Where can I watch it?**
- A single prominent search field: *search a film, series, team or competition*
- Beneath it, live examples deliberately mixing verticals: a competition, a series, a fight
  card, a film.
- One concrete, checkable line of proof: availability for **139 countries** — a real figure
  from the TMDB regions endpoint.

Rationale, point by point:

- **The question as the headline.** It is the user's own words, it creates the exact
  curiosity gap the owner asked for, and it covers sport and film in five words.
- **Search as the hero element.** This is how every successful lookup product works —
  Google, IMDb, JustWatch. Putting the primary verb in the hero removes a navigation step.
- **Live examples mixing verticals.** A film title beside a competition is the fastest
  possible way to communicate scope. It demonstrates rather than asserts.
- **One concrete number instead of four vague badges.** A specific, checkable figure earns
  more trust than four adjectives.
- **A flat or gradient ground, not fanart.** Better contrast, better LCP, and no risk of a
  baseball graphic appearing above copy about football.

### The psychology, used honestly

The owner asked for techniques that make people scroll. The legitimate ones:

- **Curiosity gap** — a question headline opens a loop the page then closes.
- **Self-reference** — "from where I am" makes the answer personal; location-aware results
  are inherently about the reader.
- **Concrete over abstract** — a real number beats "global coverage" because it can be
  checked.
- **Demonstration over assertion** — show a real availability answer above the fold rather
  than claim accuracy.

What we do **not** use: fake scarcity, fake urgency, invented counts, countdown timers on
things that are not timed, or "trusted by N users" without a source. Those are the
techniques the previous business ran on, and they are incompatible with a reference brand.

---

## 3. Tokens — the discipline that is currently missing

Measured across `app/` and `components/`:

| Mechanism | Count |
|---|---|
| Hardcoded hex utilities | ~604 |
| Default Tailwind greys | 953 |
| Semantic tokens | ~188 |

**64 of 227 files carry hardcoded hex, including 20 of 35 page routes.** Editing
`globals.css` today repaints roughly a tenth of the site.

There is also colour drift — a dozen hand-typed variants of one intended surface colour,
including `#1a1a24`, `#1a1a2a`, `#1a1a2e`, `#1a1a28`, `#181824`, `#1b1b2f`, `#1f1f2e`.

**Rule: normalise, then tokenise.** Collapse the drift variants onto the canonical value
first; only then replace values with tokens. Tokenising before normalising guarantees
missed pages.

**Rule: new code uses semantic tokens only** — `bg-background`, `bg-surface`,
`text-muted-foreground`, `border-border`. Never a raw hex, never a default Tailwind grey.

---

## 4. shadcn/ui rules

The project already has shadcn configured (`components.json`, neutral base, lucide icons)
and **60 components** in `components/ui/`. Use them.

From `.agents/skills/shadcn`:

- **Use existing components before writing custom UI.** Search the registry first.
- **Compose, do not reinvent.** A filter panel is Tabs + Card + form controls.
- **Built-in variants before custom styles** — outline, sm, and so on.
- **Semantic colours only** — never a raw palette value.
- **className for layout, not for restyling** a component's colours or typography.
- **No space-x / space-y** — use flex with gap.
- **size-\* when width and height match** — `size-10`, not `w-10 h-10`.
- **truncate**, not the three-property longhand.
- **cn() for conditional classes**, not template-literal ternaries.

---

## 5. Icons

**lucide-react only.** No emoji anywhere — see OWNER-INSTRUCTIONS rule 5a. Mark an icon
`aria-hidden="true"` when adjacent text already says the same thing.

Never use a play triangle for availability. It implies playback we do not provide.

---

## 6. Animation — one hard rule, learned expensively

**An animation must never be able to hide content.**

`ScrollReveal` and `FadeIn` both paired viewport detection with a pre-mount branch that
never attached the ref. Framer's observer bound to nothing, the in-view flag stayed false
forever, and the transparent initial state was never animated away. Four homepage sections
sat invisible at full layout height, and `FadeIn` is used on eleven routes.

Consequently:

1. **No manual refs for viewport detection.** Use `whileInView` with `viewport`, which binds
   the observer to the motion element itself.
2. **The un-animated state must be visible.** Before mount, with JavaScript off, or under
   reduced-motion, children render plainly and fully opaque.
3. **Framer needs a mount guard** for hydration (Trouble Registry Bug 5) — but the guard's
   fallback is *visible*, never transparent.
4. **Honour reduced-motion** via `useReducedMotion`.

**Verification rule:** this class of bug is invisible to `curl` and to text extraction,
because transparent markup is still present in the HTML. Every server-side check passed
while the content was invisible. **Visual or computed-style checks are mandatory for UI
work.**

---

## 7. Enforcement — how a change reaches every page

The owner's standing requirement: no page or component is left on an old pattern.

When any rule in this file changes:

1. **Record it here first**, with the reason.
2. **Log it in [AUDIT-REGISTER.md](./AUDIT-REGISTER.md)** as a rule with a rollout status.
3. **Enumerate every affected file** — do not sample. Use the route inventory in
   `app/sitemap.ts` plus a search for the old pattern.
4. **Apply everywhere in one pass**, then re-search to prove zero remaining occurrences.
5. **Paste the proving command and its output** into the register. A rule is not rolled out
   until the count is zero.
