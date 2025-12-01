import { unlink } from "node:fs"
import { storageState } from "playwright.config"
import { test as teardown } from "./fixtures"

teardown("cleanup storageState", () => {
  unlink(storageState, function (err) {
    if (err) return console.log(err)
    console.log("cleaned up storageState successfully")
  })
})
