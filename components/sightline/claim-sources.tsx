import { getClaims, lastCheckedFor, sourcesFor } from "@/lib/data/editorial-claims"

/**
 * Renders where a page's factual claims came from.
 *
 * The point is not decoration or legal cover — it is the same claim the broadcast
 * listings make with their checked-date, applied to editorial content. A reader who
 * doubts a scoreline should be one click from the page it was taken off, and a reader who
 * never doubts it should still be able to see that someone did the checking.
 *
 * It renders nothing when it has nothing to show. A "Sources" heading above an empty list
 * is worse than no heading, because it implies provenance that does not exist.
 *
 * External links carry `rel="noopener nofollow"`: these are citations, not endorsements,
 * and a citation should not pass ranking signal to whoever we happened to read.
 */
export function ClaimSources({
  claimIds,
  label = "Sources",
}: {
  claimIds: string[]
  label?: string
}) {
  const claims = getClaims(claimIds)
  const sources = sourcesFor(claimIds)
  const checked = lastCheckedFor(claimIds)

  if (sources.length === 0) return null

  return (
    <aside className="mt-8 border-t border-sl-hair pt-5">
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-mono text-[10px] uppercase tracking-[.14em] text-sl-mute">
          {label}
        </h2>
        {checked && (
          <span className="font-mono text-[10px] uppercase tracking-[.12em] text-sl-dim">
            Last checked {checked}
          </span>
        )}
      </div>

      {/*
        One row per source, publisher then headline. An earlier version showed the
        publisher alone, which rendered two different Wikipedia articles as "Wikipedia"
        and "Wikipedia" — indistinguishable, and reading as a duplication bug rather than
        as two sources.
      */}
      <ul className="space-y-1.5">
        {sources.map((source) => (
          <li key={source.url} className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono text-[10px] uppercase tracking-[.1em] text-sl-dim">
              {source.publisher}
            </span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener nofollow"
              className="text-[13px] text-sl-mid underline decoration-sl-dim underline-offset-2 transition-colors duration-[.16s] hover:text-sl-text hover:decoration-sl-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[3px]"
            >
              {source.title}
            </a>
          </li>
        ))}
      </ul>

      {/*
        A correction is shown, not buried. If a number on this page was once wrong, the
        reader who saw the wrong one deserves to know it changed and why.
      */}
      {claims.some((c) => c.supersedes) && (
        <div className="mt-4 space-y-1.5">
          {claims
            .filter((c) => c.supersedes)
            .map((c) => (
              <p key={c.id} className="max-w-[620px] text-[12px] leading-[1.5] text-sl-dim">
                <span className="font-mono uppercase tracking-[.1em]">Corrected</span>{" "}
                — {c.supersedes}
              </p>
            ))}
        </div>
      )}
    </aside>
  )
}
