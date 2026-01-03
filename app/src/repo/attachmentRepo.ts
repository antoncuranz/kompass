import { useCoState } from "jazz-tools/react-core"
import { co } from "jazz-tools"
import type { AttachmentStorage } from "@/usecase/contracts"
import type { FileAttachmentEntity } from "@/repo/jazzSchema"
import type { FileAttachment } from "@/domain"
import { SharedTripEntity } from "@/repo/jazzSchema"
// eslint-disable @typescript-eslint/no-misused-spread

export function useAttachments(stid: string): AttachmentStorage {
  const entities = useCoState(SharedTripEntity, stid, {
    select: st =>
      st.$isLoaded && st.trip.files.$isLoaded ? st.trip.files : [],
  })

  function mapAttachment(
    entity: co.loaded<typeof FileAttachmentEntity>,
  ): FileAttachment {
    return {
      id: entity.$jazz.id,
      ...entity,
      references: entity.references.map(x => x),
    }
  }

  return {
    attachments: entities.map(mapAttachment),
    loadAsBlob: id => co.fileStream().loadAsBlob(id),
    update: () => {},
  }
}
