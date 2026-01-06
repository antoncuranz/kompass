import * as z from "zod"

const Coordinates = z.object({
  latitude: z.number(),
  longitude: z.number(),
})
export type Coordinates = z.infer<typeof Coordinates>

export const Location = z.object({
  id: z.string(),
  ...Coordinates.shape,
})
export type Location = z.infer<typeof Location>

export const CreateLocation = Location.omit({ id: true })
export type CreateLocation = z.infer<typeof CreateLocation>

export const UpdateLocation = CreateLocation.partial()
export type UpdateLocation = z.infer<typeof UpdateLocation>
