import { beforeEach, describe, expect, it } from "vitest"
import { useActivityMutations } from "./mutations"
import { useTripMutations } from "../trip/mutations"
import { createTestUser, setupTestEnvironment } from "../../test/setup"
import { assertTripPermissions } from "../../test/permissions"

describe("ActivityMutations", () => {
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

  it("should create an activity and verify permissions", async () => {
    // given
    const mutations = useActivityMutations(tripStid)
    const activityData = {
      name: "Test Activity",
      date: "2024-01-02",
    }

    // when
    const activity = await mutations.create(activityData)

    // then
    expect(activity.name).toBe(activityData.name)
    expect(activity.date).toBe(activityData.date)
    await assertTripPermissions(tripStid, admin)
  })

  it("should update an activity with location and verify permissions (Testcase 1)", async () => {
    // given
    const mutations = useActivityMutations(tripStid)
    const activity = await mutations.create({
      name: "Test Activity",
      date: "2024-01-02",
    })
    const location = { latitude: 52.52, longitude: 13.4 }

    // when
    const updated = await mutations.update(activity.id, {
      location,
    })

    // then
    expect(updated.location).toMatchObject(location)
    await assertTripPermissions(tripStid, admin)
  })

  it("should update an activity to undefined location and verify permissions (Testcase 2)", async () => {
    // given
    const mutations = useActivityMutations(tripStid)
    const location = { latitude: 52.52, longitude: 13.4 }
    const activity = await mutations.create({
      name: "Test Activity",
      date: "2024-01-02",
      location,
    })

    // when
    const updated = await mutations.update(activity.id, {
      location: undefined,
    })

    // then
    expect(updated.location).toBeUndefined()
    await assertTripPermissions(tripStid, admin)
  })

  it("should remove an activity and verify permissions", async () => {
    // given
    const mutations = useActivityMutations(tripStid)
    const activity = await mutations.create({
      name: "Test Activity",
      date: "2024-01-02",
    })

    // when
    await mutations.remove(activity.id)

    // then
    await assertTripPermissions(tripStid, admin)
  })
})
