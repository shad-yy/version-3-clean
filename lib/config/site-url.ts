/**
 * Single source of truth for the site's identity.
 *
 * Everything that needs the domain, brand name, or support address reads from
 * here. Nothing else in the codebase should hardcode them.
 *
 * To point this codebase at a different domain, set these in the deployment
 * environment — no source change required:
 *
 *   NEXT_PUBLIC_SITE_URL=https://example.com
 *   NEXT_PUBLIC_SITE_NAME="Example"
 *   NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
 *
 * Kept deliberately dependency-free so it can be imported from server
 * components, route handlers, and plain Node scripts alike.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

/** Fallback used when no environment variable is set. */
const DEFAULT_SITE_URL = 'https://smartlivetv.co.uk'

/**
 * Canonical production origin, e.g. `https://example.com` — no trailing slash.
 *
 * Previously this was a hardcoded constant that production *overrode* the env
 * var with, which made a domain migration a source change across 14 files.
 */
export const PRODUCTION_SITE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
)

/** Brand name used in metadata, schema, and generated text. */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Smart Live TV'

/** Bare hostname, e.g. `example.com`. Used by IndexNow and generated copy. */
export const SITE_HOST = PRODUCTION_SITE_URL.replace(/^https?:\/\//, '')

/** Public support address. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || `support@${SITE_HOST}`

/**
 * Resolves the base URL used for canonicals, sitemap, and schema.
 *
 * Production pins to PRODUCTION_SITE_URL so preview deployments can never leak
 * a `*.vercel.app` canonical into the index.
 */
export function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL)
    : undefined

  if (process.env.VERCEL_ENV === 'production') {
    return PRODUCTION_SITE_URL
  }

  if (fromEnv?.includes('localhost') || fromEnv?.includes('127.0.0.1')) {
    return fromEnv
  }

  if (fromEnv && !fromEnv.includes('vercel.app')) {
    return fromEnv
  }

  return PRODUCTION_SITE_URL
}
