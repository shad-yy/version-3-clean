"use client"
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react'

interface BlogPostLayoutProps {
  title: string
  description: string
  author: string
  authorTitle: string
  date: string
  lastModified: string
  readingTime: string
  category: string
  tags?: string[]
  children: React.ReactNode
}

export function BlogPostLayout({
  title,
  description,
  author,
  authorTitle,
  date,
  lastModified,
  readingTime,
  category,
  tags,
  children,
}: BlogPostLayoutProps) {
  const [readProgress, setReadProgress] = useState(0)
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const updateProgress = () => {
      const article = articleRef.current
      if (!article) return
      const { top, height } = article.getBoundingClientRect()
      const scrolled = Math.max(0, -top)
      const total = height - window.innerHeight
      setReadProgress(Math.min(100, (scrolled / total) * 100))
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedModified = new Date(lastModified).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const initials = author === 'Sightline' ? 'SL' : author
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <>
      {/* Reading progress bar — GPU-composited, no layout shift */}
      <div
        className="fixed top-0 left-0 z-[200] h-0.5 bg-[var(--sl-amber)] transition-all duration-100"
        style={{ width: `${readProgress}%` }}
        aria-hidden="true"
      />

      <div className="min-h-screen bg-[var(--sl-ground)] text-gray-100">

        {/* ── Hero header ── */}
        <header
          className="pt-28 md:pt-36 pb-12 px-4 border-b border-[var(--sl-line)]"
          style={{ background: 'linear-gradient(to bottom, var(--sl-ground) 0%, var(--sl-ground) 100%)' }}
        >
          <div className="max-w-3xl mx-auto">

            {/* Breadcrumb — WCAG 2.2 landmark nav */}
            <nav
              className="flex items-center gap-2 text-xs text-sl-dim mb-6"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-sl-mute transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <Link href="/blog" className="hover:text-sl-mute transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-sl-mute truncate max-w-[200px]">{title}</span>
            </nav>

            {/* Category pill */}
            <span className="inline-block bg-[var(--sl-amber)]/10 text-[var(--sl-amber)] border border-[var(--sl-amber)]/20 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              {category}
            </span>

            {/* H1 — single per page, AEO-friendly */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-sl-text leading-tight mb-5 tracking-tight">
              {title}
            </h1>

            {/* Description / lead */}
            <p className="text-lg text-sl-mute leading-relaxed mb-8 max-w-2xl">
              {description}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-5 pb-8 border-b border-[var(--sl-line)]">
              {/* Author avatar + name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-[var(--sl-amber)]/10 border border-[var(--sl-amber)]/20 flex items-center justify-center text-[var(--sl-amber)] font-bold text-sm flex-shrink-0"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sl-text font-semibold text-sm leading-tight">{author}</p>
                  <p className="text-sl-dim text-xs">{authorTitle}</p>
                </div>
              </div>

              <div className="h-4 w-px bg-[var(--sl-line)] hidden sm:block" aria-hidden="true" />

              {/* Publish date — machine-readable datetime */}
              <div className="flex items-center gap-1.5 text-xs text-sl-mute">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <time dateTime={date}>{formattedDate}</time>
              </div>

              {/* Reading time */}
              <div className="flex items-center gap-1.5 text-xs text-sl-mute">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{readingTime}</span>
              </div>

              {/* Last modified badge */}
              {lastModified !== date && (
                <span className="text-xs text-sl-dim bg-[var(--sl-surface)] border border-[var(--sl-line)] px-2.5 py-1 rounded-full">
                  Updated <time dateTime={lastModified}>{formattedModified}</time>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── Article body + sidebar grid ── */}
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12 items-start">

          {/* Main content — prose-blog class applies the typography system */}
          <article ref={articleRef} className="prose-blog min-w-0">
            {children}
          </article>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block" aria-label="Article sidebar">
            <div className="sticky top-24 space-y-4">

              {/* CTA card */}
              <div className="bg-[var(--sl-surface)] border border-[var(--sl-line)] rounded-2xl p-5">
                <p className="text-xs font-bold text-sl-mute uppercase tracking-wide mb-3">
                  Live Live data
                </p>
                <p className="text-sl-text font-bold text-sm mb-1">Scores &amp; Fixtures</p>
                <p className="text-sl-mute text-xs mb-4 leading-relaxed">
                  Real-time match data & TV guide.
                </p>
                <Link
                  href="/scores"
                  className="block w-full text-center bg-[var(--sl-amber)] text-black font-bold text-xs py-2.5 rounded-xl hover:bg-[var(--sl-amber-hover)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sl-amber)]"
                >
                  Live Scores →
                </Link>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="bg-[var(--sl-surface)] border border-[var(--sl-line)] rounded-2xl p-4">
                  <p className="text-xs font-bold text-sl-dim uppercase tracking-wide mb-3">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-[var(--sl-ground)] border border-[var(--sl-line)] text-sl-mute px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ── Back to blog footer ── */}
        <div className="max-w-3xl mx-auto px-4 pb-20">
          <div className="border-t border-[var(--sl-line)] pt-10 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-sl-mute hover:text-sl-text transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sl-amber)] rounded"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Blog
            </Link>
            <Link
              href="/scores"
              className="bg-[var(--sl-amber)] text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[var(--sl-amber-hover)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-amber)]"
            >
              View Live Fixtures →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
