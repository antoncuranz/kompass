import {
  useAccount,
  useCoState,
  useIsAuthenticated,
} from "jazz-tools/react-core"
import { createImage } from "jazz-tools/media"
import { mapUser, mapUserRole } from "./mappers"
import type { SingleUserRepo } from "@/repo/contracts"
import type { Maybe, UserRole } from "@/domain"
import { SharedTripEntity, UserAccount } from "@/repo/jazzSchema"
// eslint-disable @typescript-eslint/no-misused-spread

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

export function useUserRole(stid: string): Maybe<UserRole | undefined> {
  const sharedTrip = useCoState(SharedTripEntity, stid, {
    resolve: { admins: true, members: true, guests: true },
  })

  return sharedTrip.$isLoaded
    ? mapUserRole(sharedTrip)
    : sharedTrip.$jazz.loadingState
}
