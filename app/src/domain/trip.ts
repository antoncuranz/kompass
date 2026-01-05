import * as z from "zod"
import { CoRichText } from "jazz-tools"
import { User } from "./user"

export { User } from "./user"
export type { UpdateUser } from "./user"
export {
  Maybe,
  type Loaded,
  type NotLoaded,
  type UnavailableReason,
} from "./common"

const JoinRequestStatus = z.enum(["pending", "approved", "rejected"])
export type JoinRequestStatus = z.infer<typeof JoinRequestStatus>

const JoinRequest = z.object({
  id: z.string(),
  user: User,
  status: JoinRequestStatus,
  requestedAt: z.iso.datetime(),
})
export type JoinRequest = z.infer<typeof JoinRequest>

export const GrantedRoleValues = ["admin", "member", "guest"] as const

const UserRole = z.enum([...GrantedRoleValues, "unauthorized"])
export type UserRole = z.infer<typeof UserRole>

const GrantedRole = z.enum(GrantedRoleValues)
export type GrantedRole = z.infer<typeof GrantedRole>

export const UserRoleHelpers = {
  canRead: (role: UserRole | undefined): role is UserRole =>
    role !== undefined && role !== "unauthorized",
  canWrite: (role: UserRole | undefined) =>
    role === "admin" || role === "member",
  canAdmin: (role: UserRole | undefined) => role === "admin",
} as const

const TripMeta = z.object({
  stid: z.string(),
  myRole: UserRole.optional(),
  admins: z.array(User),
  members: z.array(User),
  guests: z.array(User),
  workers: z.array(User),
  joinRequests: z.map(z.string(), JoinRequest),
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
