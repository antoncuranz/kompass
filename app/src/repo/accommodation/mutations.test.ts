import { beforeEach, describe, expect, it } from "vitest"
import { useAccommodationMutations } from "./mutations"
import { useTripMutations } from "../trip/mutations"
import { createTestUser, setupTestEnvironment } from "../../test/setup"
import { assertTripPermissions } from "../../test/permissions"

describe("AccommodationMutations", () => {
  let tripStid: string
  let admin: any

  beforeEach(async () => {
    await setupTestEnvironment()
    const tripMutations = useTripMutations()
    admin = await createTestUser("admin", true)
    const trip = await tripMutations.create({
      name: "Test Trip",
      startDate: "2024-01-01",
      endDate: "2024-01-07",
    })
    tripStid = trip.stid
  })

  it("should create an accommodation and verify permissions", async () => {
    // given
    const mutations = useAccommodationMutations(tripStid)
    const accommodationData = {
      name: "Test Accommodation",
      arrivalDate: "2024-01-01",
      departureDate: "2024-01-07",
    }

    // when
    const accommodation = await mutations.create(accommodationData)

    // then
    expect(accommodation.name).toBe(accommodationData.name)
    expect(accommodation.arrivalDate).toBe(accommodationData.arrivalDate)
    expect(accommodation.departureDate).toBe(accommodationData.departureDate)
    await assertTripPermissions(tripStid, admin)
  })

  it("should update an accommodation with location and verify permissions (Testcase 1)", async () => {
    // given
    const mutations = useAccommodationMutations(tripStid)
    const accommodation = await mutations.create({
      name: "Test Accommodation",
      arrivalDate: "2024-01-01",
      departureDate: "2024-01-07",
    })
    const location = { latitude: 52.52, longitude: 13.4 }

    // when
    const updated = await mutations.update(accommodation.id, {
      location,
    })

    // then
    expect(updated.location).toMatchObject(location)
    await assertTripPermissions(tripStid, admin)
  })

  it("should update an accommodation to undefined location and verify permissions (Testcase 2)", async () => {
    // given
    const mutations = useAccommodationMutations(tripStid)
    const location = { latitude: 52.52, longitude: 13.4 }
    const accommodation = await mutations.create({
      name: "Test Accommodation",
      arrivalDate: "2024-01-01",
      departureDate: "2024-01-07",
      location,
    })

    // when
    const updated = await mutations.update(accommodation.id, {
      location: undefined,
    })

    // then
    expect(updated.location).toBeUndefined()
    await assertTripPermissions(tripStid, admin)
  })

  it("should remove an accommodation and verify permissions", async () => {
    // given
    const mutations = useAccommodationMutations(tripStid)
    const accommodation = await mutations.create({
      name: "Test Accommodation",
      arrivalDate: "2024-01-01",
      departureDate: "2024-01-07",
    })

    // when
    await mutations.remove(accommodation.id)

    // then
    await assertTripPermissions(tripStid, admin)
  })
})
