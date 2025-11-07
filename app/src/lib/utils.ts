import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Group } from "jazz-tools"
import type { CoValue, MaybeLoaded, co } from "jazz-tools"
import type { ClassValue } from "clsx"
import type { Transportation, UserAccount } from "@/schema"
import {
  Flight,
  GenericTransportation,
  JoinRequests,
  RequestStatuses,
  SharedTrip,
  Train,
  Trip,
} from "@/schema"

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function isLoaded<T extends CoValue>(item: MaybeLoaded<T>): item is T {
  return item.$isLoaded === true
}

export function createNewTrip(
  account: co.loaded<typeof UserAccount>,
  values: co.input<typeof Trip>,
) {
  const adminsGroup = Group.create()

  const membersGroup = Group.create()
  membersGroup.addMember(adminsGroup)

  const requestsGroup = Group.create()
  requestsGroup.addMember("everyone", "writeOnly")
  requestsGroup.addMember(adminsGroup)

  const publicGroup = Group.create()
  publicGroup.addMember("everyone", "reader")
  publicGroup.addMember(adminsGroup)

  const sharedTrip = SharedTrip.create(
    {
      trip: Trip.create(values, membersGroup),
      requests: JoinRequests.create({}, requestsGroup),
      statuses: RequestStatuses.create({}, adminsGroup),
      members: membersGroup,
      admins: adminsGroup,
    },
    publicGroup,
  )

  account.root.trips.$jazz.push(sharedTrip)
}

export async function loadTransportation(
  transportation: co.loaded<typeof Transportation>,
) {
  switch (transportation.type) {
    case "flight":
      return await transportation.$jazz.ensureLoaded({
        resolve: Flight.resolveQuery,
      })

    case "train":
      return await transportation.$jazz.ensureLoaded({
        resolve: Train.resolveQuery,
      })

    case "generic":
      return await transportation.$jazz.ensureLoaded({
        resolve: GenericTransportation.resolveQuery,
      })
  }
}

export function getDepartureDateTime(transportation: Transportation): string {
  switch (transportation.type) {
    case "flight":
      return transportation.legs[0].departureDateTime

    case "train":
      return transportation.legs[0].departureDateTime

    case "generic":
      return transportation.departureDateTime
  }
}

export function getArrivalDateTime(transportation: Transportation): string {
  switch (transportation.type) {
    case "flight":
      return transportation.legs[0].arrivalDateTime

    case "train":
      return transportation.legs[0].arrivalDateTime

    case "generic":
      return transportation.arrivalDateTime
  }
}
