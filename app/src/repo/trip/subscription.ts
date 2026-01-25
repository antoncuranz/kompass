import { useAccount } from "jazz-tools/react-core"
import { tryMap } from "../common/mappers"
import { mapTrip } from "./mappers"
import type { TripSubscription } from "@/repo/contracts"
import type { Trip } from "@/domain"
import { UserAccount } from "@/repo/user/schema"
import { dateFromString } from "@/lib/datetime"

export function useTripSubscription(): TripSubscription {
  const entities = useAccount(UserAccount, {
    resolve: { root: { trips: { $each: { trip: { notes: true } } } } },
    select: account =>
      account.$isLoaded ? Object.values(account.root.trips) : [],
  })

  function sorted(trips: Array<Trip>) {
    return trips.sort((a: Trip, b: Trip) => {
      return (
        dateFromString(b.startDate).getTime() -
        dateFromString(a.startDate).getTime()
      )
    })
  }

  return {
    trips: sorted(tryMap(entities, mapTrip)),
  }
}
