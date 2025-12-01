import { test as baseTest, expect } from "@playwright/test"
import { signUpWithPasskey } from "./utils"

const test = baseTest.extend({
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(new Date("2025-11-01T10:00:00"))
    await use(page)
  },
})

test("signup with passkey", async ({ page, context }) => {
  const cdpClient = await context.newCDPSession(page)
  await cdpClient.send("WebAuthn.enable")

  const cdpResponse = await cdpClient.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  })

  let wsCount = 0
  await page.routeWebSocket(/.*/, ws => {
    const server = ws.connectToServer()
    ws.onMessage(msgToServer => {
      server.send(msgToServer)
      wsCount++
    })
  })

  await page.goto("/")
  await signUpWithPasskey(page, "Playwright")

  await expect(
    page.getByRole("heading", { name: /Hello Playwright!/ }),
  ).toBeVisible()

  await expect
    .poll(() => wsCount, {
      message: "make sure state is pushed to sync-server",
      timeout: 5000,
    })
    .toBeGreaterThanOrEqual(3)

  await cdpClient.send("WebAuthn.removeVirtualAuthenticator", {
    authenticatorId: cdpResponse.authenticatorId,
  })
})
