import { beforeEach, describe, expect, it } from "vitest"
import { createTestUser, setupTestEnvironment } from "../../test/setup"
import { assertTripPermissions } from "../../test/permissions"
import { FileAttachmentEntity } from "../attachment/schema"
import { useAttachmentRepository } from "../attachment/repository"
import { useTripRepository } from "../trip/repository"
import { useAccommodationRepository } from "./repository"

describe("AccommodationRepository", () => {
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

  it("should create an accommodation and verify permissions", async () => {
    // given
    const mutations = useAccommodationRepository(tripStid)
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
    const mutations = useAccommodationRepository(tripStid)
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
    const mutations = useAccommodationRepository(tripStid)
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
    const mutations = useAccommodationRepository(tripStid)
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

  it("should remove accommodation reference from attachments when accommodation is removed", async () => {
    // given
    const mutations = useAccommodationRepository(tripStid)
    const attachmentMutations = useAttachmentRepository(tripStid)
    const accommodation = await mutations.create({
      name: "Test Accommodation",
      arrivalDate: "2024-01-01",
      departureDate: "2024-01-07",
    })
    const attachment = await attachmentMutations.create({
      name: "Test Attachment",
      file: new File([new Blob(["test"], { type: "text/plain" })], "test.txt"),
      references: [accommodation.id],
    })

    // when
    await mutations.remove(accommodation.id)

    // then
    const updatedAttachment = await FileAttachmentEntity.load(attachment.id)
    if (!updatedAttachment.$isLoaded) {
      throw new Error("Unable to load updated attachment")
    }
    expect(updatedAttachment.references).not.toContain(accommodation.id)
  })
})
