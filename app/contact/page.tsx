import type { Metadata } from 'next'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { SUPPORT_EMAIL } from '@/lib/config/site-url'

export const metadata: Metadata = {
  title: 'Contact Smart Live TV | Sports Data & Support',
  description: 'Contact the Smart Live TV editorial and technical team about broadcast guides, live score data, or platform issues.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <FadeIn>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">Contact Us</h1>
          <p className="text-gray-300 text-lg mb-8 md:mb-12">
            Have a question about our live sports telemetry, match schedules, or broadcast guides? Reach out to our team below.
          </p>
          <StaggerIn className="space-y-6">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-bold text-white mb-2">📧 Email Support</h2>
              <p className="text-gray-400 text-sm mb-2">For editorial corrections, data partnerships, and platform support</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#00e676] hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </div>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-bold text-white mb-2">⚽ Live Broadcast Guides</h2>
              <p className="text-gray-400 text-sm mb-4">
                Explore real-time match schedules, team statistics, and official TV networks.
              </p>
              <a href="/scores" className="inline-flex items-center px-6 py-3 bg-[#00e676] text-black font-bold rounded-lg hover:bg-[#00ff87] transition-colors">
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
