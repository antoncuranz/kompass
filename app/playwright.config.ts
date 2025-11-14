import path, { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, devices } from "@playwright/test"

const currentDir = dirname(fileURLToPath(import.meta.url))
export const storageState = path.join(currentDir, "tests/.storageState.json")

export default defineConfig({
  testDir: "./tests",
  outputDir: "./tests/results",
  snapshotDir: "./tests/screenshots",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { outputFolder: "./tests/report" }]]
    : [["html", { open: "never", outputFolder: "./tests/report" }]],
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
      name: "desktop",
      testIgnore: /mobile\.spec\.ts|collaboration\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState,
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: {
        ...devices["iPhone 13"],
        storageState,
      },
      dependencies: ["setup"],
    },
    {
      name: "collaboration",
      testMatch: /collaboration\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
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
      command: process.env.CI
        ? "jazz-run sync --in-memory"
        : "npx jazz-run sync --in-memory",
      stdout: "pipe",
      url: "http://localhost:4200/health",
      reuseExistingServer: !process.env.CI,
    },
  ],
})
