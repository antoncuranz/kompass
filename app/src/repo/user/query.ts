import { useAccount, useCoState } from "jazz-tools/react-core"
import { createImage } from "jazz-tools/media"
import { mapUser } from "./mappers"
import { UserAccount } from "./schema"
import type { UserQuery } from "@/repo/contracts"
import { Maybe } from "@/domain"

export function useUserQuery(userId?: string): UserQuery {
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
