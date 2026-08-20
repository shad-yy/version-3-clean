import Image from "next/image"

/**
 * Portrait for a player or fighter.
 *
 * Separate from `TeamBadge` despite the similar shape, because the two want opposite
 * treatments: a crest must be `object-contain` and letterboxed, since cropping a badge
 * mangles it, while a portrait must be `object-cover` and cropped, since letterboxing a
 * face leaves it small and marooned in a box.
 *
 * TheSportsDB serves these from the same whitelisted origin as everything else, so unlike
 * `RemoteThumb` this goes through `next/image` normally.
 *
 * Falls back to initials. Provider coverage of player photography is patchy — far more so
 * than for crests — so the absent case is the common one and has to look deliberate.
 */

const SIZES = {
  sm: 32,
  md: 44,
  lg: 56,
} as const

export type PersonThumbSize = keyof typeof SIZES

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function PersonThumb({
  src,
  name,
  size = "md",
}: {
  src?: string | null
  name: string
  size?: PersonThumbSize
}) {
  const px = SIZES[size]

  if (!src) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full border border-sl-line bg-sl-surface font-mono text-sl-mute"
        style={{ width: px, height: px, fontSize: Math.round(px * 0.3) }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    )
  }

  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full border border-sl-line bg-sl-surface"
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        width={px}
        height={px}
        loading="lazy"
        className="size-full object-cover"
      />
    </span>
  )
}
