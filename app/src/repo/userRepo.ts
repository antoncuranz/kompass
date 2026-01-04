import {
  useAccount,
  useCoState,
  useIsAuthenticated,
} from "jazz-tools/react-core"
import { createImage } from "jazz-tools/media"
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

  if (!isAuthenticated) return { user: "unauthorized", update: async () => {} }

  return {
    user: entity.$isLoaded ? mapUser(entity) : entity.$jazz.loadingState,

    update: async values => {
      const account = await UserAccount.getMe().$jazz.ensureLoaded({
        resolve: { profile: true },
      })

      if (values.name) account.profile.$jazz.set("name", values.name)

      if (values.avatarImage === null) {
        account.profile.$jazz.set("avatar", undefined)
      } else if (values.avatarImage) {
        account.profile.$jazz.set(
          "avatar",
          await createImage(values.avatarImage, {
            owner: account.profile.$jazz.owner,
            progressive: true,
            placeholder: "blur",
          }),
        )
      }
    },
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
