import { useCoState } from "jazz-tools/react-core"
import { mapAttachment } from "./mappers"
import { FileAttachmentEntity } from "./schema"
import type { AttachmentSubscription } from "@/repo/contracts"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useAttachmentSubscription(
  stid: string,
): AttachmentSubscription {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { files: { $each: FileAttachmentEntity.resolveQuery } },
    },
    select: st => (st.$isLoaded ? st.trip.files : []),
  })

  return {
    attachments: entities.map(mapAttachment),
  }
}
