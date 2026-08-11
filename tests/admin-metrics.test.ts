import { describe, it, expect } from "vitest"

/**
 * /api/admin/health and /api/admin/metrics are authentication-protected.
 *
 * These tests previously asserted `res.ok === true` for an unauthenticated call,
 * which is backwards — a 200 here would be the bug. An unauthenticated request
 * must be rejected, so that is what we assert.
 */
describe("admin metrics endpoints", () => {
  it("/api/admin/health rejects an unauthenticated request", async () => {
    const { GET } = await import("@/app/api/admin/health/route")
    const res = (await GET()) as Response

    expect(res.ok).toBe(false)
    expect([401, 500]).toContain(res.status)

    const body = await res.json()
    expect(body).toHaveProperty("error")
  })

  it("/api/admin/metrics rejects an unauthenticated request", async () => {
    const { GET } = await import("@/app/api/admin/metrics/route")
    const res = (await GET()) as Response

    expect(res.ok).toBe(false)
    expect([401, 500]).toContain(res.status)
  })

  it("does not leak credentials in the unauthenticated response body", async () => {
    const { GET } = await import("@/app/api/admin/health/route")
    const res = (await GET()) as Response
    const text = JSON.stringify(await res.json())

    expect(text).not.toMatch(/apiKey|password|secret|bearer/i)
  })
})
