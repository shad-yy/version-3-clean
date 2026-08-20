"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

/**
 * Renders children into `document.body`.
 *
 * Needed because of a genuinely subtle CSS rule: **`backdrop-filter` creates a containing
 * block for `position: fixed` descendants.** The site header carries
 * `backdrop-blur-[9px]`, so any fixed overlay rendered inside it is positioned against the
 * header's 62px box rather than the viewport.
 *
 * The symptom was a mobile menu that opened 61px tall with the page showing through it,
 * and a country picker that appeared as a strip across the top of the screen. Neither
 * looks like a positioning bug at first glance — they look like broken styling — which is
 * why this is worth a file of its own rather than a one-line `createPortal` somewhere.
 *
 * `transform`, `filter`, `perspective`, `contain: paint` and `will-change` on any ancestor
 * do the same thing. Any full-screen overlay in this codebase should go through here.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Portals need a DOM target, which does not exist during the server render. Rendering
  // null on the server is correct here: these are overlays, closed on first paint, so
  // nothing is lost from the server-rendered HTML.
  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  return createPortal(children, document.body)
}
