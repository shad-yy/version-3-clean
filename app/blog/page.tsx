import type { Metadata } from "next"
import Link from "next/link"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { ENV } from "@/lib/config/env"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

export const metadata: Metadata = {
  title: "Sports Guides, Fixtures & TV Listings | Sightline",
  description:
    "Editorial guides to football, UFC and Formula 1 — kick-off times, competition formats, how broadcast rights work, and which official broadcaster carries each event in the countries we have verified.",
  alternates: { canonical: `${ENV.BASE_URL}/blog` },
}

const categoryClasses: Record<string, string> = {
  "how-to": "bg-sl-surface text-sl-mid border border-sl-line",
  guides: "bg-sl-surface text-sl-mid border border-sl-line",
  news: "bg-sl-surface text-sl-mid border border-sl-line",
  comparison: "bg-sl-surface text-sl-mid border border-sl-line",
}

export default function BlogIndexPage() {
  const featuredPosts = BLOG_POSTS.filter((post) => post.featured)
  const regularPosts = BLOG_POSTS.filter((post) => !post.featured)

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/blog#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${ENV.BASE_URL}/blog` },
    ],
  }

  return (
    <main className="min-h-screen bg-sl-ground pt-28 md:pt-36 pb-16 md:pb-20">
      <SchemaMarkup schema={breadcrumbSchema} />

      <FadeIn>
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="space-y-4 text-center">
            {/* Was "Sports Streaming Blog" / "watching every match from anywhere" —
                both implied a streaming service. This site publishes information. */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary">Guides &amp; Analysis</h1>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              How broadcast rights work, why availability changes at every border, and where to find
              the competitions you follow.
            </p>
          </div>
        </div>
      </section>
      </FadeIn>

      <FadeIn direction="up">
      <section className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {featuredPosts.map((post) => (
              <article key={post.slug} className="bg-[var(--sl-surface)] border border-white/10 rounded-2xl p-8">
                <div className="space-y-4">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${categoryClasses[post.category]}`}
                  >
                    {post.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-sl-text">{post.title}</h2>
                  <p className="text-sm text-sl-mute line-clamp-2">{post.description}</p>
                  <p className="text-sm text-sl-mute">
                    {post.readTime} min read • {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="text-sl-amber hover:text-sl-amber-hover font-semibold">
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </StaggerIn>
        </div>
      </section>
      </FadeIn>

      <FadeIn direction="up">
      <section className="py-16 md:py-20 border-t border-[var(--sl-line)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <StaggerIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {regularPosts.map((post) => (
              <article key={post.slug} className="bg-[var(--sl-surface)] border border-white/10 rounded-2xl p-6">
                <div className="space-y-4">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${categoryClasses[post.category]}`}
                  >
                    {post.category}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-sl-text">{post.title}</h2>
                  <p className="text-sm text-sl-mute line-clamp-2">{post.description}</p>
                  <p className="text-sm text-sl-mute">
                    {post.readTime} min read • {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="text-sl-amber hover:text-sl-amber-hover font-semibold">
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </StaggerIn>
        </div>
      </section>
      </FadeIn>
    </main>
  )
}
