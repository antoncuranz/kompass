import { beforeEach, describe, it } from "vitest"
import { useTripMutations } from "./mutations"
import { createTestUser, setupTestEnvironment } from "@/test/setup"
import { assertTripPermissions } from "@/test/permissions"

describe("TripMutations", () => {
  const mutations = useTripMutations()

  beforeEach(async () => {
    await setupTestEnvironment()
  })

  describe("create", () => {
    it("should create a trip with correct structure and permissions", async () => {
      // given
      const admin = await createTestUser("admin", true)

      // when
      const trip = await mutations.create({
        name: "Test Trip",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        imageUrl: "test-image.jpg",
      })

      // then
      await assertTripPermissions(trip.stid, admin)
    })
  })
})
