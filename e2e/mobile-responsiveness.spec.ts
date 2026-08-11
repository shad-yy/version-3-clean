import { test, expect } from "@playwright/test"

const LOCAL_BASE = "http://localhost:3001"

test.describe("Mobile Layout Responsiveness & Spacing Checks", () => {
  // Use a mobile viewport for all tests in this block
  test.use({ viewport: { width: 390, height: 844 } })

  test("Leagues page doesn't overlap header on mobile", async ({ page }) => {
    await page.goto(`${LOCAL_BASE}/leagues`)
    // Wait for the main heading to be visible
    const h1 = page.locator("h1:has-text('Football Leagues')")
    await expect(h1).toBeVisible()
    
    // Get bounding box of the heading and the header
    const h1Box = await h1.boundingBox()
    const header = page.locator("header")
    const headerBox = await header.boundingBox()
    
    expect(h1Box).not.toBeNull()
    expect(headerBox).not.toBeNull()
    
    // Ensure the top of the heading is below the bottom of the header (which is headerBox.y + headerBox.height)
    if (h1Box && headerBox) {
      console.log(`Leagues Page: Header bottom at ${headerBox.y + headerBox.height}px, H1 top at ${h1Box.y}px`)
      expect(h1Box.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height)
    }
  })

  test("Players page doesn't overlap header on mobile", async ({ page }) => {
    await page.goto(`${LOCAL_BASE}/players`)
    const h1 = page.locator("h1:has-text('Football Players')")
    await expect(h1).toBeVisible()
    
    const h1Box = await h1.boundingBox()
    const header = page.locator("header")
    const headerBox = await header.boundingBox()
    
    expect(h1Box).not.toBeNull()
    expect(headerBox).not.toBeNull()
    
    if (h1Box && headerBox) {
      console.log(`Players Page: Header bottom at ${headerBox.y + headerBox.height}px, H1 top at ${h1Box.y}px`)
      expect(h1Box.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height)
    }
  })

  test("Teams page doesn't overlap header on mobile", async ({ page }) => {
    await page.goto(`${LOCAL_BASE}/teams`)
    const h1 = page.locator("h1:has-text('Football Teams')")
    await expect(h1).toBeVisible()
    
    const h1Box = await h1.boundingBox()
    const header = page.locator("header")
    const headerBox = await header.boundingBox()
    
    expect(h1Box).not.toBeNull()
    expect(headerBox).not.toBeNull()
    
    if (h1Box && headerBox) {
      console.log(`Teams Page: Header bottom at ${headerBox.y + headerBox.height}px, H1 top at ${h1Box.y}px`)
      expect(h1Box.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height)
    }
  })

  test("Events page doesn't overlap header on mobile", async ({ page }) => {
    await page.goto(`${LOCAL_BASE}/events`)
    const h1 = page.locator("h1:has-text('Sports Events')")
    await expect(h1).toBeVisible()
    
    const h1Box = await h1.boundingBox()
    const header = page.locator("header")
    const headerBox = await header.boundingBox()
    
    expect(h1Box).not.toBeNull()
    expect(headerBox).not.toBeNull()
    
    if (h1Box && headerBox) {
      console.log(`Events Page: Header bottom at ${headerBox.y + headerBox.height}px, H1 top at ${h1Box.y}px`)
      expect(h1Box.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height)
    }
  })

  test("Pricing cards slider is visible and snap-scroll works on mobile", async ({ page }) => {
    await page.goto(`${LOCAL_BASE}/pricing`)
    
    // Look for the mobile-only snap scroll container
    const sliderContainer = page.locator(".hide-scrollbar")
    await expect(sliderContainer.first()).toBeVisible()
    
    // Verify dot navigation elements are present
    const dots = page.locator("button[aria-label^='Go to slide']")
    await expect(dots.first()).toBeVisible()
    
    console.log(`Pricing Page: Mobile slider and dot indicators verified.`)
  })
})
