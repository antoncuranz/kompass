import * as z from "zod"
import { CreateLocation, Location } from "./"

export const Accommodation = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  arrivalDate: z.iso.date(),
  departureDate: z.iso.date(),
  price: z.number().optional(),
  address: z.string().optional(),
  location: Location.optional(),
})
export type Accommodation = z.infer<typeof Accommodation>

export const CreateAccommodation = z
  .object({
    ...Accommodation.shape,
    location: CreateLocation.optional(),
  })
  .omit({ id: true })
export type CreateAccommodation = z.infer<typeof CreateAccommodation>

export const UpdateAccommodation = CreateAccommodation.partial()
export type UpdateAccommodation = z.infer<typeof UpdateAccommodation>
