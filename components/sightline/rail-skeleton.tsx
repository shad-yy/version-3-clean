import { cn } from "@/lib/utils"

/**
 * Loading placeholder for a homepage rail.
 *
 * Mirrors the real rail's dimensions exactly — 136x202 posters, 238x138 cards — so the
 * page does not reflow when content arrives. A skeleton of the wrong size is worse than
 * none, because it turns a fast load into a visible jump.
 *
 * Uses the handoff's `shimmer` (background-position sweep, 1.15s linear) rather than a
 * pulse, and carries no heading: the real section supplies its own, and a heading over an
 * empty rail would flash a promise the section may not keep, since both rails render
 * nothing when they have nothing to show.
 */
export function RailSkeleton({ kind }: { kind: "poster" | "card" }) {
  const count = kind === "poster" ? 8 : 5

  return (
    <section
      className="border-b border-sl-line px-[18px] py-10 lg:px-20"
      aria-hidden="true"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-4 space-y-2">
          <div className="h-[10px] w-[180px] sl-shimmer rounded-[3px]" />
          <div className="h-[20px] w-[280px] sl-shimmer rounded-[4px]" />
        </div>

        <div className="flex gap-3.5 overflow-hidden">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="shrink-0">
              <div
                className={cn(
                  "sl-shimmer rounded-[6px] border border-sl-line",
                  kind === "poster" ? "w-[136px]" : "w-[238px]",
                )}
                style={{ height: kind === "poster" ? 202 : 138 }}
              />
              {kind === "poster" && (
                <>
                  <div className="mt-2 h-[13px] w-[120px] sl-shimmer rounded-[3px]" />
                  <div className="mt-1.5 h-[10px] w-[76px] sl-shimmer rounded-[3px]" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
