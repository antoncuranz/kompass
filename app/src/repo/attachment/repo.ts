import { useCoState } from "jazz-tools/react-core"
import { Group, co } from "jazz-tools"
import { mapAttachment } from "./mappers"
import type { AttachmentRepo } from "@/repo/contracts"
import { FileAttachmentEntity, SharedTripEntity } from "@/repo/jazzSchema"
// eslint-disable @typescript-eslint/no-misused-spread

export function useAttachmentRepo(stid: string): AttachmentRepo {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { files: { $each: FileAttachmentEntity.resolveQuery } },
    },
    select: st => (st.$isLoaded ? st.trip.files : []),
  })

  return {
    attachments: entities.map(mapAttachment),

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

      const group = Group.create()
      group.addMember(files.$jazz.owner)

      const entity = FileAttachmentEntity.create(
        {
          ...values,
          file: await co.fileStream().createFromBlob(values.file),
        },
        group,
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
  }
}
