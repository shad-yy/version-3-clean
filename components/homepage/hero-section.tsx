"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import Link from "next/link"
import { Check } from "lucide-react"
import { LiveStats } from "@/components/homepage/LiveStats"
import { useState, useEffect, useCallback, useRef } from "react"

// Curated high-quality sports imagery from TheSportsDB league fanart
// These are fallback images — we also try to load dynamic event images
const FALLBACK_HERO_IMAGES = [
  "https://r2.thesportsdb.com/images/media/league/fanart/xwqypw1421853005.jpg",   // Premier League
  "https://r2.thesportsdb.com/images/media/league/fanart/sqqxuw1421853008.jpg",   // PL fanart 2
  "https://r2.thesportsdb.com/images/media/league/fanart/tvywrr1421853012.jpg",   // PL fanart 3
  "https://r2.thesportsdb.com/images/media/league/fanart/rrsswu1421852498.jpg",   // La Liga
  "https://r2.thesportsdb.com/images/media/league/fanart/yvsuqp1421853038.jpg",   // Champions League
]

// Video sources — multiple fallbacks for reliability
// Using royalty-free sports/stadium atmosphere videos
const HERO_VIDEO_SOURCES = [
  "https://cdn.coverr.co/videos/coverr-football-players-on-the-field/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-crowd-at-a-soccer-match-7710/1080p.mp4",
]

/**
 * Checks if the user's connection supports video playback.
 * Falls back to image carousel on slow connections or when data saver is on.
 */
function useCanPlayVideo() {
  const [canPlay, setCanPlay] = useState(false)

  useEffect(() => {
    // Server-side: default to false
    if (typeof window === 'undefined') return

    const nav = navigator as any
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection

    if (connection) {
      // Skip video on slow connections or data saver
      if (connection.saveData) {
        setCanPlay(false)
        return
      }
      const effectiveType = connection.effectiveType
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        setCanPlay(false)
        return
      }
    }

    // Check for reduced motion preference
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setCanPlay(false)
      return
    }

    // On mobile, skip video by default for performance
    const isMobile = window.innerWidth < 768
    if (isMobile && connection?.effectiveType === '3g') {
      setCanPlay(false)
      return
    }

    setCanPlay(true)
  }, [])

  return canPlay
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [heroImages, setHeroImages] = useState<string[]>(FALLBACK_HERO_IMAGES)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canPlayVideo = useCanPlayVideo()

  // Mount guard — prevents SSR/client DOM mismatch for dynamic backgrounds
  useEffect(() => {
    setMounted(true)
  }, [])

  // Try to load dynamic event images from the spotlight API
  useEffect(() => {
    async function loadDynamicImages() {
      try {
        const res = await fetch('/api/spotlight')
        if (res.ok) {
          const data = await res.json()
          const dynamicImages = (data.heroImages || []).filter(Boolean)
          if (dynamicImages.length > 0) {
            setHeroImages([...dynamicImages, ...FALLBACK_HERO_IMAGES].slice(0, 6))
          }
        }
      } catch {
        // Fallback images already set
      }
    }
    loadDynamicImages()
  }, [])

  // Rotate images every 6 seconds (only when video isn't playing)
  useEffect(() => {
    if (videoLoaded && !videoError) return // Video is playing, skip carousel
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [heroImages.length, videoLoaded, videoError])

  // Handle video events
  const handleVideoCanPlay = useCallback(() => {
    setVideoLoaded(true)
  }, [])

  const handleVideoError = useCallback(() => {
    setVideoError(true)
    setVideoLoaded(false)
  }, [])

  const showVideo = canPlayVideo && !videoError

  return (
    <section className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden bg-[var(--sl-ground)] flex flex-col items-center justify-center">
      {/* ─── Dynamic backgrounds — only render after client hydration to prevent SSR mismatch ─── */}
      {mounted && (
        <>
          {/* Video Background (when supported) */}
          {showVideo && (
            <div className="absolute inset-0 z-0">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={heroImages[0]}
                onCanPlay={handleVideoCanPlay}
                onError={handleVideoError}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${
                  videoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ willChange: 'opacity' }}
              >
                {HERO_VIDEO_SOURCES.map((src, i) => (
                  <source key={i} src={src} type="video/mp4" />
                ))}
              </video>
            </div>
          )}

          {/* Fallback Image Carousel (when video isn't playing) */}
          {(!showVideo || !videoLoaded) && (
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <img
                    src={heroImages[currentImageIndex]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onLoad={() => setImagesLoaded(true)}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Static fallback background shown during SSR and before hydration */}
      {!mounted && (
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundImage: `url(${FALLBACK_HERO_IMAGES[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}

      {/* ─── Cinematic Gradient Overlays ─── */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        {/* Primary left-to-right readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--sl-ground)]/95 via-[var(--sl-ground)]/75 to-[var(--sl-ground)]/50" />
        {/* Bottom fade for seamless section transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--sl-ground)] via-[var(--sl-ground)]/30 to-transparent" />
        {/* Top fade for header integration */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--sl-ground)]/70 via-transparent to-transparent" />
        {/* Cinematic vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(10,10,15,0.6) 100%)'
        }} />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 z-[2]" />

      {/* Animated ambient glow particles */}
      <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-[var(--sl-amber)]/15 rounded-full blur-[60px] animate-pulse-slow z-[2]" />
      <div className="absolute bottom-[30%] right-[10%] w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] animate-pulse-slow z-[2]" style={{ animationDelay: '1s' }} />

      {/* ─── Content ─── */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-7xl pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">

          {/* LEFT COLUMN (60%) */}
          <div className="flex-1 lg:max-w-[60%] flex flex-col items-start text-left space-y-8">
            <div
              className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-[var(--sl-amber)]/30 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sl-amber)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--sl-amber)]" />
              </span>
              <span className="text-sl-text/90">Live Match Center & Broadcast Directory</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-sl-text leading-[1.1] drop-shadow-lg hero-speakable"
            >
              Live Sports Scores, Fixtures & <br className="hidden sm:inline" />
              <span className="text-[var(--sl-amber)]">Global Broadcast Guide</span>
            </h1>

            <p
              className="text-base sm:text-lg md:text-xl text-sl-mid max-w-xl font-normal leading-relaxed"
            >
              Track real-time scores, lineups, standings, and match schedules for Premier League, Champions League, La Liga, UFC, F1, and NBA. Find official broadcast channels worldwide.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
            >
              <ShimmerButton href="#live-scores" variant="primary"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg rounded-lg">
                View Live Matches ↓
              </ShimmerButton>
              <ShimmerButton href="/watch/premier-league" variant="ghost"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg rounded-lg">
                Explore Broadcast Guides →
              </ShimmerButton>
            </div>

            {/* Live Stats Ticker */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="w-full"
            >
              <LiveStats />
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="pt-2 w-full flex flex-wrap items-center justify-start gap-x-4 gap-y-3 text-xs sm:text-sm lg:text-base text-sl-mute font-semibold"
            >
              <span className="flex items-center gap-1.5 text-sl-mid"><Check className="w-4 h-4 text-[var(--sl-amber)]" strokeWidth={3} /> Real-Time Telemetry</span>
              <span className="hidden sm:inline text-sl-dim">|</span>
              <span className="flex items-center gap-1.5 text-sl-mid"><Check className="w-4 h-4 text-[var(--sl-amber)]" strokeWidth={3} /> Official Broadcast Networks</span>
              <span className="hidden sm:inline text-sl-dim">|</span>
              <span className="flex items-center gap-1.5 text-sl-mid"><Check className="w-4 h-4 text-[var(--sl-amber)]" strokeWidth={3} /> Verified Fixtures</span>
              <span className="hidden lg:inline text-sl-dim">|</span>
              <span className="flex items-center gap-1.5 text-sl-mid"><Check className="w-4 h-4 text-[var(--sl-amber)]" strokeWidth={3} /> Instant Updates</span>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (40%) */}
          <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-end">
            <motion.div
              initial={{ opacity: 0, x: 0, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              whileHover={{ rotate: 0 }}
              className="w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl lg:rotate-[-2deg]"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-sl-mute uppercase tracking-widest">Platform Highlights</span>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sl-amber)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--sl-amber)]" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { value: 'Live', label: 'Scores Updated Continuously' },
                  { value: 'Europe', label: 'Major Leagues Covered' },
                  { value: 'Real-Time', label: 'Lineups & Match Stats' },
                  { value: 'Official', label: 'UK TV Listings' },
                ].map(stat => (
                  <div key={stat.value} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="text-2xl font-black text-[var(--sl-amber)] leading-none">{stat.value}</div>
                    <div className="text-[11px] text-sl-mute font-medium mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                <div className="flex -space-x-2">
                  {[
                    { src: '/leagues/premier-league.png', alt: 'Premier League' },
                    { src: '/leagues/ufc.png', alt: 'UFC' },
                    { src: '/leagues/champions-league.png', alt: 'Champions League' },
                  ].map((league, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-[var(--sl-raise)] border-2 border-black/50 flex items-center justify-center p-1.5 relative flex-shrink-0">
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--sl-amber)] rounded-full border-2 border-[var(--sl-ground)] z-10" />
                      <img
                        src={league.src}
                        alt={league.alt}
                        width={28}
                        height={28}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-sl-mute uppercase tracking-wider">
                  Covered on Smart Live TV
                </span>
              </div>
            </motion.div>

            <div className="mt-8 flex items-center gap-3 bg-black/30 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-xs sm:text-sm text-sl-mute">
              <span className="w-2 h-2 rounded-full bg-[var(--sl-amber)] animate-pulse" />
              <span>
                Live Telemetry · Instant Lineups & Odds · Official Broadcast Networks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image rotation indicators — only shown after hydration when using image fallback */}
      {mounted && (!showVideo || !videoLoaded) && heroImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {heroImages.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentImageIndex % heroImages.length
                  ? 'bg-[var(--sl-amber)] w-4'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Show image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
