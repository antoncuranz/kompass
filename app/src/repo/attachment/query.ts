import { useCoState } from "jazz-tools/react-core"
import { co } from "jazz-tools"
import { mapAttachment } from "./mappers"
import { FileAttachmentEntity } from "./schema"
import type { AttachmentQuery } from "@/repo/contracts"
import { Maybe } from "@/domain"

export function useAttachmentQuery(id: string): AttachmentQuery {
  const entity = useCoState(FileAttachmentEntity, id)

  return {
    attachment: entity.$isLoaded
      ? Maybe.of(mapAttachment(entity))
      : Maybe.notLoaded(entity.$jazz.loadingState),

    loadAsBlob: () => {
      if (!entity.$isLoaded)
        throw new Error("FileAttachmentEntity is not loaded!")

      return co.fileStream().loadAsBlob(entity.file.$jazz.id)
    },
  }
}
