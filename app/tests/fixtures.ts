import { test as baseTest } from "@playwright/test"

export const FIXED_TIME = new Date("2025-11-01T10:00:00")

export const test = baseTest.extend({
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(FIXED_TIME)
    await use(page)
  },
})