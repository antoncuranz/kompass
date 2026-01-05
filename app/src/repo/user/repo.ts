import { useAccount, useCoState } from "jazz-tools/react-core"
import { createImage } from "jazz-tools/media"
import { JoinRequestEntity } from "../common/schema"
import { mapUser, mapUserRole } from "./mappers"
import { UserAccount } from "./schema"
import type { SingleUserRepo } from "@/repo/contracts"
import type { UserRole } from "@/domain"
import { Maybe } from "@/domain"
import { SharedTripEntity } from "@/repo/trip/schema"
import { mapJoinRequests } from "@/repo/common/mappers"
// eslint-disable @typescript-eslint/no-misused-spread

export function useUserRepo(userId?: string): SingleUserRepo {
  const entity = userId
    ? useCoState(UserAccount, userId)
    : useAccount(UserAccount)

  return {
    user: entity.$isLoaded
      ? Maybe.of(mapUser(entity))
      : Maybe.notLoaded(entity.$jazz.loadingState),

    update: async values => {
      if (userId) throw new Error("can only make changes to current user")

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
