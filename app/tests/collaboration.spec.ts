import { expect, test } from "@playwright/test"
import {
  approveAccessRequest,
  createBrowserContextWithAuth,
  createTrip,
  getShareUrl,
  requestAccess,
} from "./utils"

test.describe("Collaboration", () => {
  test("should share trip and approve access request", async ({ browser }) => {
    const { context: ownerContext, page: ownerPage } =
      await createBrowserContextWithAuth(browser, "Trip Owner", {
        permissions: ["clipboard-read", "clipboard-write"],
      })

    const { context: guestContext, page: guestPage } =
      await createBrowserContextWithAuth(browser, "Guest User")

    const tripName = "Collaboration Test Trip"
    await createTrip(ownerPage, tripName)

    await ownerPage.getByRole("link", { name: tripName }).click()
    await expect(ownerPage.getByText(tripName)).toBeVisible()

    const shareUrl = await getShareUrl(ownerPage)

    await guestPage.goto(shareUrl)

    await requestAccess(guestPage)

    await approveAccessRequest(ownerPage, "Guest User")
    const shareCard = ownerPage.getByTestId("share-card")
    await expect(shareCard).toHaveScreenshot()

    await guestPage.reload()
    await expect(guestPage.getByTestId("itinerary-card")).toBeVisible()
    await expect(guestPage.getByText("Trip added to your trips")).toBeVisible()

    await guestPage.goto("/")
    await expect(guestPage.getByRole("link", { name: tripName })).toBeVisible()

    await ownerContext.close()
    await guestContext.close()
  })
})
