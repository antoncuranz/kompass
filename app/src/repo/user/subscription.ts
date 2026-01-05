import { useAccount, useCoState } from "jazz-tools/react-core"
import { JoinRequestEntity } from "../common/schema"
import { mapUserRole } from "./mappers"
import { UserAccount } from "./schema"
import type { UserRole } from "@/domain"
import { Maybe } from "@/domain"
import { SharedTripEntity } from "@/repo/trip/schema"
import { mapJoinRequests } from "@/repo/common/mappers"

export function useJoinRequests() {
  const entity = useAccount(UserAccount, {
    resolve: { root: { requests: { $each: JoinRequestEntity.resolveQuery } } },
  })

  return entity.$isLoaded
    ? Maybe.of(mapJoinRequests(entity.root.requests))
    : Maybe.notLoaded(entity.$jazz.loadingState)
}

export function useUserRole(stid: string): UserRole | undefined {
  const sharedTrip = useCoState(SharedTripEntity, stid, {
    resolve: { admins: true, members: true, guests: true },
  })

  return sharedTrip.$isLoaded ? mapUserRole(sharedTrip) : undefined
}
