"use client"

interface LeagueBadgeProps {
  src?: string
  localSrc?: string
  alt: string
  size?: number
  className?: string
}

export function LeagueBadge({ 
  src, localSrc, alt, size = 32, className 
}: LeagueBadgeProps) {
  // Always prefer local file — no network dependency
  const imgSrc = localSrc || src || '/leagues/placeholder.svg'
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      onError={(e) => {
        const img = e.target as HTMLImageElement
        // Try remote fallback
        if (src && img.src !== src && !img.src.includes('placeholder')) {
          img.src = src
        } else {
          img.src = '/leagues/placeholder.svg'
        }
      }}
    />
  )
}
