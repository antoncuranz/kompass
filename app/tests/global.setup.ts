import { expect } from "@playwright/test"
import { storageState } from "playwright.config"
import { signUpWithPasskey } from "./utils"
import { test as setup } from "./fixtures"

setup("signup with passkey", async ({ page, context }) => {
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

  await expect
    .poll(() => wsCount, {
      message: "make sure state is pushed to sync-server",
      timeout: 5000,
    })
    .toBeGreaterThanOrEqual(3)

  await context.storageState({ path: storageState })

  await cdpClient.send("WebAuthn.removeVirtualAuthenticator", {
    authenticatorId: cdpResponse.authenticatorId,
  })
})
