import { co, z } from "jazz-tools"

export const AccountProfile = co.profile({
  avatar: co.image().optional(),
})

export const LocationEntity = co.map({
  latitude: z.number(),
  longitude: z.number(),
})

export const RequestStatusEntity = z.enum(["pending", "approved", "rejected"])

export const JoinRequestEntity = co
  .map({
    account: co.account({ root: co.map({}), profile: AccountProfile }),
    status: RequestStatusEntity,
    requestedAt: z.iso.datetime(),
  })
  .resolved({
    account: { profile: AccountProfile.resolveQuery },
    $onError: "catch",
  })
