import type { Metadata } from 'next'
import { notFound } from "next/navigation"
import Image from 'next/image'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import { Calendar, MapPin } from "lucide-react"
import { formatLongDate } from "@/lib/utils/datetime"

export const metadata: Metadata = {
  title: 'UFC Event',
  robots: { index: false, follow: true },
}

async function getUFCEvent(id: string) {
  try {
    // ESPN summary endpoint returns human-readable fight card
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/summary?event=${id}`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) {
      const data = await res.json()
      return data
    }
  } catch {}
  
  // Fallback: try scoreboard to find the event
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard',
      { next: { revalidate: 900 } }
    )
    if (res.ok) {
      const data = await res.json()
      const event = data?.events?.find((e: any) => e.id === id)
      if (event) return { header: event, boxscore: null }
    }
  } catch {}
  
  return null
}

export default async function UFCEventPage({ params }: { params: { id: string } }) {
  const summary = await getUFCEvent(params.id)

  // getUFCEvent returns null when ESPN has no such event. Without this check the page
  // fell through to the hardcoded 'UFC Event' placeholder below and rendered an empty
  // shell reading "UFC Event Details Loading" -- forever, with a 200. A soft 404 that
  // also looks broken to anyone who lands on it.
  if (!summary) notFound()

  // Extract data from ESPN summary format
  const header = summary?.header || summary
  const eventName = header?.competitions?.[0] 
    ? `${header.competitions[0].competitors?.[0]?.team?.displayName || ''} vs ${header.competitions[0].competitors?.[1]?.team?.displayName || ''}`
    : header?.name || 'UFC Event'
  
  const fights = summary?.header?.competitions || []
  const date = header?.competitions?.[0]?.date || header?.date || ''
  const venue = header?.competitions?.[0]?.venue?.fullName || ''
  
  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-gray-100 
      pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/ufc"
          className="inline-flex items-center gap-2 text-sl-mute 
            hover:text-sl-text text-sm mb-8 transition-colors">
          ← Back to UFC
        </Link>

        {summary ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold 
                text-sl-text mb-4">
                {eventName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-sl-mute">
                {date && (
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />{formatLongDate(date)}</span>
                )}
                {venue && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />{venue}</span>}
              </div>
            </div>

            {fights.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-sl-text mb-6">
                  Fight Card
                </h2>
                <div className="space-y-4">
                  {fights.map((comp: any, i: number) => {
                    const c0 = comp.competitors?.[0]
                    const c1 = comp.competitors?.[1]
                    const note = comp.notes?.[0]?.headline
                    return (
                      <div key={i} 
                        className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                          rounded-2xl p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 text-center">
                            <p className="font-bold text-sl-text">
                              {c0?.athlete?.displayName || 
                               c0?.team?.displayName || 'TBA'}
                            </p>
                            {c0?.score && (
                              <p className="text-[var(--sl-amber)] font-extrabold 
                                text-2xl mt-1">{c0.score}</p>
                            )}
                          </div>
                          <div className="text-sl-dim font-bold px-4">
                            VS
                          </div>
                          <div className="flex-1 text-center">
                            <p className="font-bold text-sl-text">
                              {c1?.athlete?.displayName || 
                               c1?.team?.displayName || 'TBA'}
                            </p>
                            {c1?.score && (
                              <p className="text-[var(--sl-amber)] font-extrabold 
                                text-2xl mt-1">{c1.score}</p>
                            )}
                          </div>
                        </div>
                        {note && (
                          <p className="text-xs text-sl-mute text-center mt-3 
                            border-t border-[var(--sl-line)] pt-3">
                            {note}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Image src="/leagues/ufc.png" alt="UFC"
              width={64} height={64}
              className="object-contain mx-auto mb-6 opacity-50" />
            <h1 className="text-2xl font-extrabold text-sl-text mb-3">
              UFC Event Details Loading
            </h1>
            <p className="text-sl-mute mb-8 max-w-md mx-auto">
              Fight card details are being loaded. 
              Browse all upcoming UFC events below.
            </p>
            <Link href="/ufc"
              className="inline-flex items-center gap-2 
                bg-[var(--sl-amber)] text-black font-bold px-8 py-3.5 
                rounded-xl text-sm">
              View All UFC Events →
            </Link>
          </div>
        )}

        <div className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
          rounded-2xl p-6 text-center mt-8">
          <h3 className="font-bold text-sl-text mb-2">
            Follow Every UFC Event
          </h3>
          <p className="text-sl-mute text-sm mb-4">
            Full fight cards, fighter records and UK start times for every card.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/ufc"
              className="bg-[var(--sl-amber)] text-black font-bold 
                px-6 py-3 rounded-xl text-sm">
              UFC Schedule →
            </Link>
            <Link href="/news"
              className="border border-[var(--sl-line)] text-sl-mid 
                font-bold px-6 py-3 rounded-xl text-sm">
              MMA News
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
