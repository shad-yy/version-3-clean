// SEO Schema components for news articles
import type { NewsArticle } from "@/lib/api/types"

interface NewsArticleSchemaProps {
  article: NewsArticle
  baseUrl?: string
}

export function NewsArticleSchema({ article, baseUrl = "https://smart-live-tv.vercel.app" }: NewsArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: article.urlToImage ? [article.urlToImage] : [],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author || article.source.name,
    },
    publisher: {
      "@type": "Organization",
      name: article.source.name,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface NewsCollectionSchemaProps {
  articles: NewsArticle[]
  baseUrl?: string
}

export function NewsCollectionSchema({ articles, baseUrl = "https://smart-live-tv.vercel.app" }: NewsCollectionSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sports News",
    description: "Latest sports news and updates",
    url: `${baseUrl}/news`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "NewsArticle",
          headline: article.title,
          description: article.description,
          image: article.urlToImage,
          url: article.url,
          datePublished: article.publishedAt,
        },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

