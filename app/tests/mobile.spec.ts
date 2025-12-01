import { expect } from "@playwright/test"
import { test } from "./fixtures"
import { createTrip, ensureMapLoaded } from "./utils"

test.describe("Mobile", () => {
  test("should navigate to map view", async ({ page }) => {
    const tripName = "Mobile Trip"
    await page.goto("/")
    await createTrip(page, tripName)

    await page.getByRole("link", { name: tripName }).click()
    await expect(page.getByText(tripName)).toBeVisible()

    await page.getByRole("link", { name: "Map" }).click()

    await ensureMapLoaded(page)
    await expect(page).toHaveScreenshot()
  })
})
