"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Thumbnail for an image on a host we do not control.
 *
 * ## Why this is not `next/image`
 *
 * A deliberate exception to the rule that all artwork goes through the image pipeline
 * (OWNER-INSTRUCTIONS §5i), and the only one in the codebase.
 *
 * `next/image` requires every remote host to be whitelisted in `next.config.mjs`. That
 * works for TMDB and TheSportsDB, which serve everything from one origin each. It does not
 * work for news: a single request returned five articles whose images came from five
 * unrelated publisher CDNs, and the set changes with every story. Whitelisting is not
 * possible, and a `hostname: "**"` wildcard would turn the optimiser into an open image
 * proxy for any URL an upstream feed happens to return.
 *
 * So these load directly from the publisher, with:
 *
 *  - **`loading="lazy"` and explicit dimensions**, so they cost nothing until scrolled to
 *    and reserve their space rather than shifting the layout when they arrive.
 *  - **`referrerPolicy="no-referrer"`**, so browsing this site is not reported to every
 *    publisher whose thumbnail appears on it.
 *  - **An error fallback.** Third-party images rot — hotlink protection, expiry, moved
 *    files. On failure the slot collapses to a designed blank instead of a broken-image
 *    icon, which is the whole reason this is a client component.
 */

export function RemoteThumb({
  src,
  width,
  height,
  className,
}: {
  src?: string | null
  width: number
  height: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-[4px] border border-sl-line bg-sl-surface",
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    >
      {src && !failed && (
        <img
          src={src}
          alt=""
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      )}
    </span>
  )
}
