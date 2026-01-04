import type { User } from "@/domain"

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

export async function exportUserData(user: User) {
  // const trips = await Promise.all(
  //   Object.values(account.root.trips).map(exportTrip),
  // )
  await Promise.all([])

  return {
    type: "kompass",
    version: 1,
    exportedAt: new Date().toISOString(),
    user,
    // trips,
  }
}
