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

  account.root.tripMap.$jazz.set(sharedTrip.$jazz.id, sharedTrip)
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

async function exportTrip(sharedTrip: co.loaded<typeof SharedTrip>) {
  const transportation = await Promise.all(
    sharedTrip.trip.transportation.map(async t => await loadTransportation(t)),
  )
  return {
    id: sharedTrip.$jazz.id,
    transportation,
    ...sharedTrip.trip.toJSON(),
  }
}

export async function exportUserData(account: co.loaded<typeof UserAccount>) {
  const trips = await Promise.all(
    Object.values(account.root.tripMap).map(exportTrip),
  )

  return {
    type: "kompass",
    version: 1,
    exportedAt: new Date().toISOString(),
    account: {
      id: account.$jazz.id,
      name: account.profile.name,
      avatar: account.profile.avatar?.$jazz.id,
    },
    trips,
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
      return transportation.legs[transportation.legs.length - 1].arrivalDateTime

    case "train":
      return transportation.legs[transportation.legs.length - 1].arrivalDateTime

    case "generic":
      return transportation.arrivalDateTime
  }
}

export function getTransportationName(transportation: Transportation): string {
  switch (transportation.type) {
    case "flight": {
      const firstLeg = transportation.legs[0]
      const lastLeg = transportation.legs[transportation.legs.length - 1]
      return `Flight ${firstLeg.flightNumber} from ${firstLeg.origin.municipality} to ${lastLeg.destination.municipality}${transportation.legs.length > 1 ? ` (+${transportation.legs.length - 1})` : ""}`
    }
    case "train": {
      const firstLeg = transportation.legs[0]
      const lastLeg = transportation.legs[transportation.legs.length - 1]
      return `Train ${firstLeg.lineName} from ${firstLeg.origin.name} to ${lastLeg.destination.name}${transportation.legs.length > 1 ? ` (+${transportation.legs.length - 1})` : ""}`
    }
    case "generic":
      return transportation.name
  }
}
