import {
  useAccount,
  useCoState,
  useIsAuthenticated,
} from "jazz-tools/react-core"
import type { SingleUserRepo } from "@/usecase/contracts"
import type { JoinRequest, Maybe, User, UserRole } from "@/domain"
import type { co } from "jazz-tools"
import type { JoinRequestEntity } from "@/repo/jazzSchema"
import { SharedTripEntity, UserAccount } from "@/repo/jazzSchema"
// eslint-disable @typescript-eslint/no-misused-spread

function mapJoinRequest(
  entity: co.loaded<typeof JoinRequestEntity>,
): JoinRequest {
  return {
    id: entity.$jazz.id,
    ...entity,
    account: {
      id: entity.account.$jazz.id,
      name: entity.account.profile.name,
      avatarImageId: entity.account.profile.avatar?.$jazz.id,
    },
  }
}

export function mapUser(entity: co.loaded<typeof UserAccount>): User {
  return {
    id: entity.$jazz.id,
    name: entity.profile.name,
    avatarImageId: entity.profile.avatar?.$jazz.id,
    joinRequests: new Map(
      Object.entries(entity.root.requests).map(([k, v]) => [
        k,
        mapJoinRequest(v),
      ]),
    ),
  }
}

export function useUserRepo(): SingleUserRepo {
  const isAuthenticated = useIsAuthenticated()
  const entity = useAccount(UserAccount)

  if (!isAuthenticated) return { user: "unauthorized" }

  return {
    user: entity.$isLoaded ? mapUser(entity) : entity.$jazz.loadingState,
  }
}

export function mapUserRole(
  entity: co.loaded<
    typeof SharedTripEntity,
    { admins: true; members: true; guests: true }
  >,
): UserRole | undefined {
  if (entity.admins.myRole() === "admin") return "admin"
  if (entity.members.myRole() === "writer") return "member"
  if (entity.guests.myRole() === "reader") return "guest"

  return undefined
}

export function useUserRole(stid: string): Maybe<UserRole | undefined> {
  const sharedTrip = useCoState(SharedTripEntity, stid, {
    resolve: { admins: true, members: true, guests: true },
  })

  return sharedTrip.$isLoaded
    ? mapUserRole(sharedTrip)
    : sharedTrip.$jazz.loadingState
}
