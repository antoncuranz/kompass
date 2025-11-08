import { unlink } from "node:fs"
import { test as teardown } from "@playwright/test"
import { storageState } from "playwright.config"

teardown("cleanup storageState", () => {
  unlink(storageState, function (err) {
    if (err) return console.log(err)
    console.log("cleaned up storageState successfully")
  })
})
