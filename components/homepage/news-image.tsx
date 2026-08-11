"use client"

import { useState } from "react"
import { Newspaper } from "lucide-react"

interface NewsImageProps {
  src: string
  alt: string
  className?: string
}

/**
 * Client-only wrapper so we can use onError (event handler) inside the
 * async Server Component `NewsSection` without violating RSC rules.
 */
export function NewsImage({ src, alt, className }: NewsImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface to-surface-elevated text-text-muted group-hover:scale-105 transition-transform duration-500 ease-out">
        <Newspaper className="w-12 h-12 mb-2 opacity-30" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
