"use client"

/**
 * ClientOnly — Prevents Framer Motion and other browser-only components
 * from causing hydration mismatches by only rendering children after mount.
 *
 * Usage:
 *   <ClientOnly fallback={<div className="animate-pulse h-10 bg-surface rounded" />}>
 *     <MotionComponent />
 *   </ClientOnly>
 */

import { ReactNode, useEffect, useState } from "react"

interface ClientOnlyProps {
  children: ReactNode
  /** Optional skeleton/placeholder to show during SSR and before hydration */
  fallback?: ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{fallback}</>

  return <>{children}</>
}
