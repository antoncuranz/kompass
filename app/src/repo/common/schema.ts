import { co, z } from "jazz-tools"
import { AccountProfile } from "../user/schema"

export const LocationEntity = co.map({
  latitude: z.number(),
  longitude: z.number(),
})

export const JoinRequestStatus = z.enum(["pending", "approved", "rejected"])

export const JoinRequestEntity = co
  .map({
    account: co.account({ root: co.map({}), profile: AccountProfile }),
    status: JoinRequestStatus,
    requestedAt: z.iso.datetime(),
  })
  .resolved({ account: { profile: AccountProfile.resolveQuery } })
