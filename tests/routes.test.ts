import { describe, it, expect } from "vitest"
import { ROUTES, NAVIGATION_ROUTES, getRouteMetadata, isValidRoute } from "@/lib/routes"

describe("routes config", () => {
  it("all NAVIGATION_ROUTES are valid", () => {
    for (const path of NAVIGATION_ROUTES) {
      expect(isValidRoute(path)).toBe(true)
    }
  })

  it("metadata exists for all nav routes and has title/description", () => {
    for (const path of NAVIGATION_ROUTES) {
      const meta = getRouteMetadata(path)
      expect(meta).toBeTruthy()
      expect(typeof meta.title).toBe("string")
      expect(typeof meta.description).toBe("string")
      expect(meta.title.length).toBeGreaterThan(0)
      expect(meta.description.length).toBeGreaterThan(0)
    }
  })

  it("non-existent route falls back to default metadata", () => {
    const meta = getRouteMetadata("/does-not-exist")
    expect(meta.title).toBe("Sightline")
    expect(meta.description).toBe("Sports Hub")
  })
})


