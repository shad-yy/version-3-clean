"use client"
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Reveals its children as they scroll into view.
 *
 * **This component previously hid most of the homepage.** The old version called
 * `useInView(ref)` but returned a plain `<div>` on the first render, without attaching
 * `ref`. Framer sets its observer up in a mount effect, found `ref.current === null`,
 * and gave up. The later re-render attached the ref — but a ref assignment does not
 * re-run an effect, and `once: true` meant it never tried again. So `isInView` stayed
 * false permanently, `animate={{}}` left `initial={{ opacity: 0 }}` in place, and every
 * wrapped section sat invisible at full layout height.
 *
 * Two rules encoded here to stop it recurring:
 *
 *  1. **No manual ref.** `whileInView` + `viewport` attaches the observer to the motion
 *     element itself, so there is no ref that can be null at the wrong moment.
 *  2. **The un-animated state is VISIBLE.** Before mount, and with JavaScript disabled,
 *     children render plainly and fully opaque. An animation that fails to run must
 *     never be able to hide content — that failure mode is invisible to server-side
 *     checks, because opacity-0 markup is still present in the HTML.
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion()

  // Hydration guard (.cursorrules §2): Framer must not initialise during SSR.
  useEffect(() => setMounted(true), [])

  if (!mounted || reduceMotion) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
