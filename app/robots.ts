import type { MetadataRoute } from 'next'
import { PRODUCTION_SITE_URL } from '@/lib/config/site-url'

export default function robots(): MetadataRoute.Robots {
  // Resolved from lib/config/site-url.ts, which falls back to a literal default
  // if no env var is set — a missing variable must never block Google.
  const baseUrl = PRODUCTION_SITE_URL
  
  return {
    rules: [
      {
        userAgent: [
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'Anthropic-ai',
          'ChatGPT-User',
          'Google-Extended'
        ],
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dev/',
        ],
        // Note: do NOT disallow /login — Google 
        // should be able to crawl it.
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
