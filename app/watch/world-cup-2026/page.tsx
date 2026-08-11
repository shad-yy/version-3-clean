import type { Metadata } from 'next'
import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'

export const metadata: Metadata = {
  title: 'World Cup 2026 Results & Broadcast Archive | Smart Live TV',
  description: 'Spain beat Argentina 4-1 in the 2026 FIFA World Cup final on 19 July 2026. Full results archive, plus the Premier League 2026-27 start date and UK broadcast listings.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/world-cup-2026`,
  },
  openGraph: {
    title: 'World Cup 2026 — Spain Are Champions | Watch Premier League Next',
    description: 'Spain beat Argentina 4-1 in the World Cup 2026 final. The Premier League 2026-27 season starts 21 August. Get ready.',
    images: ['/og-default.png'],
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who won the World Cup 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Spain won the 2026 FIFA World Cup, defeating Argentina 4-1 in the final on 19 July 2026 at MetLife Stadium in New Jersey, USA.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where was the World Cup 2026 final?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The FIFA World Cup 2026 final was held at MetLife Stadium in East Rutherford, New Jersey, USA on 19 July 2026.',
      },
    },
    {
      '@type': 'Question',
      name: 'When does the Premier League 2026-27 season start?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The 2026-27 Premier League season starts on Friday 21 August 2026, with Arsenal hosting Coventry City at 20:00 BST. Televised fixtures are split between Sky Sports, TNT Sports and Amazon Prime Video; Saturday 3pm kick-offs are not broadcast live in the UK.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I watch the Premier League 2026-27 live?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Premier League 2026-27 season starts on 21 August 2026. In the UK, televised fixtures are split between Sky Sports, TNT Sports and Amazon Prime Video, which streams one dedicated December matchweek. Smart Live TV publishes the full fixture list, kick-off times and the official broadcaster for every match.',
      },
    },
  ],
}

const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'FIFA World Cup 2026',
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: 'USA, Canada, Mexico',
  },
  description: 'The 23rd FIFA World Cup. Spain beat Argentina 4-1 in the final on 19 July 2026.',
  url: `${ENV.BASE_URL}/watch/world-cup-2026`,
  winner: {
    '@type': 'SportsTeam',
    name: 'Spain',
  },
}

const openingFixtures = [
  { date: 'Fri 21 Aug', time: '20:00', home: 'Arsenal', away: 'Coventry City' },
  { date: 'Sat 22 Aug', time: '12:30', home: 'Hull City', away: 'Manchester United' },
  { date: 'Sat 22 Aug', time: '12:30', home: 'Everton', away: 'Crystal Palace' },
  { date: 'Sat 22 Aug', time: '17:30', home: 'Brentford', away: 'Tottenham Hotspur' },
  { date: 'Sun 23 Aug', time: '16:30', home: 'Newcastle United', away: 'Liverpool' },
  { date: 'Mon 24 Aug', time: '20:00', home: 'Fulham', away: 'Chelsea' },
]

export default function WorldCup2026Page() {
  const faqs = faqSchema.mainEntity.map((item: any) => ({
    question: item.name,
    answer: item.acceptedAnswer.text,
  }))

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={eventSchema} />

      {/* TOURNAMENT OVER BANNER */}
      <section className="pt-28 md:pt-36 pb-16 text-center px-4 border-b border-[#c8a951]/30"
        style={{
          background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0a0f 60%)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#c8a951]/10 border border-[#c8a951]/40 px-4 py-2 rounded-full text-xs font-bold text-[#c8a951] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#c8a951] inline-block" />
            TOURNAMENT COMPLETE — 19 July 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Spain Win the{' '}
            <span className="text-[#00e676]">World Cup 2026</span>
          </h1>
          <p className="text-2xl font-bold text-white mb-3">
            Spain 4 – 1 Argentina
          </p>
          <p className="text-gray-400 mb-4">
            Final — MetLife Stadium, New Jersey — 19 July 2026
          </p>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
            The 2026 FIFA World Cup is over. Spain are world champions for the fifth time.
            The next major tournament is the Premier League 2026-27, which begins on 21 August 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/watch/premier-league"
              className="bg-[#00e676] text-black font-extrabold px-10 py-4 rounded-xl text-lg hover:bg-[#00ff87] transition-all shadow-[0_0_30px_rgba(0,230,118,0.3)]">
              Premier League 2026-27 TV Guide →
            </Link>
            <Link href="/scores"
              className="border border-[#2a2a3a] hover:border-[#00e676] text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors">
              Live Scores
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 space-y-20">

        {/* PREMIER LEAGUE NEXT */}
        <section>
          <div className="bg-[#12121a] border border-[#00e676]/20 rounded-2xl p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <div className="text-[#00e676] text-sm font-bold mb-2 uppercase tracking-wider">What is Next</div>
                <h2 className="text-3xl font-bold text-white">
                  Premier League 2026-27
                </h2>
                <p className="text-gray-400 mt-2">Season starts Friday 21 August 2026</p>
              </div>
              <Link href="/watch/premier-league"
                className="shrink-0 bg-[#00e676] text-black font-extrabold px-8 py-3 rounded-xl hover:bg-[#00ff87] transition-all text-center">
                See Full Guide →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a3a]">
                    <th className="text-left py-3 pr-6 text-gray-400 font-semibold">Date</th>
                    <th className="text-left py-3 pr-6 text-gray-400 font-semibold">KO</th>
                    <th className="text-left py-3 pr-6 text-gray-400 font-semibold">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {openingFixtures.map((f, i) => (
                    <tr key={i} className="border-b border-[#2a2a3a]/50 hover:bg-[#1a1a2a] transition-colors">
                      <td className="py-3 pr-6 text-gray-300 whitespace-nowrap">{f.date}</td>
                      <td className="py-3 pr-6 text-[#00e676] font-bold whitespace-nowrap">{f.time}</td>
                      <td className="py-3 text-white font-medium">{f.home} vs {f.away}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-xs mt-4">All times BST. Fixtures subject to broadcast selection changes.</p>
          </div>
        </section>

        {/* WORLD CUP FINAL RECAP */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-8">
            World Cup 2026 Final Result
          </h2>
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center mb-8">
              <div>
                <div className="text-5xl font-extrabold text-white mb-2">Spain</div>
                <div className="text-gray-400 text-sm">World Champions</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-extrabold text-[#00e676]">4 – 1</div>
                <div className="text-gray-500 text-sm mt-2">Final Score</div>
                <div className="text-gray-500 text-xs mt-1">19 July 2026</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold text-white mb-2">Argentina</div>
                <div className="text-gray-400 text-sm">Runners-up</div>
              </div>
            </div>
            <p className="text-gray-400 text-center max-w-2xl mx-auto">
              Spain claimed their fifth World Cup title at MetLife Stadium in New Jersey.
              The 2026 tournament was the largest in history with 48 nations and 104 matches
              played across the United States, Canada, and Mexico.
            </p>
          </div>
        </section>

        {/* WHERE TO WATCH PREMIER LEAGUE */}
        <section className="border-t border-[#2a2a3a] pt-20">
          <h2 className="text-3xl font-bold text-white mb-8">
            Where to Watch the Premier League 2026-27 in the UK
          </h2>
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 md:p-8">
            <p className="text-gray-300 leading-relaxed mb-6">
              The 2026-27 Premier League is broadcast across{' '}
              <strong className="text-white">Sky Sports</strong> and{' '}
              <strong className="text-white">TNT Sports</strong> in the UK, with some matches on Amazon Prime Video.
              Smart Live TV includes all broadcast channels — Sky Sports Main Event, Sky Sports Premier League,
              TNT Sports 1 and international feeds — so you never miss a fixture.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Sky Sports PL', 'TNT Sports 1', 'Sky Sports ME', 'Amazon Prime'].map(ch => (
                <div key={ch} className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl p-4 text-center">
                  <div className="text-[#00e676] font-bold text-sm">
                    {ch}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Included
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-[#2a2a3a] pt-20">
          <h2 className="text-3xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl">
            {faqs.map(f => (
              <div key={f.question} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6">
                <h3 className="font-bold text-white mb-2">
                  {f.question}
                </h3>
                <p className="text-gray-400 text-sm">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-[#00e676]/20 pt-20 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Get Ready for the Premier League
          </h2>
          <p className="text-gray-400 mb-4 text-lg">
            The season starts 21 August 2026, with televised fixtures split between
            Sky Sports, TNT Sports and Amazon Prime Video.
          </p>
          <p className="text-gray-500 mb-10">
            Fixtures, kick-off times, standings and the official broadcaster for every match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/watch/premier-league"
              className="inline-flex items-center bg-[#00e676] text-black font-extrabold px-12 py-5 rounded-xl text-xl hover:bg-[#00ff87] transition-all shadow-[0_0_40px_rgba(0,230,118,0.25)]">
              View Premier League Fixtures →
            </Link>
            <Link href="/scores"
              className="border border-[#2a2a3a] hover:border-[#00e676] text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors">
              Live Scores
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
