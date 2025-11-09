import path, { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, devices } from "@playwright/test"

const currentDir = dirname(fileURLToPath(import.meta.url))
export const storageState = path.join(currentDir, "tests/.storageState.json")

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
  },

  projects: [
    {
      name: "setup",
      testMatch: /global.setup\.ts/,
      teardown: "teardown",
    },
    {
      name: "teardown",
      testMatch: /global.teardown\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState,
      },
      dependencies: ["setup"],
    },
  ],

  webServer: [
    {
      name: "kompass app",
      command: "npm run dev -- -m staging",
      stdout: "pipe",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
    },
    {
      name: "jazz sync-server",
      command: "npx -y jazz-run sync --in-memory",
      stdout: "pipe",
      url: "http://localhost:4200/health",
      reuseExistingServer: !process.env.CI,
    },
  ],
})
