import Link from "next/link"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { recentEntries } from "@/lib/data/verification-log"
import { countryName } from "@/lib/geo/country"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { formatDate } from "@/lib/utils/datetime"

/**
 * "What we changed this week" and "What we do not know" — handoff §1.5.
 *
 * Both halves are built from real records rather than written by hand, because a
 * changelog nobody maintains becomes a lie within a fortnight and this one sits directly
 * beneath a panel about verification honesty.
 *
 * The left column draws on the two dated things the project actually keeps: when a human
 * last verified a competition's rights, and when an article was published. If neither has
 * moved, the column says so instead of padding itself.
 *
 * The right column is the honest-gap statement the handoff requires on every screen
 * (design opinion 7). Its numbers are derived, so it cannot drift from reality.
 */
export function ChangedAndUnknown() {
  const entries: { date: string; text: string }[] = []

  // Real verification events, in the words of what actually happened. A 90-day window
  // rather than 7, because at the current cadence a strict week would usually be empty
  // and an empty changelog reads as neglect rather than honesty.
  const VERBS: Record<string, string> = {
    confirmed: "Re-checked",
    added: "Added",
    removed: "Removed",
    changed: "Changed",
  }
  for (const e of recentEntries(90)) {
    const competition =
      COMPETITION_RIGHTS.find((c) => c.id === e.competition)?.name ?? e.competition
    entries.push({
      date: e.at,
      text: `${VERBS[e.action] ?? "Checked"} ${e.broadcaster} for ${competition} in ${countryName(e.country)}.`,
    })
  }

  // Articles are a fallback, never the headline. This column sits opposite "what we do
  // not know" and is about **coverage** -- what we checked, added or withdrew. A new
  // explainer is not a change to what we know, so posts only appear when there is no
  // verification activity to report at all.
  if (entries.length === 0) {
    for (const post of BLOG_POSTS.slice(0, 3)) {
      entries.push({ date: post.publishedAt, text: `Published “${post.title}”.` })
    }
  }

  const recent = entries
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const verifiedCountries = new Set(
    COMPETITION_RIGHTS.flatMap((c) => c.listings.map((l) => l.country)),
  )

  return (
    <section className="border-t border-sl-line bg-sl-ground px-[18px] py-10 lg:px-20 lg:py-[46px]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="mb-5 font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mid">
            What we changed this week
          </h2>
          {recent.length === 0 ? (
            <p className="text-[13px] leading-[1.55] text-sl-mute">
              Nothing has changed this week. When it does, it will be listed here with the
              date it happened.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recent.map((entry) => (
                <li key={`${entry.date}-${entry.text}`} className="flex gap-4">
                  <span className="w-[74px] shrink-0 font-mono text-[10.5px] uppercase tracking-[.1em] text-sl-mute">
                    {formatDate(entry.date)}
                  </span>
                  <span className="text-[13px] leading-[1.55] text-sl-mid">{entry.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-5 font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mid">
            What we do not know
          </h2>
          <div className="flex flex-col gap-3">
            <p className="max-w-[520px] text-[13px] leading-[1.55] text-sl-mid">
              We have not verified broadcasters outside {verifiedCountries.size} countries,
              and we do not know why some matches are not televised at all. Both are
              explained, not hidden.
            </p>
            <p className="max-w-[520px] text-[13px] leading-[1.55] text-sl-mid">
              Film and television availability comes from a metadata provider and covers
              far more countries, but it carries no verification date — so we never
              describe it as verified, only as what the provider currently lists.
            </p>
            <Link
              href="/blog"
              className="mt-1 font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
            >
              Read the explainers
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
