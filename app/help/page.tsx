import type { Metadata } from "next"
import Link from "next/link"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { HELP_TOPICS } from "@/lib/data/help-topics"
import { PageShell, PageHeader, Section } from "@/components/sightline/page-shell"

/**
 * Help — the questions people actually ask when they cannot find something to watch.
 *
 * Built from recurring forum and help-centre patterns rather than invented: why a match is
 * not on locally, which channel has it, why a catalogue differs by country, why a listing
 * went stale, and the VPN question.
 *
 * Each answer is written to stand alone, because most readers will land on one of these
 * from a search engine and never see the rest of the site. That is also the point
 * commercially: these are high-intent queries with no good single answer anywhere, which
 * is exactly the traffic this product is built to earn.
 *
 * `FAQPage` schema is emitted so the answers can be read directly by search and answer
 * engines. The schema answers are the same sentences a reader sees — never a longer or
 * more confident version written for machines.
 */

const TITLE = "Help — why can I not watch this?"
const DESCRIPTION =
  "Why a match is not on television where you are, which channel carries it, why a streaming catalogue differs by country, and what to do when a listing has gone stale."

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${ENV.BASE_URL}/help` },
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, url: `${ENV.BASE_URL}/help` }),
}

export const revalidate = 86400

export default function HelpPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${ENV.BASE_URL}/help#faq`,
    mainEntity: HELP_TOPICS.map((t) => ({
      "@type": "Question",
      name: t.question,
      acceptedAnswer: { "@type": "Answer", text: t.short },
    })),
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/help#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Help", item: `${ENV.BASE_URL}/help` },
    ],
  }

  return (
    <PageShell>
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={breadcrumb} />

      <PageHeader
        eyebrow="Help"
        title="Why can I not watch this?"
        intro="The questions that come up most when something is missing — and honest answers, including where the answer is that we do not know."
      />

      <Section>
        <div className="flex flex-col gap-4">
          {HELP_TOPICS.map((topic, i) => (
            <article
              key={topic.slug}
              id={topic.slug}
              className="scroll-mt-24 rounded-[8px] border border-sl-line bg-sl-panel p-5 lg:p-6"
              style={{
                animation: `fadeRise .5s cubic-bezier(.2,.7,.3,1) ${i * 75}ms both`,
              }}
            >
              <p
                className={
                  topic.category === "Sport"
                    ? "font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-amber"
                    : topic.category === "Film & TV"
                      ? "font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-blue"
                      : "font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-mute"
                }
              >
                {topic.category}
              </p>

              <h2 className="mt-1.5 text-[19px] font-semibold tracking-[-0.02em] text-sl-text lg:text-[21px]">
                {topic.question}
              </h2>

              <div className="mt-3 flex flex-col gap-3">
                {topic.body.map((para, k) => (
                  <p key={k} className="max-w-[720px] text-[14px] leading-[1.65] text-sl-mid">
                    {para}
                  </p>
                ))}
              </div>

              {topic.links && topic.links.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-sl-hair pt-4">
                  {topic.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="text-[13px] text-sl-blue underline decoration-sl-dim underline-offset-2 transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50 rounded-[3px]"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <p className="max-w-[640px] text-[13px] leading-[1.6] text-sl-mute">
          Something wrong, or a question that is not here?{" "}
          <Link
            href="/contact"
            className="text-sl-mid underline decoration-sl-dim underline-offset-2 transition-colors duration-[.16s] hover:text-sl-text"
          >
            Tell us
          </Link>
          . Corrections are made by hand and recorded with the date, the same way every
          listing is.
        </p>
      </Section>
    </PageShell>
  )
}
