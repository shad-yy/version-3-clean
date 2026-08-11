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

  const initials = author === 'Smart Live TV' ? 'SL' : author
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <>
      {/* Reading progress bar — GPU-composited, no layout shift */}
      <div
        className="fixed top-0 left-0 z-[200] h-0.5 bg-[#00e676] transition-all duration-100"
        style={{ width: `${readProgress}%` }}
        aria-hidden="true"
      />

      <div className="min-h-screen bg-[#0a0a0f] text-gray-100">

        {/* ── Hero header ── */}
        <header
          className="pt-28 md:pt-36 pb-12 px-4 border-b border-[#2a2a3a]"
          style={{ background: 'linear-gradient(to bottom, #0d0d14 0%, #0a0a0f 100%)' }}
        >
          <div className="max-w-3xl mx-auto">

            {/* Breadcrumb — WCAG 2.2 landmark nav */}
            <nav
              className="flex items-center gap-2 text-xs text-gray-600 mb-6"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <Link href="/blog" className="hover:text-gray-400 transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-gray-500 truncate max-w-[200px]">{title}</span>
            </nav>

            {/* Category pill */}
            <span className="inline-block bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              {category}
            </span>

            {/* H1 — single per page, AEO-friendly */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5 tracking-tight">
              {title}
            </h1>

            {/* Description / lead */}
            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl">
              {description}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-5 pb-8 border-b border-[#2a2a3a]">
              {/* Author avatar + name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center text-[#00e676] font-bold text-sm flex-shrink-0"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">{author}</p>
                  <p className="text-gray-600 text-xs">{authorTitle}</p>
                </div>
              </div>

              <div className="h-4 w-px bg-[#2a2a3a] hidden sm:block" aria-hidden="true" />

              {/* Publish date — machine-readable datetime */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <time dateTime={date}>{formattedDate}</time>
              </div>

              {/* Reading time */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{readingTime}</span>
              </div>

              {/* Last modified badge */}
              {lastModified !== date && (
                <span className="text-xs text-gray-600 bg-[#12121a] border border-[#2a2a3a] px-2.5 py-1 rounded-full">
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
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Live Telemetry
                </p>
                <p className="text-white font-bold text-sm mb-1">Scores &amp; Fixtures</p>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                  Real-time match data & TV guide.
                </p>
                <Link
                  href="/scores"
                  className="block w-full text-center bg-[#00e676] text-black font-bold text-xs py-2.5 rounded-xl hover:bg-[#00ff87] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676]"
                >
                  Live Scores →
                </Link>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-[#0a0a0f] border border-[#2a2a3a] text-gray-400 px-2.5 py-1 rounded-full"
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
          <div className="border-t border-[#2a2a3a] pt-10 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676] rounded"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Blog
            </Link>
            <Link
              href="/scores"
              className="bg-[#00e676] text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#00ff87] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00e676]"
            >
              View Live Fixtures →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
