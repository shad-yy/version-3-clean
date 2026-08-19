import { getAvailableRegions } from "@/lib/api/tmdb"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import { getSelectableCountries } from "@/lib/geo/countries"
import { CountrySelect } from "@/components/sightline/country-select"
import { HeroSearch } from "@/components/sightline/hero-search"

/**
 * Homepage hero — design/sightline/HANDOFF.md §1.1–1.2.
 *
 * Replaces a hero that opened with "Live Sports Scores, Fixtures & Global Broadcast
 * Guide": an inventory list that described stock rather than value, asked nothing, never
 * mentioned film or television, and omitted the one control the product is built around.
 *
 * The headline is now the user's own question, with the country as an inline control
 * inside the sentence — so the single most important variable in every answer is visible
 * and changeable in the first line of the page.
 *
 * The coverage figure is read from the provider rather than hardcoded. It is the count of
 * countries we can genuinely answer film and television for, and it grows on its own when
 * the provider adds a market.
 */
export async function Hero() {
  const country = getViewerCountry()
  const [regions, countries] = await Promise.all([
    getAvailableRegions(),
    getSelectableCountries(),
  ])

  const countryText = countryLabel(country)

  return (
    <section className="border-b border-sl-line bg-sl-ground px-[18px] pb-10 pt-[86px] lg:px-20 lg:pb-10 lg:pt-[128px]">
      <div className="mx-auto max-w-[1280px]">
        <p className="mb-4 font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mute lg:text-[11px] lg:tracking-[.18em]">
          Sport · Film · Television
          {regions.length > 0 ? ` — ${regions.length} countries` : ""}
        </p>

        <h1 className="mb-5 max-w-[900px] text-[35px] font-semibold leading-[1.06] tracking-[-0.034em] text-sl-text lg:text-[62px] lg:leading-[1.02] lg:tracking-[-0.038em]">
          <span>Where can I watch this in </span>
          {/*
            The country sits inside the headline as a live control, not as static text.
            It is the variable the whole answer turns on, so it is the one thing in the
            sentence a reader can change.
          */}
          <CountrySelect
            countries={countries}
            current={country}
            variant="inline"
            className="inline-block align-baseline"
          />
          <span> ?</span>
        </h1>

        <p className="mb-8 max-w-[620px] text-[15px] leading-[1.55] text-sl-mid lg:text-[17px]">
          One lookup for sport, film and television. We name the service that carries it
          where you are, and show the date we last checked — or say plainly that we have
          not checked yet.
        </p>

        <HeroSearch countryText={countryText} />
      </div>
    </section>
  )
}
