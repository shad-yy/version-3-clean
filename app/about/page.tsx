import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeIn } from "@/components/ui/fade-in"

export const metadata: Metadata = {
  title: 'About Smart Live TV | Real-Time Sports Hub',
  description: 'Smart Live TV is a live sports telemetry and official TV broadcast directory hub covering Premier League, Champions League, UFC, F1, and global sports.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-gray-100">
      <FadeIn>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4 border-b border-[var(--sl-line)]">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">About Smart Live TV</h1>
          <p className="text-sl-mid text-lg leading-relaxed mb-4">
            Smart Live TV is a digital sports hub providing real-time live match scores, team statistics, league tables, and official TV broadcast schedules for football fans worldwide.
          </p>
          <p className="text-sl-mid text-lg leading-relaxed mb-8">
            Whether following the Premier League, UEFA Champions League, La Liga, UFC Fight Nights, or Formula 1 Grands Prix, our platform delivers accurate data and official viewing directories.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { stat: '60s', label: 'Real-time telemetry update interval' },
              { stat: '50+', label: 'Global leagues and tournaments tracked' },
              { stat: '100%', label: 'Official TV & streaming listings' },
            ].map(item => (
              <div key={item.stat} className="bg-sl-surface rounded-2xl border border-sl-line p-6 text-center">
                <div className="text-3xl font-extrabold text-[var(--sl-amber)] mb-2">{item.stat}</div>
                <div className="text-sl-mute text-sm">{item.label}</div>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-sl-mid leading-relaxed mb-8">
            Our mission is to provide sports enthusiasts with a fast, comprehensive, and clear overview of live fixtures, standings, and legitimate broadcast options across all devices.
          </p>
          <Link href="/scores" className="inline-flex items-center px-8 py-4 bg-[var(--sl-amber)] text-black font-bold rounded-lg hover:bg-[var(--sl-amber-hover)] transition-colors">
            View Live Scores & Fixtures →
          </Link>
        </div>
      </section>
      </FadeIn>
    </div>
  )
}
