import { VERIFICATION_LOG } from "@/lib/data/verification-log"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { countryName } from "@/lib/geo/country"

/**
 * "Just re-checked" strip — design_handoff_sightline_ui/README.md §3a.3.
 *
 * A marquee of things a person has actually confirmed, each with the service and the date
 * it was checked. It is the only continuously moving element on the page that carries
 * information rather than atmosphere, which is the point: the product's claim is that
 * someone looked, and this is that claim, moving.
 *
 * ## Why the items are duplicated
 *
 * The track translates to -50% and restarts. That only reads as a seamless loop if the
 * second half is identical to the first, so the array is rendered twice and the copy is
 * `aria-hidden`. Without the duplicate the strip visibly snaps back.
 *
 * ## Why it is capped
 *
 * A marquee whose content is shorter than the viewport leaves a visible gap as it
 * translates. Below a floor it renders nothing at all rather than a strip with one item
 * sliding through empty space.
 *
 * The left border colours by vertical — amber for sport, blue for film and TV — which is
 * how type is carried everywhere on this site. Never a badge (design opinion 1).
 */

const MIN_ITEMS = 4

interface Item {
  id: string
  title: string
  service: string
  at: string
  kind: "sport" | "film-tv"
}

function buildItems(): Item[] {
  const hrefFor = new Map(COMPETITION_RIGHTS.map((c) => [c.id, c.name]))

  return VERIFICATION_LOG
    // A withdrawal is a real event but not something to advertise as re-checked — the
    // strip exists to surface things a reader can go and watch.
    .filter((e) => e.action !== "removed")
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .map((e) => ({
      id: `${e.competition}-${e.country}-${e.at}`,
      title: `${hrefFor.get(e.competition) ?? e.competition} · ${countryName(e.country)}`,
      service: e.broadcaster,
      at: e.at,
      kind: "sport" as const,
    }))
}

export function RecheckMarquee() {
  const items = buildItems()
  if (items.length < MIN_ITEMS) return null

  const track = [...items, ...items]

  return (
    <section className="border-y border-sl-hair bg-sl-panel">
      <div className="flex items-center gap-2 px-[18px] pt-[9px] lg:px-[60px]">
        <span aria-hidden="true" className="size-[6px] animate-pulse rounded-full bg-sl-amber" />
        <h2 className="font-mono text-[9.5px] uppercase tracking-[.18em] text-sl-mute">
          Just re-checked
        </h2>
      </div>

      <div
        className="overflow-hidden py-[10px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <div className="sl-marquee flex w-max gap-[10px]">
          {track.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              // The second pass is decoration for the loop, not content to announce twice.
              aria-hidden={i >= items.length ? "true" : undefined}
              className="flex shrink-0 items-baseline gap-2 whitespace-nowrap rounded-[6px] border border-sl-line bg-sl-surface py-[7px] pl-3 pr-[12px]"
              style={{
                borderLeft: `2px solid ${item.kind === "sport" ? "var(--sl-amber)" : "var(--sl-blue)"}`,
              }}
            >
              <span className="text-[13px] text-sl-text">{item.title}</span>
              <span className="text-[12.5px] text-sl-mid">{item.service}</span>
              {/* A provenance date. It does not move relative to its item, and it is never
                  a badge or a tick — design opinion 3. */}
              <span className="font-mono text-[9.5px] uppercase tracking-[.06em] text-sl-dim">
                {item.at}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
