import type { Metadata } from "next"
import Link from "next/link"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import { PageShell, PageHeader, Section } from "@/components/sightline/page-shell"

/**
 * Help and questions.
 *
 * This page replaced one that was wrong in ways worth naming, because the same mistakes
 * are easy to reintroduce:
 *
 *  - It opened by calling the site "a live scores hub". The site is not a scores product;
 *    it answers where something can be watched.
 *  - It claimed scores were "refreshed automatically every 60 seconds". Nothing in the
 *    codebase refreshes on that interval. It was a number with no source.
 *  - It said broadcast listings "reference the official UK rights holders" — the single
 *    most limiting sentence available to a site whose premise is per-country answers.
 *  - It invited readers to "contact our support team anytime". There is no support team.
 *
 * The questions below are grouped by what a reader is trying to do, not by topic. Most
 * people arriving here are not curious about the site; they are stuck on one specific
 * problem, usually "why can I not watch this", and the order reflects that.
 */

const TITLE = "Help and questions"
const DESCRIPTION =
  "Why a match or title is not available where you are, why the channel differs by country, why kick-off times look wrong, and where our listings come from."

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${ENV.BASE_URL}/faq` },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: `${ENV.BASE_URL}/faq`,
  }),
}

/** An internal link styled as prose, not as a button. */
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sl-text underline decoration-sl-dim underline-offset-2 transition-colors duration-[.16s] hover:decoration-sl-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[3px]"
    >
      {children}
    </Link>
  )
}

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-sl-hair py-6 first:border-t-0 first:pt-0">
      <h3 className="mb-2 max-w-[640px] text-[17px] font-medium leading-[1.35] tracking-[-0.014em] text-sl-text">
        {q}
      </h3>
      <div className="max-w-[640px] space-y-3 text-[14px] leading-[1.62] text-sl-mid">
        {children}
      </div>
    </div>
  )
}

export default function FaqPage() {
  const country = getViewerCountry()
  const where = countryLabel(country)

  /*
   * Only questions whose answers are self-contained go in the schema. A question whose
   * real answer is "it depends on your country" makes a poor rich result: it would be
   * indexed as a flat claim and read back to the people it is wrong for.
   */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${ENV.BASE_URL}/faq#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "Why is a match shown on a different channel in each country?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Broadcast rights are sold country by country, not globally. A competition signs a separate agreement in each territory, so the same fixture can be on a subscription channel in one country, free-to-air in another, and unavailable in a third. Rights also run in cycles of several years, which is why a channel can change between seasons.",
        },
      },
      {
        "@type": "Question",
        name: "Why is a match not being shown in my country at all?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Three common reasons: no broadcaster bought the rights in that territory; the rights were bought but that particular fixture was not selected for live coverage; or a scheduling rule blocks it, such as the Saturday afternoon blackout used in the United Kingdom to protect attendance at lower-league grounds.",
        },
      },
      {
        "@type": "Question",
        name: "Why does the kick-off time look wrong?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kick-off times are published in the competition's local time and then converted. Daylight saving starts and ends on different dates in different countries, so for a few weeks each spring and autumn the offset between two countries is not the one people expect.",
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

  return (
    <PageShell>
      <SchemaMarkup schema={faqSchema} />

      <PageHeader
        eyebrow="Help"
        title={TITLE}
        intro="Most people arrive here stuck on one question — why they cannot watch something. Those answers come first."
      />

      <Section title="Why can I not watch this?">
        <QA q="Why is a match not being shown in my country at all?">
          <p>There are three usual reasons, and they are genuinely different problems.</p>
          <p>
            <strong className="font-medium text-sl-text">Nobody bought the rights there.</strong>{" "}
            A competition sells its coverage territory by territory. Smaller markets are
            sometimes left without a buyer for a season.
          </p>
          <p>
            <strong className="font-medium text-sl-text">
              The rights exist, but this fixture was not picked.
            </strong>{" "}
            Most contracts cover a set number of live matches per season rather than all of
            them. The rest are played without cameras, or appear only as highlights.
          </p>
          <p>
            <strong className="font-medium text-sl-text">A scheduling rule blocks it.</strong>{" "}
            The best-known is the Saturday afternoon blackout in the United Kingdom, which
            exists to protect attendance at lower-league grounds —{" "}
            <A href="/blog/saturday-3pm-blackout-explained">
              we explain how that rule works
            </A>
            .
          </p>
        </QA>

        <QA q="Why is it on a different channel than it was last season?">
          <p>
            Rights are sold in cycles, usually three years. When a cycle ends the
            competition runs a fresh auction and the winner can change, which is how a
            competition moves between broadcasters with no warning to viewers.
          </p>
          <p>
            It is also the honest reason a site like this one has to carry dates. A listing
            that was right in one season can be wrong in the next, so every listing we
            publish says when a person last confirmed it.
          </p>
        </QA>

        <QA q="Why can a film be on one service here and a different one elsewhere?">
          <p>
            For the same reason as sport, on a shorter cycle. Streaming rights are licensed
            per country and often for a fixed window, so a title can leave one service and
            appear on another partway through a year, or be available to buy in one country
            and only to rent in the next.
          </p>
          <p>
            <A href="/blog/why-different-channel-every-country">
              The longer explanation is here
            </A>
            .
          </p>
        </QA>

        <QA q="Why does the kick-off time look wrong?">
          <p>
            Times are published in the competition&apos;s local time and converted from
            there. The catch is daylight saving: it starts and ends on different dates in
            different countries, so for a few weeks each spring and autumn the gap between
            two countries is an hour off what people are used to.
          </p>
          <p>
            <A href="/blog/kick-off-times-timezones-explained">
              Worked examples are here
            </A>
            .
          </p>
        </QA>
      </Section>

      <Section title="How we know">
        <QA q="Where do the listings come from?">
          <p>
            Broadcast listings are compiled from rights holders&apos; own published
            schedules. Rights are sold country by country and change between seasons, so
            confirm with the broadcaster before relying on one.
          </p>
          <p>
            Film and television availability comes from TMDB&apos;s watch-provider data,
            which is powered by JustWatch and covers well over a hundred countries.
            Fixtures, squads and results come from TheSportsDB.
          </p>
        </QA>

        <QA q="How current is it?">
          <p>
            It depends on what is being asked, and the honest answer is that the parts move
            at different speeds. Film and television availability is refreshed every six
            hours. Reference data — competitions, teams, people — changes rarely and is
            held for days at a time.
          </p>
          <p>
            Broadcast listings are the slowest of all: rights are sold on multi-year cycles
            and change between seasons rather than by the minute. They are compiled rather
            than polled, so treat them as a starting point and confirm with the broadcaster
            for anything you would be disappointed to miss.
          </p>
        </QA>
      </Section>

      <Section title="What this site does and does not do">
        <QA q={`Does ${SITE_NAME} stream anything?`}>
          <p>
            No. It lists where things are shown. It transmits no video, sells no
            subscription and bundles nobody&apos;s channels. If you find a site claiming to
            be us and offering streams, it is not us.
          </p>
        </QA>

        <QA q="Why do you not link straight to the stream?">
          <p>
            Our film and television source provides availability but not per-title play
            links, so a &quot;watch now&quot; button would have to be guessed. A link that
            lands on the wrong page, or on a service you are not signed in to, is worse
            than naming the service and letting you open it yourself.
          </p>
        </QA>

        <QA q={`Why does the site say "${where}"?`}>
          <p>
            Because the answer depends on it. Where we have not been able to work out the
            country, the site says so rather than assuming, and you can set it yourself
            from the control in the heading on the home page. That choice is stored in your
            own browser.
          </p>
        </QA>

        <QA q="Something here is wrong. How do I tell you?">
          <p>
            Please do — a wrong listing is the worst thing this site can publish.{" "}
            <A href="/contact">
              Send us the competition, the country and what you are seeing
            </A>
            , and it goes to the top of the queue to be re-checked by hand.
          </p>
        </QA>
      </Section>

      <Section>
        <p className="max-w-[620px] text-[13px] leading-[1.55] text-sl-mute">
          Still looking for something?{" "}
          <A href="/search">Search for a film, series, team or competition</A>, browse{" "}
          <A href="/watch">the competition guides</A>, or read{" "}
          <A href="/blog">the explainers</A>.
        </p>
      </Section>
    </PageShell>
  )
}
