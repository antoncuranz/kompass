import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "repositories",
          globals: true,
          environment: "node",
          include: ["src/repo/**/*.test.ts"],
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        test: {
          name: "usecases",
          environment: "node",
          include: ["src/usecase/**/*.test.ts"],
        },
      },
    ],
  },
})
