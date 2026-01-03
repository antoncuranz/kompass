import * as z from "zod"
import { CoRichText } from "jazz-tools"

export const Trip = z.object({
  stid: z.string(),
  tid: z.string(),
  name: z.string(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  notes: CoRichText,
  // activities: z.array(Activity),
  // accommodation: z.array(Accommodation),
  // transportation: z.array(Transportation),
  // files: z.array(FileAttachment),
})
export type Trip = z.infer<typeof Trip>

export const CreateTrip = Trip.omit({ stid: true, tid: true, notes: true })
export type CreateTrip = z.infer<typeof CreateTrip>

export const UpdateTrip = CreateTrip.partial()
export type UpdateTrip = z.infer<typeof UpdateTrip>

export type UnavailableReason = "loading" | "unavailable" | "unauthorized"
export type MaybeTrip = Trip | UnavailableReason

export function isLoaded(maybeTrip: MaybeTrip) {
  return (
    maybeTrip !== "loading" &&
    maybeTrip !== "unavailable" &&
    maybeTrip !== "unauthorized"
  )
}
