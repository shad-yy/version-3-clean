import type { Metadata } from "next"
import { notFound } from "next/navigation"
import sanitizeHtml from "sanitize-html"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { ENV } from "@/lib/config/env"
import { BlogPostLayout } from "@/components/blog/BlogPostLayout"

/**
 * Extract FAQ pairs from HTML content by finding <h3> headings
 * followed by <p> answer text within FAQ sections.
 */
function extractFaqFromHtml(html: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []

  // Find the FAQ section - look for content after "Frequently Asked Questions" heading
  const faqSectionMatch = html.match(/(<h[23][^>]*>\s*Frequently Asked Questions\s*<\/h[23]>)([\s\S]*)/i)
  if (!faqSectionMatch) return faqs

  const faqHtml = faqSectionMatch[2]

  // Match <h3>Question</h3> followed by <p>Answer</p> patterns
  const pairRegex = /<h3[^>]*>([^<]+)<\/h3>\s*<p>([\s\S]*?)(?=<h[23]|$)/gi
  let match
  while ((match = pairRegex.exec(faqHtml)) !== null) {
    const question = match[1].trim()
    // Strip HTML tags from the answer, keep text only
    const answer = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (question && answer) {
      faqs.push({ question, answer })
    }
  }

  return faqs
}

type BlogPostPageProps = {
  params: { slug: string }
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = BLOG_POSTS.find((item) => item.slug === params.slug)

  if (!post) {
    return {
      title: "Article Not Found | Blog",
      description: "The requested article could not be found.",
    }
  }

  const title = post.metaTitle || `${post.title} | Sightline`

  return {
    title,
    description: post.description,
    alternates: {
      canonical: `${ENV.BASE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description: post.description,
      type: "article",
      images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Sightline' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
      images: ['/og-default.png'],
    },
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = BLOG_POSTS.find((item) => item.slug === params.slug)
  if (!post) notFound()

  // Use the post's published date as dateModified (stable across builds)
  const dateModified = new Date(post.publishedAt).toISOString()

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified,
    author: {
      "@type": "Organization",
      name: "Sightline",
    },
    publisher: {
      '@id': `${ENV.BASE_URL}/#organization`,
    },
    isPartOf: {
      '@id': `${ENV.BASE_URL}/#website`,
    },
    url: `${ENV.BASE_URL}/blog/${post.slug}`,
  }

  // Auto-extract FAQ pairs for FAQPage schema (rich results)
  const faqs = extractFaqFromHtml(post.content)
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/blog/${post.slug}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${ENV.BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${ENV.BASE_URL}/blog/${post.slug}` },
    ],
  }

  // Derive tags from category for sidebar display
  const categoryTagMap: Record<string, string[]> = {
    'how-to': ['Streaming Guide', 'Sports TV', 'Broadcast Data'],
    'guides': ['Sports Data Guide', 'Sports Streaming', 'Setup'],
    'news': ['Sports News', 'Streaming', 'UK TV'],
    'comparison': ['Price Comparison', 'Sports Broadcasters', 'Streaming Value'],
  }

  return (
    <>
      <SchemaMarkup schema={articleSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      {faqSchema && <SchemaMarkup schema={faqSchema} />}

      <BlogPostLayout
        title={post.title}
        description={post.description}
        author="James Harper"
        authorTitle="Sports Streaming Expert"
        date={post.publishedAt}
        lastModified={post.publishedAt}
        readingTime={`${post.readTime} min read`}
        category={post.category}
        tags={categoryTagMap[post.category] ?? []}
      >
        {/* Article HTML rendered inside prose-blog styles from the layout */}
        {/*
          Sanitised before rendering. `sanitize-html` rather than isomorphic-dompurify:
          the latter pulls in jsdom, whose `default-stylesheet.css` asset is not emitted
          into the server bundle, and the build died collecting page data for this route.
          A previous commit replaced DOMPurify elsewhere for exactly this reason and missed
          this file.

          The allowlist is deliberately wider than the library default — the default drops
          headings, images and tables, which is most of what an article is made of.
        */}
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(post.content, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                "img", "h1", "h2", "figure", "figcaption",
              ]),
              allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ["src", "alt", "title", "width", "height", "loading"],
                "*": ["class", "id"],
              },
              // Block every scheme that can execute, javascript: above all.
              allowedSchemes: ["http", "https", "mailto"],
            }),
          }}
        />
      </BlogPostLayout>
    </>
  )
}
