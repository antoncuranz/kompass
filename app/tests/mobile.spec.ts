import { expect, test } from "@playwright/test"
import { createTrip } from "./utils"

test.describe("Mobile", () => {
  test("should navigate to map view", async ({ page }) => {
    const tripName = "Mobile Trip"
    await page.goto("/")
    await createTrip(page, tripName)

    await page.getByRole("link", { name: tripName }).click()
    await expect(page.getByText(tripName)).toBeVisible()

    await page.getByRole("link", { name: "Map" }).click()

    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot()
  })
})
