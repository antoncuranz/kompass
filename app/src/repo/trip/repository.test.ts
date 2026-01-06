import { beforeEach, describe, expect, it } from "vitest"
import { useTripRepository } from "./repository"
import { createTestUser, setupTestEnvironment } from "@/test/setup"
import { assertTripPermissions } from "@/test/permissions"

describe("TripRepository", () => {
  const mutations = useTripRepository()

  let admin: any

  beforeEach(async () => {
    await setupTestEnvironment()
    admin = await createTestUser("admin", true)
  })

  describe("create", () => {
    it("should create a trip with correct structure and permissions", async () => {
      // given
      const tripData = {
        name: "Test Trip",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      }

      // when
      const trip = await mutations.create(tripData)

      // then
      expect(trip.name).toBe(tripData.name)
      expect(trip.startDate).toBe(tripData.startDate)
      expect(trip.endDate).toBe(tripData.endDate)
      await assertTripPermissions(trip.stid, admin)
    })
  })

  describe("update", () => {
    it("should update a trip and verify permissions (Testcase 1: Create without optional, update with value)", async () => {
      // given
      const trip = await mutations.create({
        name: "Test Trip",
        startDate: "2024-01-01",
        endDate: "2024-01-07",
      })

      // when
      const updatedTrip = await mutations.update(trip.stid, {
        imageUrl: "test-image.jpg",
      })

      // then
      expect(updatedTrip.imageUrl).toBe("test-image.jpg")
      await assertTripPermissions(updatedTrip.stid, admin)
    })

    it("should update a trip and verify permissions (Testcase 2: Create with optional, update to undefined)", async () => {
      // given
      const trip = await mutations.create({
        name: "Test Trip",
        startDate: "2024-01-01",
        endDate: "2024-01-07",
        imageUrl: "test-image.jpg",
      })

      // when
      const updatedTrip = await mutations.update(trip.stid, {
        imageUrl: undefined,
      })

      // then
      expect(updatedTrip.imageUrl).toBeUndefined()
      await assertTripPermissions(updatedTrip.stid, admin)
    })
  })

  describe("remove", () => {
    it("should remove a trip", async () => {
      // given
      const trip = await mutations.create({
        name: "Test Trip",
        startDate: "2024-01-01",
        endDate: "2024-01-07",
      })

      // when
      await mutations.remove(trip.stid)

      // then
      const account = await admin.$jazz.ensureLoaded({
        resolve: { root: { trips: true } },
      })
      expect(account.root.trips.$jazz.has(trip.stid)).toBe(false)
    })
  })
})
