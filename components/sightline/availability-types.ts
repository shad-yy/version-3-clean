import type { RegionName } from "@/lib/geo/regions"

/**
 * One country's availability, flattened for the UI.
 *
 * The distinction the whole page turns on is **"no offer" versus "not checked"**, and it
 * is carried structurally rather than by a nullable field: a country present in this list
 * with `kindsHeld === 0` was checked and holds nothing; a country absent from the list
 * entirely was never checked. They render differently on purpose (design opinion 4 —
 * shape as well as colour), and collapsing them would erase the product's position.
 */
export interface CountryAvailabilityView {
  /** ISO 3166-1 alpha-2. */
  code: string
  name: string
  region: RegionName
  lanes: {
    free: string[]
    ads: string[]
    flatrate: string[]
    rent: string[]
    buy: string[]
  }
  /** How many of the five lanes hold at least one service. Drives tick height and fill. */
  kindsHeld: number
  /** Distinct services across all lanes. */
  serviceCount: number
  /**
   * The provider's landing page for this title in this country.
   *
   * Not a deep link into the service — the provider does not supply one. The copy on the
   * page says so rather than implying a link does something it does not.
   */
  link: string
}

/** The five lanes, in the order the design lists them. Letters are the matrix labels. */
export const LANES = [
  { key: "free", label: "Free", letter: "F" },
  { key: "ads", label: "Free with ads", letter: "A" },
  { key: "flatrate", label: "Subscription", letter: "S" },
  { key: "rent", label: "Rent", letter: "R" },
  { key: "buy", label: "Buy", letter: "B" },
] as const

export type LaneKey = (typeof LANES)[number]["key"]
