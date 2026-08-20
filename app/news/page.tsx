import type { Metadata } from "next"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { RemoteThumb } from "@/components/sightline/remote-thumb"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { formatDate } from "@/lib/utils/datetime"
import {
  PageShell,
  PageHeader,
  Section,
  RowList,
  Row,
  EmptyState,
  RowSkeleton,
} from "@/components/sightline/page-shell"

/**
 * Sports news, rebuilt in Sightline.
 *
 * Deliberately a **list of links out**, not a reader. We do not own this journalism and
 * republishing it would be both a rights problem and a worse experience than the
 * publisher's own page. Each row names the outlet and goes there.
 *
 * The accent is left neutral rather than amber: news is not a live event, and the colour
 * law reserves amber for live sport. Using it here would dilute the one signal it carries.
 */

export const revalidate = 1800

const TITLE = "Sports news"
const DESCRIPTION =
  "Football and combat-sports headlines from established outlets, with a link to the original report."

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${ENV.BASE_URL}/news` },
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, url: `${ENV.BASE_URL}/news` }),
}

interface Article {
  article_id: string
  title: string
  image_url?: string | null
  link: string
  description?: string
  pubDate?: string
  source_name?: string
}

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${ENV.BASE_URL}/api/news`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.articles ?? []).filter((a: Article) => a.title && a.link)
  } catch {
    return []
  }
}

async function NewsList() {
  const articles = await getArticles()

  if (articles.length === 0) {
    return (
      <EmptyState title="No headlines right now">
        We could not load news just now. Nothing is wrong with your connection — we would
        rather show this than a list we cannot stand behind.
      </EmptyState>
    )
  }

  return (
    <Section
      title="Latest"
      aside={
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          {articles.length} stories
        </span>
      }
    >
      <RowList>
        {articles.map((a) => (
          <Row
            key={a.article_id}
            href={a.link}
            // News is the one surface where the image is the story. Every article in a
            // sample of five carried one, from five different publisher CDNs.
            thumb={<RemoteThumb src={a.image_url} width={72} height={54} />}
            lead={a.pubDate ? formatDate(a.pubDate.replace(" ", "T") + "Z") : undefined}
            leadSub={a.source_name?.slice(0, 16)}
            title={a.title}
            meta={a.description?.slice(0, 140)}
          />
        ))}
      </RowList>

      <p className="mt-6 text-[13px] leading-[1.55] text-sl-mute">
        Headlines are published by the outlets named. {SITE_NAME} links to the original
        report rather than reproducing it.
      </p>
    </Section>
  )
}

export default function NewsPage() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/news#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "News", item: `${ENV.BASE_URL}/news` },
    ],
  }

  return (
    <PageShell>
      <SchemaMarkup schema={breadcrumb} />
      <PageHeader
        eyebrow="News"
        title="What is being reported"
        intro="Headlines from established outlets, linked to the original. We do not rewrite other people's reporting."
      />
      <Suspense
        fallback={
          <Section title="Latest">
            <RowSkeleton rows={6} />
          </Section>
        }
      >
        <NewsList />
      </Suspense>
    </PageShell>
  )
}
