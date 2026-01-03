import * as z from "zod"
import { CreateLocation, Location } from "./"

export const Activity = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  date: z.iso.date(),
  time: z.iso.time().optional(),
  price: z.number().optional(),
  address: z.string().optional(),
  location: Location.optional(),
})
export type Activity = z.infer<typeof Activity>

export const CreateActivity = z
  .object({
    ...Activity.shape,
    location: CreateLocation.optional(),
  })
  .omit({ id: true })
export type CreateActivity = z.infer<typeof CreateActivity>

export const UpdateActivity = CreateActivity.partial()
export type UpdateActivity = z.infer<typeof UpdateActivity>
