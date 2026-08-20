import { cn } from "@/lib/utils"

/**
 * The Sightline mark — design/sightline/Sightline.dc.html §1d, option **ii. The Aperture**,
 * which carries the `PICK` badge in the design file.
 *
 * "Two brackets and a point: a sightline narrowed to one fact. Reads as punctuation —
 * quiet, unclaimed, and it collides with nothing in a tab strip."
 *
 * The other two marks were explicitly rejected and should not be reintroduced: *The Row*
 * becomes the hamburger glyph at 16px, and *The Bearing* reads as a generic globe.
 *
 * ## The design's own constraints, preserved
 *
 * - **No play triangle, no television.** The category clichés are the thing this mark
 *   exists to avoid.
 * - **One path, one colour**, and it survives 16px.
 * - **Optical correction below 20px.** The spec is "stroke 2.2 @ 24, optical 1.5 @ 16":
 *   at small sizes the geometry is pulled in and the stroke thickened, because a 2.2
 *   stroke scaled down disappears. That is why `small` is not just the same SVG at fewer
 *   pixels.
 * - The amber centre point is `fill`, never `stroke` — it is the fact being fixed on, and
 *   a stroked circle reads as a hole instead of a point.
 */

export function LogoMark({
  size = 22,
  className,
  /** Knocked out on an amber ground — favicon and app-icon use. */
  inverted = false,
}: {
  size?: number
  className?: string
  inverted?: boolean
}) {
  const stroke = inverted ? "#0b0d11" : "currentColor"
  const point = inverted ? "#0b0d11" : "var(--sl-amber, #f0a63c)"

  // Below 20px the mark is redrawn rather than scaled, per the spec's optical note.
  const small = size < 20

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={small ? 3 : 2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      {small ? (
        <>
          <path d="M8.5 4.5 4 12l4.5 7.5" />
          <path d="M15.5 4.5 20 12l-4.5 7.5" />
          <circle cx="12" cy="12" r="2.8" fill={point} stroke="none" />
        </>
      ) : (
        <>
          <path d="M8 4 3 12l5 8" />
          <path d="m16 4 5 8-5 8" />
          <circle cx="12" cy="12" r="2.4" fill={point} stroke="none" />
        </>
      )}
    </svg>
  )
}

/**
 * Mark plus wordmark, at the design's lockup measurements: 19px mark, 8px gap, Archivo
 * 600 at 17px with -0.02em tracking.
 *
 * The wordmark is set in sentence case ("Sightline"), not the uppercase the header
 * previously used. The design file draws it that way in every one of the three lockups.
 */
export function Logo({
  className,
  markSize = 19,
}: {
  className?: string
  markSize?: number
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={markSize} />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-sl-text">
        Sightline
      </span>
    </span>
  )
}
