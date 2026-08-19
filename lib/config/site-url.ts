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

/**
 * Local fallback. Deliberately NOT a real domain.
 *
 * This used to default to `https://smartlivetv.co.uk`, which is a **different
 * product on a different repo** — the commercial store. With that default, any
 * deployment missing `NEXT_PUBLIC_SITE_URL` would emit canonicals, sitemap
 * entries and schema `@id`s claiming the store's domain, telling Google this
 * site's content belongs to someone else's origin.
 *
 * A wrong canonical is not a cosmetic defect; it is the single most damaging
 * metadata error a site can ship. So the fallback is now localhost, which is
 * obviously non-production, and production refuses to guess at all.
 */
const DEV_SITE_URL = 'http://localhost:3200'

function resolveProductionOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return stripTrailingSlash(configured)

  // Fail loudly rather than silently canonicalising to the wrong domain.
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is not set. A production build must be told its own ' +
        'origin — it must never fall back to a default, because the wrong canonical ' +
        'attributes this site to another domain. Set it in the Vercel project settings.',
    )
  }

  return DEV_SITE_URL
}

/**
 * Canonical production origin, e.g. `https://example.com` — no trailing slash.
 *
 * Previously this was a hardcoded constant that production *overrode* the env
 * var with, which made a domain migration a source change across 14 files.
 */
export const PRODUCTION_SITE_URL = resolveProductionOrigin()

/**
 * Brand name used in metadata, schema and generated text. Still overridable per deployment, but the default is now the real name
 * rather than the inherited one -- the design handoff ships as Sightline.
 */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Sightline'

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
