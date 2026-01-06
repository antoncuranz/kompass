import type { co } from "jazz-tools"
import type { FileAttachmentEntity } from "./schema"
import type { FileAttachment } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapAttachment(
  entity: co.loaded<typeof FileAttachmentEntity>,
): FileAttachment {
  return {
    id: entity.$jazz.id,
    name: entity.name,
    references: entity.references.map(x => x),
  }
}
