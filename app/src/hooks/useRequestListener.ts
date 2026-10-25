import { useEffect } from "react"
import { useAccount } from "jazz-tools/react"
import { toast } from "sonner"
import { JoinRequestEntity } from "@/repo/common/schema"
import { addTripToCurrentUser } from "@/lib/collaboration"
import { SharedTripEntity } from "@/repo/trip/schema"
import { UserAccount } from "@/repo/user/schema"

type ApprovedRequest = {
  sharedTripId: string
  status: string
}

function sameApprovedRequests(
  previous: Array<ApprovedRequest> | undefined,
  next: Array<ApprovedRequest> | undefined,
) {
  if (!previous || !next) return previous === next

  return (
    previous.length === next.length &&
    previous.every(
      (request, index) =>
        request.sharedTripId === next[index]?.sharedTripId &&
        request.status === next[index]?.status,
    )
  )
}

export function useRequestListener() {
  const approvedRequests = useAccount(UserAccount, {
    resolve: {
      root: {
        requests: { $each: JoinRequestEntity.resolveQuery },
      },
    },
    // CoValue references are stable when a nested JoinRequest changes. Select
    // its status so an approval causes this hook to re-render and process it.
    select: account =>
      account.$isLoaded
        ? Object.entries(account.root.requests).flatMap(
            ([sharedTripId, request]) =>
              request.$isLoaded
                ? [{ sharedTripId, status: request.status }]
                : [],
          )
        : undefined,
    equalityFn: sameApprovedRequests,
  })

  useEffect(() => {
    if (!approvedRequests) return
    const requestsToProcess = approvedRequests

    async function processRequests() {
      const account = await UserAccount.getMe().$jazz.ensureLoaded({
        resolve: { root: { requests: { $each: JoinRequestEntity.resolveQuery } } },
      })

      const { requests } = account.root

      for (const { sharedTripId, status } of requestsToProcess) {
        if (status !== "approved") continue

        try {
          const sharedTrip = await SharedTripEntity.load(sharedTripId, { resolve: { trip: true } })
          if (!sharedTrip.$isLoaded) continue

          if (await addTripToCurrentUser(sharedTripId)) {
            toast.success(`"${sharedTrip.trip.name}" added to your trips`)
          }

          requests.$jazz.delete(sharedTripId)
        } catch (error) {
          toast.error("Failed to process trip access request: " + error)
        }
      }
    }

    void processRequests()
  }, [approvedRequests])

  return null
}
