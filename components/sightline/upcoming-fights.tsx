import Link from "next/link"
import { getUpcomingEvents } from "@/lib/api/ufc"
import { RailScroller } from "@/components/sightline/rail-scroller"

/**
 * Upcoming UFC events on the homepage.
 *
 * The data behind this returned an empty array until the ESPN calendar was wired up — the
 * schedule had been sitting unread in `leagues[0].calendar` of a response the app already
 * fetched. It needs no credential.
 *
 * **Deliberately no fighter photographs.** ESPN's headshot CDN works, but reaching it
 * needs a fighter-to-athlete-id mapping this codebase does not have, and the hardcoded
 * roster it does have carries three image paths pointing at files that do not exist. A
 * card weighted with type and a date is honest; one with a broken portrait is not.
 *
 * Cards carry the date as the visual anchor rather than a poster, because "when" is the
 * half of the question this data can answer. The fight card itself is not published by the
 * upstream until an event is close, so it is absent rather than guessed.
 */

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
}

function daysUntil(iso: string): number | null {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  return Math.ceil((t - Date.now()) / 86_400_000)
}

export async function UpcomingFights({ limit = 8 }: { limit?: number }) {
  const events = (await getUpcomingEvents()).slice(0, limit)
  if (events.length === 0) return null

  return (
    <section className="border-b border-sl-line px-[18px] py-10 lg:px-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-sl-amber">
              UFC · next {events.length} events
            </p>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.022em] text-sl-text">
              Scheduled fight nights
            </h2>
          </div>
          <Link
            href="/ufc"
            className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[4px]"
          >
            All events
          </Link>
        </div>

        <RailScroller step={252} label="Upcoming UFC events">
          {events.map((event, i) => {
            const days = daysUntil(event.date)
            const when = Number.isFinite(Date.parse(event.date))
              ? new Intl.DateTimeFormat("en-GB", DATE_FORMAT).format(new Date(event.date))
              : null

            return (
              <Link
                key={event.id}
                href={`/ufc/events/${event.id}`}
                className="group flex w-[238px] shrink-0 snap-start flex-col justify-between rounded-[7px] border border-sl-line bg-sl-surface p-3.5 transition-transform duration-[.16s] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
                style={{
                  borderLeft: "2px solid var(--sl-amber)",
                  animation: `fadeRise .5s cubic-bezier(.2,.7,.3,1) ${i * 70}ms both`,
                  minHeight: 138,
                }}
              >
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[.1em] text-sl-amber">
                    {when ?? "Date to be confirmed"}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[14px] font-medium leading-[1.34] text-sl-text">
                    {event.name}
                  </p>
                </div>

                <p className="mt-3 border-t border-sl-hair pt-2 font-mono text-[10px] uppercase tracking-[.1em] text-sl-mute">
                  {days === null
                    ? "Scheduled"
                    : days <= 0
                      ? "Today"
                      : days === 1
                        ? "Tomorrow"
                        : `In ${days} days`}
                </p>
              </Link>
            )
          })}
        </RailScroller>

        <p className="mt-4 max-w-[620px] text-[12px] leading-[1.5] text-sl-mute">
          Dates come from the UFC schedule and are shown in UTC. Fight cards are not
          published until closer to each event, so we list what is scheduled rather than
          who is on it.
        </p>
      </div>
    </section>
  )
}
