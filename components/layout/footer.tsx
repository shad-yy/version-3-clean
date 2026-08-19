import Link from "next/link"
import { SITE_NAME } from "@/lib/config/site-url"
import { JUSTWATCH_ATTRIBUTION } from "@/lib/api/tmdb"

/**
 * Site footer, on the Sightline palette.
 *
 * The column set changed for a reason rather than for tidiness: the old footer had
 * "Watch Live / Broadcast Guides / Sports Hub / Company" and **no film or television
 * entry at all**, which was part of why that vertical was invisible (AUDIT-REGISTER F2).
 *
 * The closing paragraph is not filler. It is the honest-gap statement the handoff
 * requires on every screen (design opinion 7) and the plainest available answer to "does
 * this site stream things" — it does not.
 */

const COLUMNS = [
  {
    title: "Sport",
    links: [
      { name: "On now", href: "/scores" },
      { name: "Fixtures", href: "/events" },
      { name: "League tables", href: "/leagues" },
      { name: "Teams", href: "/teams" },
      { name: "UFC", href: "/ufc" },
      { name: "Formula 1", href: "/watch/formula-1" },
    ],
  },
  {
    title: "Film & TV",
    links: [
      { name: "Browse titles", href: "/watch/title" },
      { name: "How availability works", href: "/blog/why-different-channel-every-country" },
    ],
  },
  {
    title: "Guides",
    links: [
      { name: "Competition guides", href: "/watch" },
      { name: "Explainers", href: "/blog" },
      { name: "Kick-off times", href: "/blog/kick-off-times-timezones-explained" },
      { name: "The 3pm blackout", href: "/blog/saturday-3pm-blackout-explained" },
    ],
  },
  {
    title: "About",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
  },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-sl-line bg-sl-panel">
      <div className="mx-auto max-w-[1280px] px-[18px] py-12 lg:px-20 lg:py-[46px]">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <p className="mb-3 text-[17px] font-semibold tracking-[-0.022em] text-sl-text">
              {SITE_NAME}
            </p>
            <p className="max-w-[280px] text-[13px] leading-[1.55] text-sl-mute">
              Where can I watch this, from where I am — for sport, film and television.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3 font-mono text-[10.5px] uppercase tracking-[.14em] text-sl-mute">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-sl-mid transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[4px]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-sl-hair pt-6">
          <p className="max-w-[720px] text-[13px] leading-[1.55] text-sl-mute">
            {SITE_NAME} lists where things are shown. It transmits no video, sells no
            subscription and bundles nobody&apos;s channels. Broadcast rights are verified
            by hand and carry the date they were last checked; where a country is not
            listed, we have not checked it rather than guessed.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-dim">
              &copy; {year} {SITE_NAME}
            </p>
            <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-dim">
              {JUSTWATCH_ATTRIBUTION}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
