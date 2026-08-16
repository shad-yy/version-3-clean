"use client"

import { useEffect, useState } from "react"
import { formatKickoff, toIsoString } from "@/lib/utils/datetime"

/**
 * Renders a timestamp in the viewer's own timezone.
 *
 * **Why this is not just `toLocaleTimeString`.** A server component has no way to
 * know the viewer's zone, so anything it renders is a guess. The page this replaced
 * guessed British Summer Time — it printed a literal `BST` next to a value that is
 * actually UTC, which was wrong for every visitor outside Britain and wrong for
 * British visitors too between November and March, when the country is on GMT.
 *
 * **The hydration constraint.** Localising during the first client render would make
 * that render disagree with the server's HTML and produce a hydration mismatch. So
 * the first client render deliberately reproduces the server's output exactly — the
 * UTC value — and the switch to local time happens in an effect, after hydration has
 * committed. Server HTML and first client paint agree; the viewer sees their own
 * time a tick later.
 *
 * The machine-readable value always sits in `dateTime`, so crawlers and assistive
 * technology get an unambiguous instant regardless of what is painted.
 */
export function LocalTime({
  value,
  className,
}: {
  /** Anything Date can parse. Values from TheSportsDB are UTC. */
  value: string | number | Date
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const iso = toIsoString(value)
  if (!iso) return null

  // Before mount: UTC, explicitly labelled. After: the viewer's zone, with the
  // abbreviation supplied by Intl rather than hardcoded.
  const text = mounted
    ? formatKickoff(value)
    : formatKickoff(value, { timeZone: "UTC" })

  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  )
}
