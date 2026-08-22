import { Suspense } from "react"
import { getAvailableRegions } from "@/lib/api/tmdb"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import { getSelectableCountries } from "@/lib/geo/countries"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { CountrySelect } from "@/components/sightline/country-select"
import { HeroSearch } from "@/components/sightline/hero-search"
import { HeroBackdrop } from "@/components/sightline/hero-backdrop"
import { HeroCounters, type HeroStat } from "@/components/sightline/hero-counters"
import { HeroEyebrow } from "@/components/sightline/hero-eyebrow"

/**
 * Homepage hero — design_handoff_sightline_ui/README.md §3a.
 *
 * The headline is the reader's own question, with the country as a live control inside
 * the sentence — the single variable every answer turns on, changeable in the first line
 * of the page.
 *
 * Words blur in 52ms apart from 60ms. The country control is deliberately **not** part of
 * that sequence: it is an interactive element, and staggering it in makes the one thing a
 * reader might click arrive last.
 *
 * Everything except the eyebrow clock and the counters is server rendered. A headline
 * that waits on hydration is a headline nobody sees.
 */

const HEADLINE_PREFIX = ["Where", "can", "I", "watch", "this", "in"] as const

export async function Hero() {
  const country = getViewerCountry()
  const [regions, countries] = await Promise.all([
    getAvailableRegions(),
    getSelectableCountries(),
  ])

  const countryText = countryLabel(country)

  /*
   * Stats, all three read from real data and none of them time-bound.
   *
   * The handoff wanted "4,128 checks in the last 7 days" here. That was sample data, and
   * the site no longer claims a checking cadence at all — a counter of checks is exactly
   * the kind of number that needs daily upkeep to stay true. These three describe coverage
   * instead, which changes only when the data does.
   */
  const listings = COMPETITION_RIGHTS.reduce((n, c) => n + c.listings.length, 0)
  const stats: HeroStat[] = [
    { value: regions.length, label: "Countries for film & TV" },
    { value: COMPETITION_RIGHTS.length, label: "Competitions covered" },
    { value: listings, label: "Broadcast listings held" },
  ]

  return (
    <section className="relative overflow-hidden border-b border-sl-line bg-sl-ground px-[18px] pb-[34px] pt-[86px] lg:px-[60px] lg:pt-[128px]">
      {/*
        Streamed, so a slow TMDB call delays the backdrop and never the headline or search
        field -- those are the reason the page exists and must paint first.
      */}
      <Suspense fallback={null}>
        <HeroBackdrop />
      </Suspense>

      <div className="relative mx-auto max-w-[1280px]">
        {/*
          There is no live fixture most days, so the eyebrow states scope rather than a
          scoreline. The row keeps its height either way -- nothing shifts when a match
          kicks off.
        */}
        <HeroEyebrow
          fallback={`Sport · Film · Television${regions.length ? ` — ${regions.length} countries` : ""}`}
        />

        <h1 className="mb-5 max-w-[900px] text-[35px] font-semibold leading-[1.06] tracking-[-0.034em] text-sl-text lg:text-[60px] lg:leading-[1.02] lg:tracking-[-0.038em]">
          {HEADLINE_PREFIX.map((word, i) => (
            <span
              key={word + i}
              className="inline-block"
              style={{
                animation: `wordIn .62s cubic-bezier(.2,.7,.3,1) ${60 + i * 52}ms both`,
              }}
            >
              {word}&nbsp;
            </span>
          ))}
          <CountrySelect
            countries={countries}
            current={country}
            variant="inline"
            className="inline-block align-baseline"
          />
          {/* No leading space, or the headline reads "United Kingdom ?". */}
          <span>?</span>
        </h1>

        <p
          className="mb-8 max-w-[560px] text-[15px] leading-[1.55] text-sl-mid lg:text-[17px]"
          style={{ animation: "wordIn .62s cubic-bezier(.2,.7,.3,1) 372ms both" }}
        >
          One lookup for sport, film and television. We tell you which service carries it
          where you are, and say plainly where we hold nothing.
        </p>

        <div style={{ animation: "wordIn .62s cubic-bezier(.2,.7,.3,1) 424ms both" }}>
          <HeroSearch countryText={countryText} country={country} />
        </div>

        <HeroCounters stats={stats} />
      </div>
    </section>
  )
}
