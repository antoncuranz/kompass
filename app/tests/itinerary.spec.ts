import { expect } from "@playwright/test"
import { test } from "./fixtures"
import {
  createAccommodation,
  createActivity,
  createFlight,
  createGenericTransportation,
  createTrain,
  createTrip, waitForMapLoaded,
} from "./utils"

test.describe("Itinerary", () => {
  test.beforeEach(async ({ page }, { title }) => {
    await page.goto("/")
    await createTrip(page, title)
    await page.getByRole("link", { name: title }).click()
  })

  test("should create flight", async ({ page }) => {
    await createFlight(page)

    await waitForMapLoaded(page)
    await expect(page).toHaveScreenshot()
  })

  test("should create activity", async ({ page }) => {
    await createActivity(page)

    await waitForMapLoaded(page)
    await expect(page).toHaveScreenshot()
  })

  test("should create accommodation", async ({ page }) => {
    await createAccommodation(page)

    await waitForMapLoaded(page)
    await expect(page).toHaveScreenshot()
  })

  test("should create generic transportation", async ({ page }) => {
    await createGenericTransportation(page)

    await waitForMapLoaded(page)
    await expect(page).toHaveScreenshot()
  })

  test("should create train", async ({ page }) => {
    await createTrain(page)

    await waitForMapLoaded(page)
    await expect(page).toHaveScreenshot()
  })

  // test("collaboration with multiple contexts", async ({ browser }) => {
  //   const adminContext = await browser.newContext()
  //   const userContext = await browser.newContext()
  // })
})
