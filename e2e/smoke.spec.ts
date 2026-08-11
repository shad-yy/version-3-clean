import { test, expect } from "@playwright/test"

test("home page loads", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Smart Live TV|SmartLiveTV|Sports/i)
})



