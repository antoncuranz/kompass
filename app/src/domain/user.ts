import * as z from "zod"

export const User = z.object({
  id: z.string(),
  name: z.string(),
  avatarImageId: z.string().optional(),
})
export type User = z.infer<typeof User>

const UpdateUser = User.omit({ id: true, avatarImageId: true })
  .extend({
    avatarImage: z.instanceof(File).nullable(),
  })
  .partial()
export type UpdateUser = z.infer<typeof UpdateUser>
