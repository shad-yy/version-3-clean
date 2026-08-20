import { Metadata } from "next"
import { Suspense } from "react"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { SchemaMarkup } from "@/components/SchemaMarkup"

import { Hero } from "@/components/sightline/hero"
import { RightsLedger } from "@/components/sightline/rights-ledger"
import { LiveNow } from "@/components/sightline/live-now"
import { ChangedAndUnknown } from "@/components/sightline/changed-and-unknown"
import { TrendingTitles } from "@/components/sightline/trending-titles"
import { UpcomingFights } from "@/components/sightline/upcoming-fights"
import { RailSkeleton } from "@/components/sightline/rail-skeleton"
import { DiscoveryDock } from "@/components/sightline/discovery-dock"
import { dockItemsFor } from "@/lib/data/verification-log"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"

/**
 * Homepage — design/sightline/HANDOFF.md §1.
 *
 * The structure is exactly the handoff's: hero carrying the question and the search
 * block, the verified-rights ledger, live now, then the two-column "what we changed /
 * what we do not know" footer.
 *
 * **Everything else was removed rather than restyled.** The previous homepage carried
 * service pillars, a spotlight carousel, a news section, match cards, league tables and a
 * recent-posts strip — around 1,400 lines of sections the handoff does not contain.
 * Recolouring them would have produced a page that matched the palette while
 * contradicting the layout, which is the opposite of following the design.
 *
 * That content still exists on the routes built for it: /scores, /events, /leagues,
 * /news and /blog. The homepage's job in this design is to ask one question and get the
 * reader to an answer, not to index everything the site holds.
 *
 * The discovery dock (§1.6) reads the verification log for things re-checked by hand in
 * the last day, in the reader's own country. At the cadence a person can actually verify
 * listings that set is usually empty, and the dock renders nothing at all when it is —
 * which is the intended resting state, not a failure. See DECISIONS.md.
 */

const TITLE = "Where can I watch it? Sport, film and TV by country"
const DESCRIPTION =
  "Find which service carries a match, film or series in your country. Live scores, fixtures and per-country availability, each with the date we last checked."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ENV.BASE_URL },
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, url: ENV.BASE_URL }),
}

export default async function HomePage() {
  // The dock shows only things re-verified by hand in the last day, in the reader's own
  // country. It renders nothing when that set is empty, which is the common case at a
  // low verification cadence -- announcing "0 verified" would be worse than absent.
  const viewerCountry = getViewerCountry()
  const dockItems = dockItemsFor(
    viewerCountry,
    COMPETITION_RIGHTS.map((c) => ({ id: c.id, name: c.name, href: c.href })),
  )

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${SITE_NAME}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${SITE_NAME} answers one question: where can I watch this, from where I am. It covers sport, film and television, naming the service that carries something in your country and the date that answer was last checked.`,
        },
      },
      {
        "@type": "Question",
        name: "How often is the information updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Scores, fixtures and league tables update continuously from live data. Broadcast rights are verified by hand and carry the date they were last confirmed, because rights change by rights cycle rather than by minute.",
        },
      },
      {
        "@type": "Question",
        name: `Does ${SITE_NAME} stream anything?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `No. ${SITE_NAME} lists where things are shown. It transmits no video, sells no subscription and bundles nobody's channels.`,
        },
      },
    ],
  }

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${ENV.BASE_URL}/#webpage`,
    name: TITLE,
    url: `${ENV.BASE_URL}/`,
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
    mainEntity: { "@id": `${ENV.BASE_URL}/#organization` },
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-sl-ground text-sl-text">
      {/* Organization and WebSite are declared once, site-wide, in app/layout.tsx.
          Only page-specific schema belongs here. */}
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={speakableSchema} />

      <Hero />
      <RightsLedger />
      <LiveNow />

      {/*
        Both rails hit an upstream (TMDB, ESPN) and are streamed rather than awaited, so a
        slow provider delays only its own strip instead of holding back the whole page.
        Each renders nothing at all when it has nothing to show, so neither can leave a
        titled but empty section behind.
      */}
      <Suspense fallback={<RailSkeleton kind="poster" />}>
        <TrendingTitles />
      </Suspense>

      <Suspense fallback={<RailSkeleton kind="card" />}>
        <UpcomingFights />
      </Suspense>

      <ChangedAndUnknown />

      <DiscoveryDock items={dockItems} countryName={countryLabel(viewerCountry)} />
    </div>
  )
}
