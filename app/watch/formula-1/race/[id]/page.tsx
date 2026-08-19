import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar } from "lucide-react"
import { formatLongDate } from "@/lib/utils/datetime"

export const metadata: Metadata = {
  title: 'F1 Race',
  robots: { index: false, follow: true },
}

async function getRaceDetail(id: string) {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/racing/f1/summary?event=${id}`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) return await res.json()
  } catch {}
  return null
}

export default async function F1RacePage({ 
  params 
}: { params: { id: string } }) {
  const race = await getRaceDetail(params.id)
  const header = race?.header
  const name = header?.name || 'Formula 1 Race'
  const date = header?.competitions?.[0]?.date || header?.date
  const venue = header?.competitions?.[0]?.venue?.fullName

  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-sl-text 
      pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/watch/formula-1"
          className="inline-flex items-center gap-2 text-sl-mute 
            hover:text-sl-text text-sm mb-8 transition-colors">
          ← Back to Formula 1
        </Link>
        
        <h1 className="text-3xl font-extrabold text-sl-text mb-4">
          {name}
        </h1>
        
        {date && (
          <p className="text-sl-mute mb-8">
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />{formatLongDate(date)}</span>
            {venue && ` · ${venue}`}
          </p>
        )}

        {/* Race results if available */}
        {race?.competitors && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-sl-text mb-4">
              Race Results
            </h2>
            <div className="space-y-3">
              {race.competitors.slice(0, 10).map((c: any, i: number) => (
                <div key={i}
                  className="flex items-center gap-4 bg-[var(--sl-surface)] 
                    border border-[var(--sl-line)] rounded-xl px-5 py-3">
                  <span className="text-sl-mute font-bold w-8 text-center">
                    {c.order || i + 1}
                  </span>
                  <span className="font-bold text-sl-text flex-1">
                    {c.athlete?.displayName || c.team?.displayName}
                  </span>
                  {c.team?.abbreviation && (
                    <span className="text-xs text-sl-mute">
                      {c.team.abbreviation}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fallback when no detailed data */}
        {!race && (
          <div className="text-center py-16">
            <p className="text-sl-mute mb-8 max-w-md mx-auto">
              Race details are being loaded. Browse the full F1 calendar below.
            </p>
            <Link href="/watch/formula-1"
              className="inline-flex items-center gap-2 
                bg-[#e10600] text-sl-text font-bold px-8 py-3.5 
                rounded-xl text-sm hover:bg-[#ff1a1a] transition-all">
              View Full F1 Calendar →
            </Link>
          </div>
        )}

        <div className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
          rounded-2xl p-6 text-center mt-8">
          <h3 className="font-bold text-sl-text mb-2">
            Every F1 Race Weekend
          </h3>
          <p className="text-sl-mute text-sm mb-4">
            In the UK, Sky Sports F1 carries every session live, with selected races also shown free-to-air on Channel 4.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/watch/formula-1"
              className="bg-[var(--sl-amber)] text-black font-bold 
                px-6 py-3 rounded-xl text-sm">
              F1 Race Calendar →
            </Link>
            <Link href="/scores"
              className="border border-[var(--sl-line)] text-sl-mid 
                font-bold px-6 py-3 rounded-xl text-sm">
              Live Scores
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
