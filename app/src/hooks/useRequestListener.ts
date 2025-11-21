import { useEffect } from "react"
import { useAccount } from "jazz-tools/react"
import { toast } from "sonner"
import { SharedTrip, UserAccount } from "@/schema"

export function useRequestListener() {
  const account = useAccount(UserAccount, {
    resolve: {
      root: {
        requests: { $each: true },
        trips: true,
      },
    },
  })

  useEffect(() => {
    if (!account.$isLoaded) return

    const requests = account.root.requests
    const trips = account.root.trips

    async function processRequests() {
      for (const [sharedTripId, request] of Object.entries(requests)) {
        if (request.status !== "approved") continue

        try {
          const sharedTrip = await SharedTrip.load(sharedTripId)

          if (!sharedTrip.$isLoaded) continue

          const alreadyAdded = trips.some(
            trip => trip.$jazz.id === sharedTripId,
          )

          if (!alreadyAdded) {
            trips.$jazz.push(sharedTrip)
            toast.success(`"${sharedTrip.trip.name}" added to your trips`)
          }

          requests.$jazz.delete(sharedTripId)
        } catch (error) {
          toast.error("Failed to process trip access request: " + error)
        }
      }
    }

    processRequests()
  }, [account])

  return null
}
