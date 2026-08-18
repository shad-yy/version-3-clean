# Brand and domain strategy

Status: **recommendation, awaiting owner decision.** Nothing here is registered or
committed. Availability figures are a weak signal — see the caveat before acting.

---

## 1. Why the current name and domain both have to go

Two separate problems. One is a matter of taste; the other is structural.

### The domain is a hard geographic ceiling

`.co.uk` is a **true country-code TLD**. Google's documentation is explicit: a ccTLD is
"a strong signal ... that your site is explicitly intended for a certain country," and
that signal **cannot be overridden**. There is no setting, no `hreflang` arrangement and
no Search Console option that makes a `.co.uk` compete globally — the old international
targeting tool was deprecated, and it never applied to ccTLDs regardless.

So the current domain is structurally incapable of the thing the repositioning requires.
This is not a branding preference; it is arithmetic.

**A useful nuance:** Google treats a specific set of ccTLDs as *generic* —
`.ad .ai .as .bz .cc .cd .co .dj .fm .io .la .me .ms .nu .sc .sr .su .tv .tk .ws`.
**`.tv` is on that list.** It is therefore globally targetable *and* semantically ideal
for a watch-guide. That makes `.tv` a legitimate first-class option here, not a
compromise.

Source: [Managing multi-regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### The name describes a product we no longer are

"Smart Live TV" fails on four counts:

| Problem | Consequence |
|---|---|
| Three generic words | Nothing to own, nothing to trademark, no recall |
| "TV" | Anchors to television when the scope is sport, film, series and streaming |
| "Live" | Anchors to live events, excluding the entire on-demand film/TV half |
| Competes with "smart TV" | An unwinnable search collision with a hardware category |

It also carries the previous business's history, which is the whole reason this repo exists.

---

## 2. The naming criterion nobody would guess

**The name must not imply that we stream anything.**

This session removed false claims from two shipped pages — *"Stream every F1 race from
anywhere in the world"* and *"Smart Live TV includes all broadcast channels"* — because
this site transmits no video and resells no subscription. A name like *StreamHub*,
*WatchNow* or *PlayFinder* would reintroduce that exact falsehood **at the brand level**,
where it cannot be edited out of a paragraph.

Worse, it would attract the wrong audience. "Stream anything free" naming pulls in people
looking for pirate streams — precisely the legacy being escaped.

The brand should evoke **finding, guiding, knowing** — a reference work — not playback.

### The rest of the criteria

1. **Suggestive or arbitrary, not descriptive.** Descriptive marks are weak and often
   unregistrable. "WhereToWatch" is instantly understood and permanently unownable.
2. **Passes the radio test.** Spellable correctly on first hearing, no explanation.
3. **A gTLD, or a ccTLD on Google's generic list.**
4. **Covers both verticals equally.** A sports-coded name (*Fixture*, *Ringside*,
   *Kickoff*) fails the film half. A cinema-coded name fails the sport half.
5. **No country or language lock.**

---

## 3. Competitive reality

**The film/TV "where to watch" space is already owned.** JustWatch, Reelgood and
Letterboxd are established, well-funded and well-known. A name that reads as a JustWatch
clone invites a comparison we lose.

**The sports broadcast-guide space is fragmented** — mostly national listings sites.

**Nobody credibly does both, per country, in one place.** That gap is the wedge, and the
brand should sit in it rather than in either incumbent's territory.

---

## 4. Candidates

### Availability caveat — read this first

The only tool available in this environment is `nslookup`. A domain **with nameservers is
definitely registered**. The absence of nameservers is a **weak signal only** — a
registered but unconfigured or parked domain shows nothing. "No NS found" therefore means
*worth checking properly*, never *available*.

**Verify every candidate with a registrar and a trademark search before committing.**
Nothing below has been confirmed available, and no trademark clearance has been done.

### Shortlist

| Candidate | Domains with no NS found | Assessment |
|---|---|---|
| **Sightline** | `sightlinetv.com`, `sightline.watch`, `sightlineguide.com` | **Strongest.** An unobstructed view — clarity and authority. Reads like a data/reference product, implies no playback, covers both verticals. `sightline.io`/`.tv`/`getsightline.com` are taken, so an existing holder may have a mark in some class — clearance needed. |
| **FrontRow** | `frontrow.tv`, `frontrow.watch` | **Strong concept.** The best seat, equally true of a match and a film. Premium and aspirational. But "front row" is a common phrase with many existing uses, so trademark scope would be narrow. |
| **Airtime** | `airtime.watch` | Broadcast-scheduling term; fits sport well, film less so. `.com` and `.tv` both taken. |
| **Whatson** | `whatson.watch` | Very clear, but descriptive (weak mark) and reads dated and faintly British. |
| Fixture / Ringside | `fixture.watch`, `ringside.watch` | **Rejected** — sports-only, fail criterion 4. |

### Recommendation

**Sightline**, on `sightlinetv.com` or `sightline.watch`.

It satisfies every criterion including the non-obvious one: it suggests seeing clearly and
knowing where to look, without once implying we serve the video. It sounds like an
authority rather than an aggregator, which is what the content strategy is built on.

**FrontRow** is the strong alternative if the owner prefers warmth and mass-market
familiarity over authority.

---

## 5. What the owner has to do

1. **Choose a direction** — authority (*Sightline*) or popular appeal (*FrontRow*).
2. **Confirm availability at a registrar.** The NS probe above is not sufficient.
3. **Run a trademark search** in the relevant classes and territories. This is the step
   most likely to eliminate a favourite, and it is cheaper before launch than after.
4. **Register the domain**, then set the five environment variables in
   [SETUP-REQUIRED.md](./SETUP-REQUIRED.md) §1.1. The codebase is already fully
   parameterised — no source change is required.

Claude cannot register a domain, purchase anything, or give a legal clearance opinion.

---

## 6. Logo and icon

Deferred until the name is chosen — an identity designed around the wrong name is wasted
work. When it happens, the brief:

- Must read at 16px as a favicon and at billboard size.
- Must work in one colour.
- Must avoid the two clichés of this category: a play triangle (implies playback, which we
  do not do) and a television set (the scope is wider than TV).
- For *Sightline*, the natural marks are a horizon line, a sightline converging to a
  point, or an aperture.
