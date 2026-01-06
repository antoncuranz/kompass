import { beforeEach, describe, expect, it } from "vitest"
import { useTripRepository } from "../trip/repository"
import { createTestUser, setupTestEnvironment } from "../../test/setup"
import { assertTripPermissions } from "../../test/permissions"
import { useAttachmentRepository } from "./repository"

describe("AttachmentRepository", () => {
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

  const testFile = new File(
    [new Blob(["test"], { type: "text/plain" })],
    "test.txt",
  )

  it("should create an attachment and verify permissions", async () => {
    // given
    const mutations = useAttachmentRepository(tripStid)
    const attachmentData = {
      name: "Test Attachment",
      file: testFile,
      references: [],
    }

    // when
    const attachment = await mutations.create(attachmentData)

    // then
    expect(attachment.name).toBe(attachmentData.name)
    expect(attachment.references).toHaveLength(0)
    await assertTripPermissions(tripStid, admin)
  })

  it("should update an attachment with references and verify permissions (Testcase 1)", async () => {
    // given
    const mutations = useAttachmentRepository(tripStid)
    const attachment = await mutations.create({
      name: "Test Attachment",
      file: testFile,
      references: [],
    })
    const references = ["ref1", "ref2"]

    // when
    const updated = await mutations.update(attachment.id, {
      references,
    })

    // then
    expect(updated.references).toHaveLength(2)
    expect(updated.references).toEqual(references)
    await assertTripPermissions(tripStid, admin)
  })

  it("should update an attachment to empty references and verify permissions (Testcase 2)", async () => {
    // given
    const mutations = useAttachmentRepository(tripStid)
    const attachment = await mutations.create({
      name: "Test Attachment",
      file: testFile,
      references: ["ref1", "ref2"],
    })

    // when
    const updated = await mutations.update(attachment.id, {
      references: [],
    })

    // then
    expect(updated.references).toHaveLength(0)
    await assertTripPermissions(tripStid, admin)
  })

  it("should remove an attachment and verify permissions", async () => {
    // given
    const mutations = useAttachmentRepository(tripStid)
    const attachment = await mutations.create({
      name: "Test Attachment",
      file: testFile,
      references: [],
    })

    // when
    await mutations.remove(attachment.id)

    // then
    await assertTripPermissions(tripStid, admin)
  })
})
