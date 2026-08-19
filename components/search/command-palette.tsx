"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Search, X, ExternalLink, Gift, CreditCard, Tv, Newspaper, BookOpen, Settings, MessageCircle } from "lucide-react"
import { BLOG_POSTS } from "@/lib/blog/posts"

interface SearchResult {
  type: 'league' | 'page' | 'blog' | 'sport'
  title: string
  subtitle?: string
  href: string
  icon?: string | React.ComponentType<{ className?: string }>
  badge?: string
  external?: boolean
}

const STATIC_RESULTS: SearchResult[] = [
  // Leagues
  { type: 'league', title: 'Premier League', subtitle: 'Watch live in 4K', href: '/watch/premier-league', icon: '/leagues/premier-league.png', badge: 'Live' },
  { type: 'league', title: 'Champions League', subtitle: 'UEFA UCL live', href: '/watch/champions-league', icon: '/leagues/champions-league.png' },
  { type: 'league', title: 'La Liga', subtitle: 'Spanish football', href: '/watch/la-liga', icon: '/leagues/la-liga.png' },
  { type: 'league', title: 'Bundesliga', subtitle: 'German football', href: '/watch/bundesliga', icon: '/leagues/bundesliga.png' },
  { type: 'league', title: 'Serie A', subtitle: 'Italian football', href: '/watch/serie-a', icon: '/leagues/serie-a.png' },
  { type: 'league', title: 'Ligue 1', subtitle: 'French football', href: '/watch/ligue-1', icon: '/leagues/ligue-1.png' },
  { type: 'league', title: 'Europa League', subtitle: 'UEFA UEL live', href: '/watch/europa-league', icon: '/leagues/europa-league.png' },
  { type: 'league', title: 'World Cup 2026', subtitle: 'Live now — USA/CAN/MEX', href: '/watch/world-cup-2026', icon: '/leagues/world-cup.png', badge: 'Live' },
  { type: 'sport', title: 'Formula 1', subtitle: 'Every race live', href: '/watch/formula-1', icon: '/leagues/formula-1.png' },
  { type: 'sport', title: 'UFC / MMA', subtitle: 'Fight nights', href: '/ufc', icon: '/leagues/ufc.png' },
  // Pages
  { type: 'page', title: 'Live Scores', subtitle: 'Real-time match telemetry', href: '/scores', icon: Tv },
  { type: 'page', title: 'League Tables', subtitle: 'Standings & form guides', href: '/leagues', icon: Newspaper },
  { type: 'page', title: 'News', subtitle: 'Latest sports headlines', href: '/news', icon: Newspaper },
  { type: 'page', title: 'Blog', subtitle: 'Sports analysis & broadcast guides', href: '/blog', icon: BookOpen },
  { type: 'page', title: 'Contact Support', subtitle: 'Customer help desk', href: '/contact', icon: MessageCircle },
]

function getBlogResults(): SearchResult[] {
  return BLOG_POSTS.map(p => ({
    type: 'blog' as const,
    title: p.title,
    subtitle: p.description?.slice(0, 60) + '...',
    href: `/blog/${p.slug}`,
    icon: BookOpen,
  }))
}

const TYPE_LABELS: Record<string, string> = {
  league: 'Leagues',
  sport: 'Sports',
  page: 'Pages',
  blog: 'Blog Posts',
}

export function CommandPalette() {
  // Hydration guard (.cursorrules §2): Framer Motion must not initialise until the
  // client has mounted, otherwise SSR and hydration disagree and React can throw
  // "Failed to execute 'removeChild' on 'Node'" in production (Trouble Registry Bug 5).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // The shortcut hint used to read the Command symbol for everyone, while the handler
  // below accepts metaKey OR ctrlKey. Windows and Linux visitors — most of them — were
  // shown a key their keyboard does not have. Detected after mount because the server
  // cannot know the platform, and rendering a guess would break hydration.
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent))
  }, [])

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const allResults = [...STATIC_RESULTS, ...getBlogResults()]

  const filtered = query.trim()
    ? allResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : STATIC_RESULTS.slice(0, 8)

  // Group by type
  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, SearchResult[]>)

  const flatResults = Object.values(grouped).flat()

  const openPalette = useCallback(() => {
    setOpen(true)
    setQuery('')
    setActiveIdx(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? closePalette() : openPalette()
      }
      if (e.key === 'Escape') closePalette()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, openPalette, closePalette])

  // Arrow key navigation
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, flatResults.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && flatResults[activeIdx]) {
        const result = flatResults[activeIdx]
        closePalette()
        if (result.external) {
          window.open(result.href, '_blank')
        } else {
          window.location.href = result.href
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, activeIdx, flatResults, closePalette])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const ResultItem = ({ result, idx }: { result: SearchResult; idx: number }) => {
    const isActive = idx === activeIdx
    const isImg = typeof result.icon === 'string' && result.icon.startsWith('/')
    const IconComponent = typeof result.icon === 'function' ? result.icon : null

    return (
      <Link
        href={result.href}
        onClick={closePalette}
        target={result.external ? '_blank' : undefined}
        rel={result.external ? 'noopener noreferrer' : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl 
          transition-colors cursor-pointer group
          ${isActive ? 'bg-[var(--sl-amber)]/10' : 'hover:bg-white/[0.04]'}`}
        onMouseEnter={() => setActiveIdx(idx)}
      >
        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center 
          justify-center flex-shrink-0 overflow-hidden
          ${isImg ? 'bg-[var(--sl-surface)] border border-[var(--sl-line)] p-1.5' : ''}`}>
          {isImg ? (
            <img src={result.icon as string} alt="" 
              className="w-full h-full object-contain" loading="lazy" />
          ) : IconComponent ? (
            <IconComponent className="w-4 h-4 text-sl-mute" />
          ) : null}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate
            ${isActive ? 'text-sl-text' : 'text-gray-200'}`}>
            {result.title}
          </p>
          {result.subtitle && (
            <p className="text-xs text-sl-mute truncate mt-0.5">
              {result.subtitle}
            </p>
          )}
        </div>

        {/* Badge */}
        {result.badge && (
          <span className="text-[10px] font-bold bg-[var(--sl-amber)]/10 
            text-[var(--sl-amber)] border border-[var(--sl-amber)]/20 px-2 py-0.5 
            rounded-full flex-shrink-0">
            {result.badge}
          </span>
        )}

        {result.external && (
          <ExternalLink className="w-3 h-3 text-sl-dim flex-shrink-0" />
        )}
      </Link>
    )
  }

  let flatIdx = 0

  return (
    <>
      {/* Search trigger in header */}
      <button
        onClick={openPalette}
        className="flex items-center gap-2 bg-[var(--sl-surface)] border 
          border-[var(--sl-line)] hover:border-[var(--sl-amber)]/30 rounded-lg 
          px-3 py-2 text-sm text-sl-mute hover:text-sl-mid 
          transition-all min-w-[140px] md:min-w-[180px]"
        aria-label="Search"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left text-xs">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 
          bg-[var(--sl-ground)] border border-[var(--sl-line)] rounded px-1.5 
          py-0.5 text-[10px] text-sl-dim font-mono">
          {mounted && isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {/* Overlay + Modal — gated on mount so Framer Motion never initialises
          during SSR/hydration. The trigger button above stays server-rendered
          so the header does not shift when hydration completes. */}
      <AnimatePresence>
        {mounted && open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm 
                z-[90]"
              onClick={closePalette}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 
                z-[100] w-full max-w-lg px-4"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="bg-[var(--sl-ground)] border border-[var(--sl-line)] 
                rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] 
                overflow-hidden">

                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-4 
                  border-b border-[var(--sl-line)]">
                  <Search className="w-5 h-5 text-sl-mute flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search leagues, channels, guides..."
                    value={query}
                    onChange={e => {
                      setQuery(e.target.value)
                      setActiveIdx(0)
                    }}
                    className="flex-1 bg-transparent text-sl-text text-sm 
                      outline-none placeholder:text-sl-dim"
                  />
                  {query && (
                    <button onClick={() => setQuery('')}
                      className="text-sl-dim hover:text-sl-mute">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={closePalette}
                    className="text-sl-dim hover:text-sl-mute 
                      border border-[var(--sl-line)] rounded px-2 py-1 
                      text-[10px] font-mono ml-1">
                    Esc
                  </button>
                </div>

                {/* Results */}
                <div
                  ref={listRef}
                  className="overflow-y-auto max-h-[60vh] p-2"
                >
                  {flatResults.length === 0 ? (
                    <div className="py-12 text-center text-sl-dim text-sm">
                      No results for "{query}"
                    </div>
                  ) : (
                    Object.entries(grouped).map(([type, results]) => (
                      <div key={type} className="mb-2">
                        {/* Group label */}
                        <p className="text-[10px] font-bold text-sl-dim 
                          uppercase tracking-widest px-4 py-2">
                          {TYPE_LABELS[type] || type}
                        </p>
                        {results.map(result => {
                          const currentIdx = flatIdx++
                          return (
                            <ResultItem
                              key={result.href}
                              result={result}
                              idx={currentIdx}
                            />
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer hint */}
                <div className="border-t border-[var(--sl-line)] px-4 py-2.5 
                  flex items-center gap-4 text-[10px] text-sl-dim">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
