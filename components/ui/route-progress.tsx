"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * Navigation feedback, attached to the thing that was clicked.
 *
 * ## Why not a progress bar
 *
 * The first version drew a bar across the top of the viewport. It worked, and it was the
 * wrong idea: **a page-wide progress bar is a statement about the site**, and what it
 * states is "this is slow". People read it as lag even when the wait is 200ms, because a
 * loading bar is the thing they have learned to associate with waiting.
 *
 * What a reader actually needs to know is narrower: *did my click register?* That question
 * is about the link, not the page. So the feedback goes on the link — the element the
 * reader is already looking at, because they just pressed it.
 *
 * ## How it behaves
 *
 * The pressed link keeps its own text but gains a quiet amber underline that sweeps left
 * to right, and everything else on the page dims very slightly. The effect is that the
 * click "took", and the destination is coming — with no widget claiming the site is busy.
 *
 * Nothing appears for the first 140ms. Most in-app navigations resolve faster than that,
 * and a flash of feedback on an instant navigation is itself a kind of jitter.
 *
 * Under `prefers-reduced-motion` the sweep becomes a static underline: the information
 * survives, the movement does not.
 */

const SHOW_AFTER_MS = 140
const ATTR = "data-navigating"

export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const marked = useRef<HTMLElement | null>(null)

  function clear() {
    if (timer.current) clearTimeout(timer.current)
    marked.current?.removeAttribute(ATTR)
    marked.current = null
    document.documentElement.removeAttribute(ATTR)
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as HTMLElement | null)?.closest?.("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#")) return
      if (anchor.target && anchor.target !== "_self") return
      if (anchor.hasAttribute("download")) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // Same page: nothing is going to change, so nothing should be announced.
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return
      }

      clear()
      timer.current = setTimeout(() => {
        anchor.setAttribute(ATTR, "")
        marked.current = anchor
        // The root flag lets the rest of the page recede a little without every component
        // needing to know a navigation is in progress.
        document.documentElement.setAttribute(ATTR, "")
      }, SHOW_AFTER_MS)
    }

    document.addEventListener("click", onClick, { capture: true })
    return () => {
      document.removeEventListener("click", onClick, { capture: true })
      clear()
    }
  }, [])

  // Arrived: drop the feedback.
  useEffect(() => {
    clear()
    // A query-only change is still a navigation, so both are dependencies.
  }, [pathname, searchParams])

  return null
}
