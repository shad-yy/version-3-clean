import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--sl-ground)] flex flex-col 
      items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <p className="text-8xl font-extrabold text-[var(--sl-line)] mb-4">
          404
        </p>
        <h1 className="text-2xl font-extrabold text-sl-text mb-3">
          Page Not Found
        </h1>
        <p className="text-sl-mute text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist. 
          Browse our sports coverage or return to the homepage.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { name: 'Premier League', href: '/watch/premier-league' },
            { name: 'Champions League', href: '/watch/champions-league' },
            { name: 'UFC', href: '/ufc' },
            { name: 'World Cup 2026', href: '/watch/world-cup-2026' },
          ].map(l => (
            <Link key={l.name} href={l.href}
              className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                hover:border-[var(--sl-amber)]/30 rounded-xl p-3 
                text-sm font-semibold text-sl-mid 
                hover:text-sl-text transition-all">
              {l.name}
            </Link>
          ))}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/"
            className="bg-[var(--sl-amber)] text-black font-bold 
              px-6 py-3 rounded-xl text-sm">
            Go to Homepage →
          </Link>
          <Link href="/scores"
            className="border border-[var(--sl-line)] text-sl-mid 
              font-bold px-6 py-3 rounded-xl text-sm">
            View Live Scores
          </Link>
        </div>
      </div>
    </div>
  )
}
