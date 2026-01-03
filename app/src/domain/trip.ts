import * as z from "zod"
import { CoRichText } from "jazz-tools"

const JoinRequestStatus = z.enum(["pending", "approved", "rejected"])
export type JoinRequestStatus = z.infer<typeof JoinRequestStatus>

const UserWithoutRequests = z.object({
  id: z.string(),
  name: z.string(),
  avatarImageId: z.string().optional(),
})

const JoinRequest = z.object({
  id: z.string(),
  account: UserWithoutRequests,
  status: JoinRequestStatus,
  requestedAt: z.iso.datetime(),
})
export type JoinRequest = z.infer<typeof JoinRequest>

const User = UserWithoutRequests.extend({
  joinRequests: z.map(z.string(), JoinRequest),
})
export type User = z.infer<typeof User>

export const UserRoleValues = ["admin", "member", "guest"] as const
const UserRole = z.enum(UserRoleValues)
export type UserRole = z.infer<typeof UserRole>

const TripMeta = z.object({
  stid: z.string(),
  myRole: UserRole.optional(),
  admins: z.array(User),
  members: z.array(User),
  guests: z.array(User),
  workers: z.array(User),
  joinRequests: z.array(JoinRequest),
})
export type TripMeta = z.infer<typeof TripMeta>

export const Trip = z.object({
  stid: z.string(),
  tid: z.string(),
  name: z.string(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  notes: z.instanceof(CoRichText),
})
export type Trip = z.infer<typeof Trip>

export const CreateTrip = Trip.omit({ stid: true, tid: true, notes: true })
export type CreateTrip = z.infer<typeof CreateTrip>

export const UpdateTrip = CreateTrip.partial()
export type UpdateTrip = z.infer<typeof UpdateTrip>

export type UnavailableReason = "loading" | "unavailable" | "unauthorized"
export type Maybe<T> = T | UnavailableReason

export function isLoaded<T>(entity: Maybe<T>): entity is T {
  return (
    entity !== "loading" &&
    entity !== "unavailable" &&
    entity !== "unauthorized"
  )
}
