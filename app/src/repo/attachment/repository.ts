import { Group, co } from "jazz-tools"
import { mapAttachment } from "./mappers"
import { FileAttachmentEntity } from "./schema"
import type { AttachmentRepository } from "@/repo/contracts"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useAttachmentRepository(stid: string): AttachmentRepository {
  return {
    create: async values => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { files: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      const files = sharedTrip.trip.files

      const attachmentGroup = Group.create()
      attachmentGroup.addMember(files.$jazz.owner)

      const blobGroup = Group.create()
      blobGroup.addMember(attachmentGroup)

      const entity = FileAttachmentEntity.create(
        {
          ...values,
          file: await co.fileStream().createFromBlob(values.file, blobGroup),
        },
        attachmentGroup,
      )

      files.$jazz.push(entity)
      return mapAttachment(entity)
    },

    update: async (id, values) => {
      const entity = await FileAttachmentEntity.load(id)
      if (!entity.$isLoaded) {
        throw new Error(
          "Unable to load FileAttachmentEntity: " + entity.$jazz.loadingState,
        )
      }

      entity.$jazz.applyDiff(values)
      return mapAttachment(entity)
    },

    remove: async id => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { files: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      sharedTrip.trip.files.$jazz.remove(t => t.$jazz.id === id)
    },

    loadAll: async () => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: {
          trip: { files: { $each: FileAttachmentEntity.resolveQuery } },
        },
      })

      if (!sharedTrip.$isLoaded) {
        if (sharedTrip.$jazz.loadingState === "unauthorized") return []
        throw new Error(`Failed to load attachments for trip ${stid}`)
      }

      return sharedTrip.trip.files.map(mapAttachment)
    },
  }
}
