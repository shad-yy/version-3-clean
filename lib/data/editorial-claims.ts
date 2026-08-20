/**
 * Sourced record of every factual assertion the site makes about the real world.
 *
 * `verification-log.ts` does this for broadcast listings. This does it for editorial
 * claims: results, records, statistics and announced dates. The two exist for the same
 * reason and follow the same rule — **a claim without provenance does not get published.**
 *
 * ## Why this file exists
 *
 * `/watch/world-cup-2026` published the 2026 World Cup final as "Spain 4–1 Argentina" and
 * called Spain champions "for the fifth time". The real result was 1–0 after extra time,
 * and it was Spain's second title. Both errors were live for roughly a month, and not
 * merely as visible text: the scoreline was in the page title, the OpenGraph description,
 * a `FAQPage` answer and a `SportsEvent` schema carrying a declared `winner` — four
 * machine-readable assertions handed to search and answer engines as fact.
 *
 * **The page was right about the winner, the opponent, the date and the venue.** That is
 * exactly what made it dangerous: a page wrong about everything gets caught, while a page
 * wrong about one number reads as authoritative. Nothing on it invited checking, because
 * nothing on it recorded where any of it came from.
 *
 * ## Rules
 *
 * - **Every claim carries at least one source**, and the source is a URL a reader can
 *   open. "I remember this" is not a source, and neither is another page on this site.
 * - **Results and records need two independent sources.** These are the claims that get
 *   repeated, embedded in schema and read aloud by answer engines. One source is one
 *   point of failure, and the failure above is what that costs. Enforced by
 *   `tests/editorial-claims.test.ts`, not by good intentions.
 * - **Cite only what was actually read.** A source that was searched for but never opened
 *   is not corroboration. If a page will not load — FIFA's own match pages render client
 *   side and return nothing to a fetch — it does not go in the list, however official it
 *   would have looked there.
 * - **Prefer the primary record**, then a wire service or an outlet of record, then an
 *   encyclopaedia. Never another aggregator; that is how one error becomes consensus.
 * - **Corrections append.** Fixing a claim means adding a source and updating the
 *   statement, never quietly editing a number. `supersedes` records what was wrong before.
 * - **Never generate entries automatically.** The whole value is that a person opened the
 *   source and read it.
 */

export type ClaimKind =
  /** The outcome of a fixture or tournament: scores, winners, margins. */
  | "result"
  /** A superlative or a count: "second title", "fastest", "most goals". */
  | "record"
  /** A measured quantity: attendance, appearances, goals scored. */
  | "statistic"
  /** An announced date: season starts, draw dates, fixture releases. */
  | "schedule"

/** Kinds that must be corroborated by two independent sources before publication. */
export const CORROBORATION_REQUIRED: ReadonlySet<ClaimKind> = new Set<ClaimKind>([
  "result",
  "record",
])

export interface ClaimSource {
  /** The publisher as a reader would recognise it, not a domain. */
  publisher: string
  /**
   * Headline of the specific article read.
   *
   * Required, and not merely for completeness: one publisher can be cited for two
   * different articles, and rendering both as "Wikipedia" reads to a visitor as a
   * duplication bug rather than as two sources.
   */
  title: string
  /** Absolute URL of the page that was actually opened and read. */
  url: string
  /** ISO date the source was consulted. */
  checkedAt: string
}

export interface EditorialClaim {
  /** Stable id, referenced from the page that renders the claim. */
  id: string
  /** The claim in one sentence, phrased as a reader would say it. */
  statement: string
  kind: ClaimKind
  sources: ClaimSource[]
  /** What this claim replaced, when it corrects a previously published error. */
  supersedes?: string
  note?: string
}

/**
 * The claims.
 *
 * Seeded with the World Cup final, because that is the page the mechanism was built for.
 * Both sources were opened and read directly. FIFA's own match page is deliberately absent
 * despite being the strongest available record: it renders client side and returns an
 * empty document to a fetch, so it was never actually read, and citing it would be the
 * same species of mistake this file exists to prevent.
 */
export const EDITORIAL_CLAIMS: EditorialClaim[] = [
  {
    id: "wc-2026-final-result",
    statement:
      "Spain beat Argentina 1–0 after extra time in the 2026 FIFA World Cup final on 19 July 2026 at MetLife Stadium, East Rutherford, New Jersey.",
    kind: "result",
    supersedes:
      'Published as "Spain 4–1 Argentina" from an unrecorded origin. Wrong scoreline; the winner, opponent, date and venue were correct.',
    sources: [
      {
        publisher: "CBS News",
        title: "Spain wins 2026 FIFA World Cup with grueling 1-0 victory over Argentina",
        url: "https://www.cbsnews.com/news/2026-fifa-world-cup-final-spain-argentina-sunday/",
        checkedAt: "2026-08-20",
      },
      {
        publisher: "Wikipedia",
        title: "2026 FIFA World Cup final",
        url: "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_final",
        checkedAt: "2026-08-20",
      },
    ],
  },
  {
    id: "wc-2026-final-goalscorer",
    statement:
      "Ferran Torres scored the only goal of the 2026 World Cup final in the 106th minute, early in the second period of extra time.",
    kind: "result",
    sources: [
      {
        publisher: "CBS News",
        title: "Spain wins 2026 FIFA World Cup with grueling 1-0 victory over Argentina",
        url: "https://www.cbsnews.com/news/2026-fifa-world-cup-final-spain-argentina-sunday/",
        checkedAt: "2026-08-20",
      },
      {
        publisher: "Wikipedia",
        title: "2026 FIFA World Cup final",
        url: "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_final",
        checkedAt: "2026-08-20",
      },
    ],
  },
  {
    id: "spain-world-cup-titles",
    statement:
      "The 2026 tournament was Spain's second World Cup title, their first since 2010.",
    kind: "record",
    supersedes:
      'Published as "world champions for the fifth time". Impossible on its face — Spain held one title going into the tournament, so no 2026 result could produce five.',
    note:
      "The self-contradiction is what exposed the wrong scoreline sitting next to it. A falsifiable claim next to an unfalsifiable one is worth more than either alone.",
    sources: [
      {
        publisher: "CBS News",
        title: "Spain wins 2026 FIFA World Cup with grueling 1-0 victory over Argentina",
        url: "https://www.cbsnews.com/news/2026-fifa-world-cup-final-spain-argentina-sunday/",
        checkedAt: "2026-08-20",
      },
      {
        publisher: "Wikipedia",
        title: "2026 FIFA World Cup final",
        url: "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_final",
        checkedAt: "2026-08-20",
      },
    ],
  },
  {
    id: "wc-2026-tournament-format",
    statement:
      "The 2026 World Cup was the first with 48 teams, expanded from 32, and the first hosted by three countries — Canada, Mexico and the United States. 104 matches were played, up from 64.",
    kind: "statistic",
    note:
      "A statistic rather than a record, so one source meets the rule. The page previously asserted the 48-team and 104-match figures with no source at all; they happened to be right, which is luck, not method.",
    sources: [
      {
        publisher: "Wikipedia",
        title: "2026 FIFA World Cup",
        url: "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup",
        checkedAt: "2026-08-20",
      },
    ],
  },
  {
    id: "kane-england-world-cup-record",
    statement:
      "Harry Kane passed Gary Lineker as England's leading World Cup goalscorer during the 2026 tournament. Lineker's record was 10 goals in 12 games, set across 1986 and 1990.",
    kind: "record",
    note:
      "Deliberately does not name the match in which the record was broken. TNT Sports reports the 11th goal came against Panama; England Football reports Kane equalled the record with a brace against Croatia and moved ahead against Paraguay. Two reputable sources disagree, so the site states what they agree on and nothing more.",
    sources: [
      {
        publisher: "TNT Sports",
        title:
          "Harry Kane becomes England's all-time record World Cup goalscorer after eclipsing Gary Lineker's record",
        url: "https://www.tntsports.co.uk/football/world-cup/2026/harry-kane-england-all-time-record-goalscorer-gary-lineker_sto23313876/story.shtml",
        checkedAt: "2026-08-20",
      },
      {
        publisher: "England Football",
        title: "Kane equals Lineker's record for most World Cup goals",
        url: "https://www.englandfootball.com/articles/2026/Jun/17/harry-kane-england-men-world-cup-goals-record-20261706",
        checkedAt: "2026-08-20",
      },
    ],
  },
  {
    id: "kane-world-cup-goal-tally",
    statement:
      "Harry Kane finished the 2026 World Cup on 14 goals in 18 matches, joint-fifth on the all-time men's World Cup scoring list.",
    kind: "record",
    supersedes:
      'A blog post published on 2026-06-28 froze the figure at 11 goals mid-tournament and was never updated. Accurate on the day, misleading by the time the tournament ended.',
    sources: [
      {
        publisher: "England Football",
        title: "Harry Kane chasing Ronaldo and Miroslav Klose in World Cup all-time scorers list",
        url: "https://www.englandfootball.com/articles/2026/Jul/10/harry-kane-top-five-world-cup-goalscorers-20261007",
        checkedAt: "2026-08-20",
      },
      {
        publisher: "FOX Sports",
        title: "All-Time World Cup Top Scorers: Mbappé Passes Messi, Who's Next On The List?",
        url: "https://www.foxsports.com/stories/soccer/world-cup-goal-scorers-all-time-messi-mbappe",
        checkedAt: "2026-08-20",
      },
    ],
  },
  {
    id: "world-cup-all-time-top-scorers",
    statement:
      "After the 2026 tournament, Kylian Mbappé leads the all-time men's World Cup scoring list with 22 goals, ahead of Lionel Messi on 21. Miroslav Klose, the previous record holder, has 16.",
    kind: "record",
    supersedes:
      'A blog post stated "the all-time World Cup top scorer is Miroslav Klose of Germany with 16 goals". Messi passed Klose during the 2026 group stage and Mbappé passed Messi in the third-place match.',
    note:
      "A volatile figure by nature, which is the argument for holding it in one place with a checked date rather than repeating it in prose across several posts.",
    sources: [
      {
        publisher: "FOX Sports",
        title: "All-Time World Cup Top Scorers: Mbappé Passes Messi, Who's Next On The List?",
        url: "https://www.foxsports.com/stories/soccer/world-cup-goal-scorers-all-time-messi-mbappe",
        checkedAt: "2026-08-20",
      },
      {
        publisher: "England Football",
        title: "Harry Kane chasing Ronaldo and Miroslav Klose in World Cup all-time scorers list",
        url: "https://www.englandfootball.com/articles/2026/Jul/10/harry-kane-top-five-world-cup-goalscorers-20261007",
        checkedAt: "2026-08-20",
      },
    ],
  },
]

/* ------------------------------------------------------------------ queries */

const BY_ID = new Map(EDITORIAL_CLAIMS.map((c) => [c.id, c]))

/**
 * One claim, or null.
 *
 * Returns null rather than throwing so a missing id degrades to an unsourced page rather
 * than a 500. `tests/editorial-claims.test.ts` asserts every id referenced from a page
 * exists, which is where a typo should be caught — at build, not at request time.
 */
export function getClaim(id: string): EditorialClaim | null {
  return BY_ID.get(id) ?? null
}

/** Several claims in one call, skipping any that are missing. */
export function getClaims(ids: string[]): EditorialClaim[] {
  return ids.map(getClaim).filter((c): c is EditorialClaim => c !== null)
}

/** Every distinct source behind a set of claims, de-duplicated by URL. */
export function sourcesFor(ids: string[]): ClaimSource[] {
  const seen = new Map<string, ClaimSource>()
  for (const claim of getClaims(ids)) {
    for (const source of claim.sources) {
      if (!seen.has(source.url)) seen.set(source.url, source)
    }
  }
  return [...seen.values()]
}

/** The most recent date any source behind these claims was consulted. */
export function lastCheckedFor(ids: string[]): string | null {
  const dates = sourcesFor(ids).map((s) => s.checkedAt)
  if (dates.length === 0) return null
  return dates.reduce((a, b) => (b > a ? b : a))
}

/** Claims that do not meet the corroboration rule for their kind. */
export function underCorroborated(): EditorialClaim[] {
  return EDITORIAL_CLAIMS.filter(
    (c) => CORROBORATION_REQUIRED.has(c.kind) && c.sources.length < 2,
  )
}
