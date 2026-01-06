import { useCoState } from "jazz-tools/react-core"
import { mapAttachment } from "./mappers"
import { FileAttachmentEntity } from "./schema"
import type { AttachmentSubscription } from "@/repo/contracts"
import type { co } from "jazz-tools"
import { SharedTripEntity } from "@/repo/trip/schema"
import { FileAttachment } from "@/domain"

const EMPTY_ARRAY: Array<co.loaded<typeof FileAttachmentEntity>> = []

export function useAttachmentSubscription(
  stid: string,
): AttachmentSubscription {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { files: { $each: FileAttachmentEntity.resolveQuery } },
    },
    select: st => (st.$isLoaded ? st.trip.files : EMPTY_ARRAY),
  })

  return {
    attachments: entities
      .map(mapAttachment)
      .filter(a => FileAttachment.safeParse(a).success), // prevents loading problems during creation of new entities
  }
}
