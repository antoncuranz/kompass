import { useCoState } from "jazz-tools/react-core"
import { co } from "jazz-tools"
import { mapAttachment } from "./mappers"
import { FileAttachmentEntity } from "./schema"
import type { SingleAttachmentRepo } from "@/repo/contracts"
import { Maybe } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function useSingleAttachmentRepo(id: string): SingleAttachmentRepo {
  const entity = useCoState(FileAttachmentEntity, id)

  return {
    attachment: entity.$isLoaded
      ? Maybe.of(mapAttachment(entity))
      : Maybe.notLoaded(entity.$jazz.loadingState),

    loadAsBlob: () => co.fileStream().loadAsBlob(id),
  }
}
