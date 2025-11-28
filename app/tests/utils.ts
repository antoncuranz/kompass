import { expect } from "@playwright/test"
import flightResponse from "./responses/flight-LH717.json" with { type: "json" }
import locationTubResponse from "./responses/location-tub.json" with { type: "json" }
import locationFernsehturmResponse from "./responses/location-fernsehturm.json" with { type: "json" }
import directionsTubFernsehturmResponse from "./responses/directions-tub-fernsehturm.json" with { type: "json" }
import trainStationBerlinResponse from "./responses/train-station-berlin.json" with { type: "json" }
import trainStationMunichResponse from "./responses/train-station-munich.json" with { type: "json" }
import trainBerlinMunichResponse from "./responses/train-berlin-munich.json" with { type: "json" }
import type { Browser, BrowserContext, Page } from "@playwright/test"

export async function signUpWithPasskey(page: Page, name: string) {
  const welcomeDialog = page.getByRole("dialog", {
    name: /Welcome to kompass/,
  })

  await expect(welcomeDialog).toBeVisible()

  await page.getByRole("textbox", { name: "Name" }).fill(name)
  await page.getByRole("button", { name: "Sign up", exact: true }).click()

  await expect(welcomeDialog).toBeHidden()
}

export async function createTrip(page: Page, name: string) {
  const newTripCard = page.getByTestId("new-trip-card")
  await expect(newTripCard).toBeVisible()
  newTripCard.click()

  const tripDialog = page.getByRole("dialog", {
    name: /New Trip/,
  })

  await expect(tripDialog).toBeVisible()

  await page.getByRole("textbox", { name: "Name" }).fill(name)
  await page.getByRole("button", { name: "Pick a date range" }).click()
  await page.getByRole("button", { name: /10th/ }).click()
  await page.getByRole("button", { name: /15th/ }).click()
  await page.keyboard.press("Escape")
  await page
    .getByRole("textbox", { name: "Description" })
    .fill("Test trip created by Playwright")

  await page.getByRole("button", { name: "Save" }).click()

  await expect(tripDialog).toBeHidden()
}

export async function createFlight(page: Page) {
  await page.route("*/**/api/v1/flights", async route => {
    await route.fulfill({ json: flightResponse })
  })

  const addBtn = page.getByRole("button", { name: /Add Something/ })
  await expect(addBtn).toBeVisible()
  await addBtn.click()

  const addFlightBtn = page.getByRole("menuitem", { name: "Add Flight" })
  await expect(addFlightBtn).toBeVisible()
  await addFlightBtn.click()

  const flightDialog = page.getByRole("dialog", {
    name: /New Flight/,
  })

  await expect(flightDialog).toBeVisible()

  await page.getByRole("textbox", { name: "Flight #" }).fill("LH717")
  await page.getByRole("textbox", { name: "Price" }).fill("1234,5")
  await page.getByRole("button", { name: "Add PNR" }).click()
  await page.getByRole("textbox", { name: "Airline" }).fill("LH")
  await page.getByRole("textbox", { name: "PNR" }).fill("123ABC")
  await page.getByRole("button", { name: "Save" }).click()

  await expect(flightDialog).toBeHidden()

  const flightEntry = page.getByRole("button", {
    name: /12:35-19:00 Flight LH 717/,
  })

  await expect(flightEntry).toBeVisible()
  return flightEntry
}

export async function createActivity(page: Page) {
  await page.route("*/**/api/v1/geocoding/location*", async route => {
    await route.fulfill({ json: locationTubResponse })
  })

  const addBtn = page.getByRole("button", { name: /Add Something/ })
  await expect(addBtn).toBeVisible()
  await addBtn.click()

  const addActivityBtn = page.getByRole("menuitem", { name: "Add Activity" })
  await expect(addActivityBtn).toBeVisible()
  await addActivityBtn.click()

  const activityDialog = page.getByRole("dialog", {
    name: /New Activity/,
  })

  await expect(activityDialog).toBeVisible()

  await page.getByRole("textbox", { name: "Name" }).fill("Test Activity")
  await page
    .getByRole("textbox", { name: "Description" })
    .fill("Test trip created by Playwright")
  await page.getByRole("button", { name: "Date" }).click()
  await page.getByRole("button", { name: /11th/ }).click()
  await page.getByRole("textbox", { name: "Price" }).fill("567,8")
  await activityDialog
    .getByRole("textbox", { name: "Address" })
    .fill("Straße des 17. Juni 135")
  await page.getByRole("button", { name: "Lookup Address" }).click()
  await page.getByRole("button", { name: "Save" }).click()

  await expect(activityDialog).toBeHidden()

  const activityEntry = page.getByText("Test Activity")

  await expect(activityEntry).toBeVisible()
  return activityEntry
}

export async function createAccommodation(page: Page) {
  await page.route("*/**/api/v1/geocoding/location*", async route => {
    await route.fulfill({ json: locationTubResponse })
  })

  const addBtn = page.getByRole("button", { name: /Add Something/ })
  await expect(addBtn).toBeVisible()
  await addBtn.click()

  const addAccommodationBtn = page.getByRole("menuitem", {
    name: "Add Accommodation",
  })
  await expect(addAccommodationBtn).toBeVisible()
  await addAccommodationBtn.click()

  const accommodationDialog = page.getByRole("dialog", {
    name: /New Accommodation/,
  })

  await expect(accommodationDialog).toBeVisible()

  await page.getByRole("textbox", { name: "Name" }).fill("Test Hotel")
  await page.getByRole("button", { name: "Pick a date range" }).click()
  await page.getByRole("button", { name: /11th/ }).click()
  await page.getByRole("button", { name: /14th/ }).click()
  await page.keyboard.press("Escape")
  await page
    .getByRole("textbox", { name: "Description" })
    .fill("Test accommodation created by Playwright")
  await page.getByRole("textbox", { name: "Price" }).fill("890,5")
  await accommodationDialog
    .getByRole("textbox", { name: "Address" })
    .fill("Straße des 17. Juni 135")
  await page.getByRole("button", { name: "Lookup Address" }).click()
  await page.getByRole("button", { name: "Save" }).click()

  await expect(accommodationDialog).toBeHidden()

  const accommodationEntry = page.getByText("Test Hotel")

  await expect(accommodationEntry).toBeVisible()
  return accommodationEntry
}

export async function createGenericTransportation(page: Page) {
  await page.route("*/**/api/v1/geocoding/location*", async route => {
    const url = new URL(route.request().url())
    const query = url.searchParams.get("query")

    if (query === "Straße des 17. Juni 135") {
      await route.fulfill({ json: locationTubResponse })
    } else if (query === "Berliner Fernsehturm") {
      await route.fulfill({ json: locationFernsehturmResponse })
    } else {
      await route.fulfill({ json: locationTubResponse })
    }
  })

  await page.route("*/**/api/v1/geocoding/directions*", async route => {
    await route.fulfill({ json: directionsTubFernsehturmResponse })
  })

  const addBtn = page.getByRole("button", { name: /Add Something/ })
  await expect(addBtn).toBeVisible()
  await addBtn.click()

  const addTransportationBtn = page.getByRole("menuitem", {
    name: "Add Transportation",
  })
  await expect(addTransportationBtn).toBeVisible()
  await addTransportationBtn.click()

  const transportationDialog = page.getByRole("dialog", {
    name: /New Transportation/,
  })

  await expect(transportationDialog).toBeVisible()

  await page.getByRole("textbox", { name: "Name" }).fill("Morning Hike")

  await page.getByTestId("generic-type-select").click()
  await page.getByRole("option", { name: "Hike" }).click()

  await page.getByRole("textbox", { name: "Price" }).fill("0")

  // await page.getByRole("button", { name: "Departure Time" }).click() // TODO
  await page.getByRole("button", { name: "Pick a date" }).nth(0).click()
  await page.getByRole("button", { name: /11th/ }).click()
  await page.keyboard.press("Escape")

  await transportationDialog
    .getByRole("textbox", { name: "Origin Address" })
    .fill("Straße des 17. Juni 135")
  await page.getByRole("button", { name: "Lookup Address" }).nth(0).click() // TODO

  await transportationDialog
    .getByRole("textbox", { name: "Destination Address" })
    .fill("Berliner Fernsehturm")
  await page.getByRole("button", { name: "Lookup Address" }).nth(1).click() // TODO

  await page.getByRole("button", { name: "Save" }).click()

  await expect(transportationDialog).toBeHidden()

  const transportationEntry = page.getByText("Morning Hike")

  await expect(transportationEntry).toBeVisible()
  return transportationEntry
}

export async function createTrain(page: Page) {
  await page.route("*/**/api/v1/geocoding/station*", async route => {
    const url = new URL(route.request().url())
    const query = url.searchParams.get("query")

    if (query === "Berlin") {
      await route.fulfill({ json: trainStationBerlinResponse })
    } else {
      await route.fulfill({ json: trainStationMunichResponse })
    }
  })

  await page.route("*/**/api/v1/trains", async route => {
    await route.fulfill({ json: trainBerlinMunichResponse })
  })

  const addBtn = page.getByRole("button", { name: /Add Something/ })
  await expect(addBtn).toBeVisible()
  await addBtn.click()

  const addTrainBtn = page.getByRole("menuitem", { name: "Add Train" })
  await expect(addTrainBtn).toBeVisible()
  await addTrainBtn.click()

  const trainDialog = page.getByRole("dialog", {
    name: /New Train/,
  })

  await expect(trainDialog).toBeVisible()

  await page.getByRole("button", { name: "Pick a date" }).click()
  await page.getByRole("button", { name: /11th/ }).click()
  await page.keyboard.press("Escape")

  await trainDialog
    .getByRole("textbox", { name: "From Station" })
    .fill("Berlin")
  await page.getByRole("button").nth(0).click()

  await trainDialog.getByRole("textbox", { name: "To Station" }).fill("München")
  await page.getByRole("button").nth(2).click()

  await page.getByRole("textbox", { name: "Price" }).fill("85,99")
  await page.getByRole("textbox", { name: "Train #" }).fill("ICE507")
  await page.getByRole("button", { name: "Save" }).click()

  await expect(trainDialog).toBeHidden()

  const trainEntry = page.getByText("ICE 507")

  await expect(trainEntry).toBeVisible()
  return trainEntry
}

async function setupVirtualAuthenticator(context: BrowserContext, page: Page) {
  const cdp = await context.newCDPSession(page)
  await cdp.send("WebAuthn.enable")
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  })
  return cdp
}

export async function createBrowserContextWithAuth(
  browser: Browser,
  userName: string,
  options?: { permissions?: Array<string> },
) {
  const context = await browser.newContext({
    storageState: undefined,
    ...options,
  })
  const page = await context.newPage()

  const cdp = await setupVirtualAuthenticator(context, page)

  await page.goto("/")
  await signUpWithPasskey(page, userName)

  await cdp.detach()

  return { context, page }
}

export async function getShareUrl(page: Page): Promise<string> {
  const shareLink = page.getByRole("link", { name: "Share" })
  await expect(shareLink).toBeVisible()
  await shareLink.click()

  await expect(page.getByText("Share Trip")).toBeVisible()

  const shareButton = page.getByRole("button", { name: /Copy Link/ })
  await expect(shareButton).toBeVisible()

  await page.evaluate(() => navigator.clipboard.writeText(""))
  await shareButton.click()

  return await page.evaluate(() => navigator.clipboard.readText())
}

export async function requestAccess(page: Page) {
  const accessDialog = page.getByRole("dialog", { name: "Unauthorized" })
  await expect(accessDialog).toBeVisible()

  const requestButton = page.getByRole("button", {
    name: "Request Access",
  })
  await expect(requestButton).toBeVisible()
  await requestButton.click()

  await expect(page.getByText("Access request pending")).toBeVisible()
}

export async function approveAccessRequest(page: Page, guestName: string) {
  await expect(page.getByText("Pending Requests")).toBeVisible()
  await expect(page.getByText(guestName)).toBeVisible()

  const approveButton = page.getByRole("button", { name: "Approve" })
  await approveButton.click()
}
