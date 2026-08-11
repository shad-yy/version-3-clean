"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  lazy?: boolean
  fallback?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  placeholder = "empty",
  blurDataURL,
  lazy = true,
  fallback = "/placeholder-logo.svg",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lazy || priority || shouldLoad) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: "50px", // Load images 50px before they come into view
        threshold: 0.1,
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, priority, shouldLoad])

  const errorFallback = useCallback(
    () => (
      <div
        className={cn("flex items-center justify-center bg-gray-800 text-gray-400 text-sm", className)}
        style={width && height ? { width, height } : undefined}
      >
        <span>Image unavailable</span>
      </div>
    ),
    [className, width, height],
  )

  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (!originalSrc || originalSrc.includes("placeholder.svg") || originalSrc === "/placeholder-logo.svg") {
      return fallback
    }

    // For external URLs, return as-is (Next.js Image will handle optimization)
    if (originalSrc.startsWith("http")) {
      return originalSrc
    }

    // For local images, ensure they exist or fallback
    return originalSrc || fallback
  }, [fallback])

  if (hasError) {
    return errorFallback()
  }

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {isLoading && shouldLoad && (
        <div
          className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center"
          style={width && height ? { width, height } : undefined}
        >
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}

      {shouldLoad && (
        <Image
          src={getOptimizedSrc(src) || "/placeholder.svg"}
          unoptimized={typeof src === 'string' && src.startsWith('http')}
          alt={alt}
          {...(fill ? {} : { width, height })}
          priority={priority}
          quality={quality}
          sizes={sizes}
          fill={fill}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", className)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          {...props}
        />
      )}

      {!shouldLoad && <div className={cn("bg-gray-800 animate-pulse", className)} style={width && height ? { width, height } : undefined} />}
    </div>
  )
}
