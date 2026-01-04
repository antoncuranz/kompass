import type { co } from "jazz-tools"
import type { FileAttachmentEntity } from "@/repo/jazzSchema"
import type { FileAttachment } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapAttachment(
  entity: co.loaded<typeof FileAttachmentEntity>,
): FileAttachment {
  return {
    id: entity.$jazz.id,
    ...entity,
    references: entity.references.map(x => x),
  }
}
