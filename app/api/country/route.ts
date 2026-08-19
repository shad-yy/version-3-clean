import { NextResponse } from "next/server"
import { COUNTRY_COOKIE } from "@/lib/geo/country"

/**
 * Records the viewer's explicit country choice.
 *
 * A cookie rather than localStorage because the country has to be known during the
 * server render — every page answers "where can I watch this in <country>", so resolving
 * it on the client would mean rendering the wrong answer first and correcting it after
 * hydration.
 */

/** A year. The choice is a stable preference, not a session detail. */
const MAX_AGE = 60 * 60 * 24 * 365

export async function POST(request: Request) {
  let country: unknown
  try {
    ({ country } = await request.json())
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Validate rather than trust. This value is echoed into page copy and used to key
  // availability lookups, so anything that is not an ISO 3166-1 alpha-2 code is rejected
  // outright instead of being sanitised into something plausible.
  if (typeof country !== "string" || !/^[A-Za-z]{2}$/.test(country)) {
    return NextResponse.json(
      { error: "country must be an ISO 3166-1 alpha-2 code" },
      { status: 400 },
    )
  }

  const response = NextResponse.json({ country: country.toUpperCase() })
  response.cookies.set({
    name: COUNTRY_COOKIE,
    value: country.toUpperCase(),
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
    // Not httpOnly: this is a display preference, not a credential, and keeping it
    // readable lets client components avoid a round trip to know the current choice.
    httpOnly: false,
  })
  return response
}
