import type { Trip, TripMeta, User } from "@/domain"
import type { Group, co } from "jazz-tools"
import type { SharedTripEntity } from "./schema"
import { mapUserRole } from "@/repo/user/mappers"
import { UserAccount } from "@/repo/user/schema"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapTrip(
  entity: co.loaded<typeof SharedTripEntity, { trip: { notes: true } }>,
): Trip {
  return {
    stid: entity.$jazz.id,
    tid: entity.trip.$jazz.id,
    ...entity.trip,
  }
}

export async function mapGroup(
  group: Group,
  includeAdmins = false,
): Promise<Array<User>> {
  const loaded = await Promise.all(
    group
      .getDirectMembers()
      .filter(member => member.role !== "admin" || includeAdmins)
      .map(member =>
        UserAccount.load(member.account.$jazz.id, {
          resolve: { profile: { avatar: true } },
        }),
      ),
  )

  return loaded
    .filter(account => account.$isLoaded)
    .map(account => {
      return {
        id: account.$jazz.id,
        name: account.profile.name,
        avatarImageId: account.profile.avatar?.$jazz.id,
        joinRequests: new Map(),
      }
    })
}

export async function mapTripMeta(
  entity: co.loaded<
    typeof SharedTripEntity,
    { admins: true; members: true; guests: true; workers: true }
  >,
): Promise<TripMeta> {
  return {
    stid: entity.$jazz.id,
    myRole: mapUserRole(entity),
    admins: await mapGroup(entity.admins, true),
    members: await mapGroup(entity.members),
    guests: await mapGroup(entity.guests),
    workers: await mapGroup(entity.workers),
    joinRequests: [],
  }
}
