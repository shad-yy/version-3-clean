"use client"
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  once?: boolean
}

const OFFSETS = {
  up: { y: 30, x: 0 },
  down: { y: -30, x: 0 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
  none: { x: 0, y: 0 },
} as const

/**
 * Fades its children in when they scroll into view.
 *
 * Carried the same defect as `components/ui/scroll-reveal.tsx` — see the long note
 * there for the mechanism. In short: `useInView(ref)` was paired with a pre-mount
 * branch that never attached `ref`, so the observer never bound and `isInView` was
 * permanently false. This version was worse than ScrollReveal's, because its
 * `animate` branch explicitly resolved to `{ opacity: 0 }` rather than an empty
 * object, actively holding the content hidden.
 *
 * It is used on eleven routes including `/about`, `/faq`, `/contact`, `/privacy`,
 * `/terms`, `/blog`, `/news` and four competition guides.
 *
 * The two rules from ScrollReveal apply identically: no manual ref, and the
 * un-animated state must be visible.
 */
export function FadeIn({
  children, delay = 0, direction = 'up', className, once = true
}: FadeInProps) {
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => setMounted(true), [])

  if (!mounted || reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const offset = OFFSETS[direction]

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
