import { beforeEach, describe, expect, it } from "vitest"
import { createTestUser, setupTestEnvironment } from "../../test/setup"
import { assertTripPermissions } from "../../test/permissions"
import { FileAttachmentEntity } from "../attachment/schema"
import { useAttachmentRepository } from "../attachment/repository"
import { useTripRepository } from "../trip/repository"
import { useActivityRepository } from "./repository"

describe("ActivityRepository", () => {
  let tripStid: string
  let admin: any

  beforeEach(async () => {
    await setupTestEnvironment()
    const tripMutations = useTripRepository()
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
    const mutations = useActivityRepository(tripStid)
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
    const mutations = useActivityRepository(tripStid)
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
    const mutations = useActivityRepository(tripStid)
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
    const mutations = useActivityRepository(tripStid)
    const activity = await mutations.create({
      name: "Test Activity",
      date: "2024-01-02",
    })

    // when
    await mutations.remove(activity.id)

    // then
    await assertTripPermissions(tripStid, admin)
  })

  it("should remove activity reference from attachments when activity is removed", async () => {
    // given
    const mutations = useActivityRepository(tripStid)
    const attachmentMutations = useAttachmentRepository(tripStid)
    const activity = await mutations.create({
      name: "Test Activity",
      date: "2024-01-02",
    })
    const attachment = await attachmentMutations.create({
      name: "Test Attachment",
      file: new File([new Blob(["test"], { type: "text/plain" })], "test.txt"),
      references: [activity.id],
    })

    // when
    await mutations.remove(activity.id)

    // then
    const updatedAttachment = await FileAttachmentEntity.load(attachment.id)
    if (!updatedAttachment.$isLoaded) {
      throw new Error("Unable to load updated attachment")
    }
    expect(updatedAttachment.references).not.toContain(activity.id)
  })
})
