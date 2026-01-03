import * as z from "zod"

export const FileAttachment = z.object({
  id: z.string(),
  name: z.string(),
  references: z.array(z.string()),
})
export type FileAttachment = z.infer<typeof FileAttachment>

export const CreateFileAttachment = FileAttachment.omit({ id: true })
export type CreateFileAttachment = z.infer<typeof CreateFileAttachment>

export const UpdateFileAttachment = CreateFileAttachment.partial()
export type UpdateFileAttachment = z.infer<typeof UpdateFileAttachment>
