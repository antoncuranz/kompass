import type { co } from "jazz-tools"
import type { UserAccount } from "@/repo/jazzSchema"

// async function exportTrip(trip: Trip) {
//   // const transportation = await Promise.all(
//   //   sharedTrip.trip.transportation.map(async t => await loadTransportation(t)),
//   // )
//   return {
//     id: sharedTrip.$jazz.id,
//     transportation,
//     ...sharedTrip.trip.toJSON(),
//   }
// }

export async function exportUserData(account: co.loaded<typeof UserAccount>) {
  // const trips = await Promise.all(
  //   Object.values(account.root.trips).map(exportTrip),
  // )

  return {
    type: "kompass",
    version: 1,
    exportedAt: new Date().toISOString(),
    account: {
      id: account.$jazz.id,
      name: account.profile.name,
      avatar: account.profile.avatar?.$jazz.id,
    },
    // trips,
  }
}
