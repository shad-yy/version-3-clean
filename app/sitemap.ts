import { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { PRODUCTION_SITE_URL } from '@/lib/config/site-url'
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"


// Bumped only when the static content of these pages actually changes. Using build
// time here would tell Google every static page changed on every deploy, which
// devalues the signal.
const STATIC_PAGE_UPDATED = '2026-07-31T00:00:00.000Z'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = PRODUCTION_SITE_URL
  // Genuinely daily-changing pages keep a live timestamp.
  const now = new Date().toISOString()

  /*
   * "Where to watch in <country>" pages.
   *
   * Only the countries we have hand-verified sports rights for are listed. Every other
   * country renders on request and answers honestly, but a sitemap entry is a claim that
   * a page is worth crawling -- and a page whose sport section reads "we have not checked
   * this country" is not one we should be inviting Google to index at scale.
   */
  const verifiedCountries = [
    ...new Set(COMPETITION_RIGHTS.flatMap((c) => c.listings.map((l) => l.country.toLowerCase()))),
  ]

  return [
    { url: `${baseUrl}/`, priority: 1.0, changeFrequency: 'daily', lastModified: now },
    ...verifiedCountries.map((code) => ({
      url: `${baseUrl}/where-to-watch/${code}`,
      priority: 0.9,
      changeFrequency: 'daily' as const,
      lastModified: now,
    })),
    { url: `${baseUrl}/watch/title`, priority: 0.9, changeFrequency: 'daily' as const, lastModified: now },
    { url: `${baseUrl}/scores`, priority: 0.95, changeFrequency: 'hourly' as const, lastModified: now },
    { url: `${baseUrl}/leagues`, priority: 0.9, changeFrequency: 'daily' as const, lastModified: now },
    { url: `${baseUrl}/teams`, priority: 0.8, changeFrequency: 'weekly' as const, lastModified: now },
    { url: `${baseUrl}/players`, priority: 0.7, changeFrequency: 'weekly' as const, lastModified: now },
    { url: `${baseUrl}/events`, priority: 0.8, changeFrequency: 'daily' as const, lastModified: now },
    { url: `${baseUrl}/search`, priority: 0.4, changeFrequency: 'monthly' as const, lastModified: STATIC_PAGE_UPDATED },
    { url: `${baseUrl}/watch`, priority: 0.9, changeFrequency: 'weekly' as const, lastModified: now },
    { url: `${baseUrl}/watch/premier-league`, priority: 0.9, changeFrequency: 'daily', lastModified: now },
    { url: `${baseUrl}/watch/la-liga`, priority: 0.9, changeFrequency: 'daily', lastModified: now },
    { url: `${baseUrl}/watch/bundesliga`, priority: 0.9, changeFrequency: 'daily', lastModified: now },
    { url: `${baseUrl}/watch/serie-a`, priority: 0.9, changeFrequency: 'daily', lastModified: now },
    { url: `${baseUrl}/watch/ligue-1`, priority: 0.9, changeFrequency: 'daily', lastModified: now },
    { url: `${baseUrl}/watch/champions-league`, priority: 0.9, changeFrequency: 'daily', lastModified: now },
    { url: `${baseUrl}/watch/world-cup-2026`, priority: 0.95, changeFrequency: 'daily' as const, lastModified: now },
    { url: `${baseUrl}/watch/europa-league`, priority: 0.85, changeFrequency: 'daily' as const, lastModified: now },
    { url: `${baseUrl}/watch/formula-1`, priority: 0.85, changeFrequency: 'weekly' as const, lastModified: now },
    { url: `${baseUrl}/ufc`, priority: 0.8, changeFrequency: 'weekly', lastModified: now },
    { url: `${baseUrl}/news`, priority: 0.8, changeFrequency: 'daily', lastModified: now },
    { url: `${baseUrl}/blog`, priority: 0.7, changeFrequency: 'weekly', lastModified: now },
    // Help answers high-intent queries with no good single answer elsewhere, so it is
    // ranked above the FAQ rather than beside it.
    { url: `${baseUrl}/help`, priority: 0.9, changeFrequency: 'monthly' as const, lastModified: STATIC_PAGE_UPDATED },
    { url: `${baseUrl}/faq`, priority: 0.8, changeFrequency: 'monthly' as const, lastModified: STATIC_PAGE_UPDATED },
    { url: `${baseUrl}/about`, priority: 0.5, changeFrequency: 'monthly', lastModified: STATIC_PAGE_UPDATED },
    { url: `${baseUrl}/contact`, priority: 0.5, changeFrequency: 'monthly', lastModified: STATIC_PAGE_UPDATED },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: 'yearly', lastModified: STATIC_PAGE_UPDATED },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: 'yearly', lastModified: STATIC_PAGE_UPDATED },
    // llms.txt and llms-full.txt are machine-readable resources for AI crawlers, not
    // pages for the Google index. They stay reachable at their URLs and are linked
    // from robots.txt and <head>, but they do not belong in the sitemap.
    ...BLOG_POSTS.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}

