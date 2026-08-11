import type { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"

export const metadata: Metadata = {
  title: 'Sports Telemetry & Fixture FAQ | Smart Live TV',
  description: 'Frequently asked questions about live sports scores, match schedules, league standings, and broadcast listings on Smart Live TV.',
  alternates: { canonical: `${ENV.BASE_URL}/faq` },
}

const FAQS = [
  {
    q: "What is Smart Live TV?",
    a: "Smart Live TV is a live sports telemetry and official TV broadcast directory hub providing real-time scores, match schedules, league standings, and channel listings for Premier League, Champions League, UFC, Formula 1, and more."
  },
  {
    q: "How fast are scores updated?",
    a: "Live match scores and telemetry events are refreshed automatically every 60 seconds directly from official sports data providers."
  },
  {
    q: "What leagues and competitions are covered?",
    a: "We cover top global football leagues (English Premier League, Spanish La Liga, German Bundesliga, Italian Serie A, French Ligue 1), UEFA Champions League, Europa League, UFC Fight Nights, and Formula 1 Grands Prix."
  },
  {
    q: "Where do I find live match schedules?",
    a: "Check our Live Scores page or News section for up-to-date matchday timetables, kickoff times, and official television broadcast guides."
  },
  {
    q: "Where does your data come from?",
    a: "Scores, fixtures, standings and player statistics come from TheSportsDB, and sports news headlines from NewsData.io. Broadcast listings reference the official UK rights holders for each competition."
  }
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 pt-28 md:pt-36 pb-16 md:pb-20">
      <FadeIn>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-lg">Everything you need to know about Smart Live TV sports hub.</p>
        </div>

        <div className="bg-[#12121a] rounded-3xl p-6 md:p-10 border border-[#2a2a3a] space-y-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-[#2a2a3a] pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need further assistance?</h2>
          <p className="text-gray-400 mb-6">Contact our support team anytime.</p>
          <Link
            href="/contact"
            className="inline-block bg-[#00e676] hover:bg-[#00ff87] text-black font-extrabold px-8 py-3 rounded-xl text-base shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
