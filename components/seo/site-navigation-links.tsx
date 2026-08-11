import Link from 'next/link'

const QUICK_LINKS = [
  { href: '/watch/premier-league', label: 'Premier League' },
  { href: '/watch/champions-league', label: 'Champions League' },
  { href: '/watch/world-cup-2026', label: 'World Cup 2026' },
  { href: '/watch/formula-1', label: 'Formula 1' },
  { href: '/ufc', label: 'UFC & MMA' },
  { href: '/scores', label: 'Live Scores' },
  { href: '/leagues', label: 'League Stats' },
  { href: '/news', label: 'Sports News' },
  { href: '/blog', label: 'Sports Blog' },
  { href: '/faq', label: 'FAQ' },
] as const

/** Compact crawl-friendly internal links — visually distinct from footer. */
export function SiteNavigationLinks() {
  return (
    <section
      aria-label="Quick links"
      className="py-8 bg-[#0a0a0f]/80 border-t border-[#1a1a2a]"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-4">
          Quick Links
        </p>
        <nav aria-label="Site quick links" className="flex flex-wrap gap-x-1.5 gap-y-1.5">
          {QUICK_LINKS.map((link, i) => (
            <span key={link.href} className="inline-flex items-center">
              <Link
                href={link.href}
                className="text-xs text-gray-500 hover:text-[#00e676] transition-colors font-medium"
              >
                {link.label}
              </Link>
              {i < QUICK_LINKS.length - 1 && (
                <span className="text-gray-700 ml-1.5" aria-hidden="true">·</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </section>
  )
}
