import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/config/site-url"

/**
 * Open Graph metadata builder.
 *
 * **Why this exists — Next.js metadata does not deep-merge.**
 *
 * A route's `metadata` export *replaces* the parent's value for each top-level key
 * rather than merging into it. So a page that declares:
 *
 *     openGraph: { title, description }
 *
 * does not inherit `type`, `locale`, `siteName` or `images` from the root layout —
 * it discards them. This was measured, not assumed: the homepage's served HTML
 * carried exactly two OG tags (`og:title`, `og:description`) while `twitter:image`
 * survived, because the homepage overrode `openGraph` but not `twitter`.
 *
 * The visible consequence was that sharing the homepage on any social platform
 * produced a card with no image.
 *
 * Route metadata should call this rather than writing an `openGraph` object by hand,
 * so the site-wide defaults survive the override.
 */

/** Site-wide share image. 1200x630 is the size every major platform crops to. */
export const DEFAULT_OG_IMAGE = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
} as const

type OpenGraph = NonNullable<Metadata["openGraph"]>

export interface OpenGraphInput {
  title: string
  description: string
  /** Absolute or root-relative URL of this page. */
  url?: string
  /** Defaults to the site-wide share image. Pass a specific one where it helps. */
  images?: OpenGraph["images"]
  /** "website" for most pages, "article" for blog posts. */
  type?: "website" | "article"
  /** Article-only fields, ignored for type "website". */
  publishedTime?: string
  modifiedTime?: string
}

export function buildOpenGraph({
  title,
  description,
  url,
  images,
  type = "website",
  publishedTime,
  modifiedTime,
}: OpenGraphInput): OpenGraph {
  const base = {
    title,
    description,
    siteName: SITE_NAME,
    // Region-neutral. This site targets no single market, so the locale carries a
    // language only — never "en_GB". See memory-bank/OWNER-INSTRUCTIONS.md rule 3.
    locale: "en",
    images: images ?? [DEFAULT_OG_IMAGE],
    ...(url ? { url } : {}),
  }

  if (type === "article") {
    return {
      ...base,
      type: "article",
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    }
  }

  return { ...base, type: "website" }
}
