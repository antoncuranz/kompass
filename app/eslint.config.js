//  @ts-check
import { tanstackConfig } from "@tanstack/eslint-config"
import oxlint from "eslint-plugin-oxlint"

export default [
  {
    ignores: [
      "eslint.config.js",
      "public/config.js",
      "public/service-worker/push.js",
    ],
  },
  ...tanstackConfig,
  {
    rules: {
      "no-shadow": "off",
    },
  },
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
]
