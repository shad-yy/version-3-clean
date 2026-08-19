import Link from "next/link"
import { getViewerCountry } from "@/lib/geo/country"
import { getSelectableCountries } from "@/lib/geo/countries"
import { SITE_NAME } from "@/lib/config/site-url"
import { HeaderNav } from "@/components/layout/header-nav"

/**
 * Site header — 62px, per design/sightline/HANDOFF.md §1.
 *
 * A server component so the viewer's country is resolved during the render. Every screen
 * answers "where can I watch this **in your country**", so resolving country on the
 * client would mean painting the wrong answer first and correcting it after hydration.
 *
 * The nav is exactly the four items in the handoff. "Film & TV" existing here at all is
 * the fix for a real defect: the vertical was built and reachable only from the middle of
 * one page, so as far as a visitor was concerned it did not exist.
 *
 * Interactive parts (mobile drawer, country dropdown) live in HeaderNav, a client
 * component, so this shell and its links stay in the server-rendered HTML — navigation
 * must never depend on hydration.
 */
export async function Header() {
  const country = getViewerCountry()
  const countries = await getSelectableCountries()

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[62px] border-b border-sl-line bg-[rgba(11,13,17,.94)] backdrop-blur-[9px]">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-[18px] lg:px-10">
        <Link
          href="/"
          className="shrink-0 text-[15px] font-semibold uppercase tracking-[.08em] text-sl-text transition-colors duration-[.16s] hover:text-sl-amber-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[5px]"
        >
          {SITE_NAME}
        </Link>

        <HeaderNav countries={countries} country={country} />
      </div>
    </header>
  )
}
