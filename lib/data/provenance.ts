/**
 * How the site describes where its listings come from.
 *
 * ## Why there are no dates any more
 *
 * The site used to stamp every broadcast listing with the date a person last confirmed it,
 * and that was genuinely its strongest idea. It was also a promise that had to be kept
 * daily by hand, and one nobody could keep.
 *
 * **A verification date that stops being updated is worse than no date at all.** It looks
 * precise, it looks maintained, and it quietly becomes a false claim — a reader trusting
 * "Verified 31 Jul 2026" a year later is being misled by a number that was true once. The
 * honest options were to maintain it properly or to stop claiming it, and the owner chose
 * to stop claiming it.
 *
 * So the listings stay — a broadcaster holding a competition in a country is a fact that
 * changes on multi-year rights cycles, not daily — and the per-item dates are replaced by
 * these two sentences, which are true without anyone having to do anything to keep them
 * true.
 *
 * ## What must not creep back in
 *
 * - **No per-item dates**, and no "last checked", "verified on", "as of" language.
 * - **No badges, ticks or "verified" markers.** They imply a check that is not happening.
 * - **No counters of checks performed.** There is no cadence to count.
 *
 * If hand-verification ever resumes, the dates come back with it — not before.
 */

/** Sitewide, wherever broadcast listings are shown in bulk. */
export const BROADCAST_PROVENANCE =
  "Broadcast listings are compiled from rights holders' own published schedules. Rights are sold country by country and change between seasons, so confirm with the broadcaster before relying on a listing."

/** Short form, for tight spaces like a card footer or a panel edge. */
export const BROADCAST_PROVENANCE_SHORT =
  "Compiled from rights holders' schedules · rights change between seasons"

/** Film and television, which has always come from a provider rather than by hand. */
export const CATALOGUE_PROVENANCE =
  "Film and television availability is what the metadata provider currently lists for your country. It changes as licences move between services."
