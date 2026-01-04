import { useCoState } from "jazz-tools/react-core"
import { co } from "jazz-tools"
import { mapAttachment } from "./mappers"
import type { SingleAttachmentRepo } from "@/usecase/contracts"
import { FileAttachmentEntity } from "@/repo/jazzSchema"
// eslint-disable @typescript-eslint/no-misused-spread

export function useSingleAttachmentRepo(id: string): SingleAttachmentRepo {
  const entity = useCoState(FileAttachmentEntity, id)

  return {
    attachment: entity.$isLoaded
      ? mapAttachment(entity)
      : entity.$jazz.loadingState,

    loadAsBlob: () => co.fileStream().loadAsBlob(id),
  }
}
