import { co, z } from "jazz-tools"

export const FileAttachmentEntity = co
  .map({
    name: z.string(),
    file: co.fileStream(),
    references: co.list(z.string()),
  })
  .resolved({
    references: true,
  })
