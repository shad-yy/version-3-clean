"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * `next/image` with a graceful failure state.
 *
 * ## The deadlock this used to have
 *
 * The previous version gated rendering behind `shouldLoad`, set by an IntersectionObserver
 * watching the wrapper element with `threshold: 0.1`:
 *
 * ```
 * const [shouldLoad, setShouldLoad] = useState(!lazy || priority)   // false by default
 * ...
 * {shouldLoad && <Image ... />}
 * ```
 *
 * The wrapper's only real content is the image the flag gates. With nothing inside, the
 * wrapper collapses to zero height, so it can never present 10% of itself to the observer,
 * so the flag never flips, so the image never renders — and the wrapper stays empty. **The
 * element was waiting for a size that only the element could produce.**
 *
 * The result was silent: markup rendered, layout looked intentional, and every team logo
 * and player photo on the site was simply absent. It survived because nothing errors — an
 * image that is never requested cannot fail.
 *
 * The observer is gone. `next/image` does lazy loading natively, at the browser level,
 * with no JavaScript and no state to deadlock. `priority` opts an image out for
 * above-the-fold artwork, which is the same control the old `lazy` prop was reaching for.
 */

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  /** @deprecated Native lazy loading is the default; pass `priority` to opt out. */
  lazy?: boolean
  fallback?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  placeholder = "empty",
  blurDataURL,
  fallback = "/placeholder-logo.svg",
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)

  const resolved =
    !src || src.includes("placeholder.svg") || src === "/placeholder-logo.svg" ? fallback : src

  if (hasError || !resolved) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-sl-raise text-[10px] uppercase tracking-[.08em] text-sl-dim",
          className,
        )}
        style={width && height ? { width, height } : undefined}
        aria-hidden="true"
      />
    )
  }

  return (
    <Image
      src={resolved}
      // Remote hosts not covered by next.config's remotePatterns would throw at render and
      // take the whole page with them, so third-party URLs bypass the optimiser.
      unoptimized={resolved.startsWith("http")}
      alt={alt}
      {...(fill ? {} : { width, height })}
      priority={priority}
      // Native browser lazy loading. No observer, nothing to deadlock.
      loading={priority ? undefined : "lazy"}
      quality={quality}
      sizes={sizes}
      fill={fill}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  )
}
