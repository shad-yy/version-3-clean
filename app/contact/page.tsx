import type { Metadata } from 'next'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { SUPPORT_EMAIL } from '@/lib/config/site-url'

export const metadata: Metadata = {
  title: 'Contact Sightline | Sports Data & Support',
  description: 'Contact the Sightline editorial and technical team about broadcast guides, live score data, or platform issues.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-sl-text">
      <FadeIn>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">Contact Us</h1>
          <p className="text-sl-mid text-lg mb-8 md:mb-12">
            Have a question about our live scores and fixtures, match schedules, or broadcast guides? Reach out to our team below.
          </p>
          <StaggerIn className="space-y-6">
            <div className="bg-sl-surface rounded-2xl border border-sl-line p-6">
              <h2 className="font-bold text-sl-text mb-2">Email Support</h2>
              <p className="text-sl-mute text-sm mb-2">For editorial corrections, data partnerships, and platform support</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--sl-amber)] hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </div>
            <div className="bg-sl-surface rounded-2xl border border-sl-line p-6">
              <h2 className="font-bold text-sl-text mb-2">Live Broadcast Guides</h2>
              <p className="text-sl-mute text-sm mb-4">
                Explore real-time match schedules, team statistics, and official TV networks.
              </p>
              <a href="/scores" className="inline-flex items-center px-6 py-3 bg-[var(--sl-amber)] text-black font-bold rounded-lg hover:bg-[var(--sl-amber-hover)] transition-colors">
                Explore Live Matches →
              </a>
            </div>
          </StaggerIn>
        </div>
      </section>
      </FadeIn>
    </div>
  )
}
