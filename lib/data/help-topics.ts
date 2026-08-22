/**
 * The help section's content.
 *
 * ## Where these questions came from
 *
 * Not invented. These are the recurring patterns in what people actually ask when they
 * cannot find something to watch, gathered from forum and help-centre coverage of the
 * problem:
 *
 *  - *"Why is the game not on my local channel?"* — regional blackouts, which viewers
 *    consistently read as a fault rather than a rule.
 *  - *"Which channel is showing it?"* — rights split across several broadcasters in one
 *    country, so there is no single answer even domestically.
 *  - *"Why is this on Netflix in one country and not another?"* — territorial licensing,
 *    the single most-asked availability question there is.
 *  - *"It was there last month and now it is gone."* — licences expire on their own
 *    schedule, per territory.
 *
 * Each answer is written to be **useful on its own**, because most readers will arrive on
 * one of these from a search engine and never see the rest of the site. That also means
 * each has to be honest about the limits of what we know rather than selling the product.
 *
 * ## The one question answered by declining to answer it
 *
 * "Can I use a VPN to watch it anyway" is genuinely among the most-searched versions of
 * this problem. It is answered here plainly — what the restriction is and why it exists —
 * without instructions for getting around it. This site lists where things are legally
 * shown; walking someone through circumventing a licence would contradict the entire
 * reason it exists, and would put it back in the company of the products it was rebuilt
 * away from.
 */

export interface HelpTopic {
  slug: string
  /** Phrased as the reader would ask it — these are search queries. */
  question: string
  /** One-sentence answer, used as the summary and the FAQ schema answer. */
  short: string
  /** Full answer, in paragraphs. */
  body: string[]
  /** Related reading elsewhere on the site. */
  links?: { label: string; href: string }[]
  category: "Sport" | "Film & TV" | "Both"
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    slug: "match-not-on-tv",
    question: "Why is the match not on television where I am?",
    short:
      "Almost always because no broadcaster in your country bought the rights to it, or because a scheduling rule blocks it locally — not because the match is unavailable everywhere.",
    category: "Sport",
    body: [
      "Broadcast rights are sold country by country. A competition does not have one worldwide broadcaster; it has a different one in each market, and sometimes several splitting the fixtures between them. If nobody in your country bought a particular match, it is not shown there — while the same match is on television normally somewhere else.",
      "The second cause is a scheduling rule rather than a rights gap. Britain blocks live football between roughly 2.45pm and 5.15pm on Saturdays under UEFA Article 48, which England and Scotland are the only associations in Europe still using. Those fixtures are played, and broadcast in most other countries, and cannot be shown live in the country hosting them.",
      "So a missing broadcast is a statement about your location, not about the match. If we hold no listing for your country, we say so rather than naming a channel that will not carry it.",
    ],
    links: [
      { label: "How the 3pm blackout works", href: "/blog/saturday-3pm-blackout-explained" },
      { label: "Why the channel differs by country", href: "/blog/why-different-channel-every-country" },
    ],
  },
  {
    slug: "which-channel",
    question: "Which channel is showing it in my country?",
    short:
      "It depends on the fixture, not just the competition — rights are usually split into packages, so one competition can have three different broadcasters in a single country.",
    category: "Sport",
    body: [
      "Within one country, a competition's rights are rarely sold whole. They are broken into packages, split by kick-off slot, by pick order, or by platform, and different buyers take different packages. That is why following one league can require more than one subscription, and why the answer changes fixture by fixture rather than season by season.",
      "It is also why a competition guide that names a single broadcaster is usually wrong for some of its matches. We list the broadcaster per competition and per country, and where a competition is split we name each holder we have confirmed.",
      "Where we have not verified your country, we show nothing. A named broadcaster you cannot actually watch on is worse than an admitted gap — it costs you the kick-off.",
    ],
    links: [
      { label: "Competition guides", href: "/watch" },
      { label: "What is on now", href: "/scores" },
    ],
  },
  {
    slug: "kick-off-time-wrong",
    question: "The kick-off time looks wrong — which one is right?",
    short:
      "Fixture lists are published in the host country's local time, and the usual offset from yours is an hour out for a few weeks each spring and autumn.",
    category: "Sport",
    body: [
      "Almost every fixture list is published in the local time of the country hosting the match, or of the publisher — and those are often not the same. A time without a named zone beside it cannot be converted reliably.",
      "The trap is that countries change their clocks on different dates. The United States switches in mid-March and early November; the European Union switches at the end of March and end of October. For about three weeks each spring and one week each autumn, the offset most people carry in their head is wrong by an hour, in the direction that makes them miss kick-off.",
      "We render kick-off times in your own timezone, taken from your device, with the zone generated rather than hard-coded — a fixed label like \"BST\" is wrong for five months of the year even in Britain.",
    ],
    links: [{ label: "Kick-off times explained", href: "/blog/kick-off-times-timezones-explained" }],
  },
  {
    slug: "available-in-another-country",
    question: "Why is this film on a service in one country but not mine?",
    short:
      "Streaming catalogues are licensed territory by territory, so the same service genuinely has a different library in each country.",
    category: "Film & TV",
    body: [
      "A streaming service does not license a film once for the world. It licenses it per territory, and often cannot license it at all where a local broadcaster already holds an exclusive deal. The result is that the same service, with the same branding and the same subscription, carries a different catalogue in each country it operates in.",
      "Cost drives this as much as exclusivity. The same title can be worth very different amounts in different markets, so a service may buy it in one country and decline it in another.",
      "Licences also expire on their own schedule per territory. A title vanishing from your country while remaining in another is normal and is not an error on the service's part.",
    ],
    links: [{ label: "Browse titles", href: "/watch/title" }],
  },
  {
    slug: "listing-out-of-date",
    question: "You list a service but it is not there any more",
    short:
      "Rights cycles turn over constantly and out of step between countries, so any listing decays — which is why every one of ours carries the date it was checked.",
    category: "Both",
    body: [
      "Broadcast rights are sold on multi-year cycles that expire at different times in different markets. A competition can change hands in one country in a year when nothing changes anywhere else, and streaming licences lapse per territory on their own timetable.",
      "This is the reason every broadcast listing here carries the date a person last confirmed it. A listing without a date is asking you to trust a number that decays silently. With a date, you can judge for yourself how much weight it still carries.",
      "If you find one that has gone stale, telling us is genuinely useful — it is corrected by hand, and the correction is recorded rather than quietly swapped.",
    ],
    links: [{ label: "Contact us", href: "/contact" }],
  },
  {
    slug: "vpn-question",
    question: "Can I use a VPN to watch something not available here?",
    short:
      "We do not help with that. Availability is a licensing boundary, and this site's job is to tell you what legally carries something where you are.",
    category: "Both",
    body: [
      "This is one of the most-searched versions of the availability question, so it deserves a straight answer rather than silence.",
      "Geographic restrictions exist because rights are sold territory by territory. Working around one generally breaches the service's own terms of use, and it is not something we will walk you through — a site that lists where things are legally shown cannot also be a guide to getting around the licence. It would put us back among the products this one was deliberately built away from.",
      "What we can tell you is what is genuinely available where you are, including whether something is free to air rather than behind a subscription. Where the answer is that nothing carries it in your country, we say that plainly instead of implying a workaround.",
    ],
  },
  {
    slug: "no-listing-for-my-country",
    question: "Why do you show nothing for my country?",
    short:
      "Because we have not checked it yet. Broadcast rights here are confirmed by a person, one competition and one country at a time.",
    category: "Both",
    body: [
      "Our sports listings are not scraped or inferred. Someone opens the rights holder's own schedule, confirms what carries a competition in a given country, and records the date. That is slow, and it means our coverage is narrower than a site willing to guess.",
      "So an empty answer means we have not reached your country, not that the competition is unavailable there. It almost certainly has a broadcaster; we simply have not confirmed which, and would rather leave a gap than fill it with something plausible.",
      "Film and television availability works differently: it comes from a metadata provider covering 139 countries, so the coverage is far wider — but it carries no verification date, and we never describe it as verified. It is what the provider currently lists.",
    ],
    links: [{ label: "Availability by country", href: "/where-to-watch" }],
  },
]

export function getHelpTopic(slug: string): HelpTopic | null {
  return HELP_TOPICS.find((t) => t.slug === slug) ?? null
}
