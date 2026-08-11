"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Heart } from "lucide-react"
import { useState, useEffect, memo, useRef } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ShimmerButton } from "@/components/ui/shimmer-button"

import { CommandPalette } from "@/components/search/command-palette"

const WATCH_LINKS = {
  football: [
    {
      name: "Premier League",
      href: "/watch/premier-league",
      badge: "/leagues/premier-league.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png",
      desc: "English top flight"
    },
    {
      name: "La Liga",
      href: "/watch/la-liga",
      badge: "/leagues/la-liga.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/qphamq1575285108.png",
      desc: "Spanish football"
    },
    {
      name: "Bundesliga",
      href: "/watch/bundesliga",
      badge: "/leagues/bundesliga.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/0j9mq11549630092.png",
      desc: "German football"
    },
    {
      name: "Serie A",
      href: "/watch/serie-a",
      badge: "/leagues/serie-a.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/dupte51529670364.png",
      desc: "Italian football"
    },
    {
      name: "Ligue 1",
      href: "/watch/ligue-1",
      badge: "/leagues/ligue-1.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/mekpox1549629429.png",
      desc: "French football"
    },
    {
      name: "Champions League",
      href: "/watch/champions-league",
      badge: "/leagues/champions-league.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/qywjqy1610461035.png",
      desc: "Europe's elite cup"
    },
    {
      name: "Europa League",
      href: "/watch/europa-league",
      badge: "/leagues/europa-league.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/9pmsij1527785881.png",
      desc: "UEFA second tier"
    },
    {
      name: "World Cup 2026",
      href: "/watch/world-cup-2026",
      badge: "/leagues/world-cup.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/bxh0ky1549630504.png",
      desc: "Live now • USA/CAN/MEX"
    },
  ],
  more: [
    {
      name: "Formula 1",
      href: "/watch/formula-1",
      badge: "/leagues/formula-1.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/7onmyv1587591215.png",
      desc: "Every race live"
    },
    {
      name: "UFC / MMA",
      href: "/ufc",
      badge: "/leagues/ufc.png",
      remoteBadge: "https://www.thesportsdb.com/images/media/league/badge/ro2wo91683355307.png",
      desc: "Fight nights live"
    },
  ]
}

// Navigation links with path matching
const NAV_LINKS = [
  { name: "Live Scores", href: "/scores" },
  { name: "Leagues", href: "/leagues" },
  { name: "News", href: "/news" },
  { name: "UFC", href: "/ufc" },
  { name: "Blog", href: "/blog" },
]

export const Header = memo(function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  let dropdownTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isMobileMenuOpen])

  const handleMouseEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 150) // slight delay to make it feel natural
  }

  // Check if a link is active based on pathname
  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isWatchActive = pathname.startsWith('/watch')

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500 ease-out",
          isMobileMenuOpen
            ? "bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-[#2a2a3a]/60 py-3"
            : isScrolled
              ? "bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-2.5"
              : "bg-gradient-to-b from-black/40 to-transparent border-b border-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center group">
              <motion.img
                src="/logo.svg"
                alt="Smart Live TV"
                width={180}
                height={40}
                className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-90"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </Link>

            {/* CENTER: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Watch Live Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <motion.button
                  className={cn(
                    "relative flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200",
                    isWatchActive || isDropdownOpen
                      ? "text-white bg-white/[0.08]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-[#ff1744] flex-shrink-0"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Watch Live
                  <motion.span
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" 
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.span>

                  {/* Active indicator pill */}
                  {isWatchActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#00e676]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>

                {/* Desktop Dropdown — Enhanced glassmorphism */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3
                        w-[520px] rounded-2xl
                        bg-[#0d0d14]/95 backdrop-blur-2xl
                        border border-white/[0.08]
                        shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)_inset]
                        overflow-hidden z-50"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      {/* Header band with neon accent */}
                      <div className="px-5 py-3 border-b border-white/[0.06] 
                        flex items-center justify-between
                        bg-gradient-to-r from-[#00e676]/[0.04] to-transparent">
                        <span className="text-[11px] font-bold text-gray-500 
                          uppercase tracking-widest">
                          Live Sports
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff1744] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff1744]" />
                          </span>
                          <span className="text-[11px] font-bold text-[#ff1744] tracking-wide">
                            LIVE
                          </span>
                        </span>
                      </div>

                      <div className="p-3">
                        {/* Football section label */}
                        <p className="text-[10px] font-bold text-gray-600 
                          uppercase tracking-widest px-2 mb-2">
                          Football
                        </p>

                        {/* Football grid — 2 columns */}
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {WATCH_LINKS.football.map((link, i) => (
                            <motion.div
                              key={link.name}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03, duration: 0.18 }}
                            >
                              <Link
                                href={link.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item",
                                  isLinkActive(link.href)
                                    ? "bg-[#00e676]/10 border border-[#00e676]/20"
                                    : "hover:bg-white/[0.05] border border-transparent"
                                )}
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 overflow-hidden transition-all duration-200",
                                  isLinkActive(link.href)
                                    ? "bg-[#00e676]/10 border-[#00e676]/30"
                                    : "bg-[#12121a] border-[#2a2a3a] group-hover/item:border-white/20 group-hover/item:bg-white/[0.04]"
                                )}>
                                  <img
                                    src={link.badge}
                                    alt={link.name}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 
                                        '/leagues/placeholder.svg'
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className={cn(
                                    "text-sm font-semibold transition-colors truncate leading-tight",
                                    isLinkActive(link.href) ? "text-[#00e676]" : "text-gray-200 group-hover/item:text-white"
                                  )}>
                                    {link.name}
                                  </p>
                                  <p className="text-[11px] text-gray-600 
                                    group-hover/item:text-gray-400 transition-colors 
                                    leading-tight">
                                    {link.desc}
                                  </p>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/[0.06] mx-2 mb-3" />

                        {/* More sports */}
                        <p className="text-[10px] font-bold text-gray-600 
                          uppercase tracking-widest px-2 mb-2">
                          More Sports
                        </p>
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {WATCH_LINKS.more.map((link) => (
                            <Link
                              key={link.name}
                              href={link.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item",
                                isLinkActive(link.href)
                                  ? "bg-[#00e676]/10 border border-[#00e676]/20"
                                  : "hover:bg-white/[0.05] border border-transparent"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 overflow-hidden transition-all duration-200",
                                isLinkActive(link.href)
                                  ? "bg-[#00e676]/10 border-[#00e676]/30"
                                  : "bg-[#12121a] border-[#2a2a3a] group-hover/item:border-white/20"
                              )}>
                                <img
                                  src={link.badge}
                                  alt={link.name}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 
                                      '/leagues/placeholder.svg'
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className={cn(
                                  "text-sm font-semibold transition-colors truncate",
                                  isLinkActive(link.href) ? "text-[#00e676]" : "text-gray-200 group-hover/item:text-white"
                                )}>
                                  {link.name}
                                </p>
                                <p className="text-[11px] text-gray-600 
                                  group-hover/item:text-gray-400 transition-colors">
                                  {link.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Footer CTA */}
                        <div className="px-2 pt-2 border-t border-white/[0.06]">
                          <Link
                            href="/watch/premier-league"
                            className="flex items-center justify-between w-full 
                              px-4 py-3 bg-[#00e676]/[0.08] hover:bg-[#00e676]/[0.15] 
                              border border-[#00e676]/20 hover:border-[#00e676]/40 
                              rounded-xl transition-all duration-200 group/cta"
                          >
                            <span className="text-sm font-bold text-[#00e676]">
                              View Full TV & Broadcast Schedule
                            </span>
                            <span className="text-[#00e676] text-sm 
                              group-hover/cta:translate-x-1 transition-transform duration-200">
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Standard nav links with active indicator */}
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(link.href)
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "relative text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200",
                      active
                        ? "text-white bg-white/[0.08]"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    {link.name}
                    {active && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute -bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#00e676]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* RIGHT: Desktop Auth / CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <CommandPalette />
              <Link href="/favorites" className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/[0.04] transition-all duration-200" aria-label="Favorites">
                <Heart className="w-4 h-4" />
              </Link>

              <Link href="/contact" className="text-sm font-semibold text-gray-500 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all duration-200">
                Support
              </Link>
              <ShimmerButton href="/scores" className="text-sm px-6 py-2.5">
                Live Scores →
              </ShimmerButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:bg-white/[0.08] rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

      </header>

      {/* Mobile Navigation Overlay — uses translateY instead of opacity/h-0
          to keep rendering context. Solid background, no backdrop-filter. */}
      <div
        className={cn(
          "lg:hidden fixed left-0 right-0 bottom-0 z-40",
          "transition-transform duration-300 ease-in-out",
          "border-t border-[#2a2a3a]",
          "isolate",
          isMobileMenuOpen
            ? "translate-y-0 pointer-events-auto"
            : "translate-y-full pointer-events-none"
        )}
        style={{
          top: '60px',
          background: '#0a0a0f',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          contain: 'paint',
        }}
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto pb-24 bg-[#0a0a0f] relative z-10">
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Watch Live</div>
              <div className="grid gap-2">
                {[...WATCH_LINKS.football, ...WATCH_LINKS.more].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 py-3.5 px-3 touch-manipulation rounded-lg border transition-all duration-200",
                      isLinkActive(link.href)
                        ? "bg-[#00e676]/10 border-[#00e676]/30 text-[#00e676]"
                        : "bg-[#12121a] border-[#1a1a2a] text-white hover:border-white/20"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#12121a] border 
                      border-[#2a2a3a] flex items-center justify-center 
                      flex-shrink-0">
                      <img
                        src={link.badge}
                        alt={link.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 
                            '/leagues/placeholder.svg'
                        }}
                      />
                    </div>
                    <span className="font-semibold">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1a1a2a] flex flex-col gap-1">
              <Link href="/favorites" className="py-3.5 px-3 touch-manipulation rounded-lg hover:bg-white/[0.04] active:bg-white/[0.08] text-lg font-bold text-white flex items-center gap-2 transition-all" onClick={() => setIsMobileMenuOpen(false)}><Heart className="w-4 h-4 text-red-400" /> Favorites</Link>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "py-3.5 px-3 touch-manipulation rounded-lg text-lg font-bold transition-all",
                    isLinkActive(link.href)
                      ? "text-[#00e676] bg-[#00e676]/10"
                      : "text-white hover:bg-white/[0.04] active:bg-white/[0.08]"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/about" className="py-3.5 px-3 touch-manipulation rounded-lg hover:bg-white/[0.04] active:bg-white/[0.08] text-lg font-bold text-white transition-all" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              <Link href="/contact" className="py-3.5 px-3 touch-manipulation rounded-lg hover:bg-white/[0.04] active:bg-white/[0.08] text-lg font-bold text-white transition-all" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div onClick={() => setIsMobileMenuOpen(false)} className="mb-4">
              <ShimmerButton
                href="/scores"
                variant="primary"
                className="w-full justify-center py-4 rounded-xl text-base"
              >
                Explore Live Scores →
              </ShimmerButton>
            </div>
            <Link
              href="/contact"
              className="w-full flex justify-center text-sm font-semibold text-gray-500 py-2 hover:text-gray-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Need help? Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  )
})
