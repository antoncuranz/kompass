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
    if (!approvedRequests?.some(request => request.status === "approved"))
      return
    const currentAccount = UserAccount.getMe()
    let cancelled = false
    const isCancelled = () =>
      cancelled || UserAccount.getMe().$jazz.id !== currentAccount.$jazz.id
    let timer: ReturnType<typeof setTimeout> | undefined
    const reportedErrors = new Set<string>()

    async function processRequests() {
      let retry = false
      try {
        const account = await currentAccount.$jazz.ensureLoaded({
          resolve: {
            root: { requests: { $each: JoinRequestEntity.resolveQuery } },
          },
        })
        for (const { sharedTripId, status } of approvedRequests ?? []) {
          if (isCancelled()) return
          if (status !== "approved") continue
          if (!account.root.requests.$jazz.has(sharedTripId)) continue
          const request = account.root.requests[sharedTripId]
          if (!request.$isLoaded || request.status !== "approved") continue

          try {
            const sharedTrip = await SharedTripEntity.load(sharedTripId, {
              resolve: { trip: true },
            })
            if (isCancelled()) return
            if (!sharedTrip.$isLoaded) {
              retry = true
              continue
            }
            if (await addTripToCurrentUser(sharedTripId)) {
              toast.success(`"${sharedTrip.trip.name}" added to your trips`)
            }
            if (isCancelled()) return
            account.root.requests.$jazz.delete(sharedTripId)
          } catch (error) {
            retry = true
            if (!isCancelled() && !reportedErrors.has(sharedTripId)) {
              reportedErrors.add(sharedTripId)
              toast.error("Failed to process trip access request: " + error)
            }
          }
        }
      } catch (error) {
        retry = true
        if (!isCancelled() && !reportedErrors.has("account")) {
          reportedErrors.add("account")
          toast.error("Failed to process trip access request: " + error)
        }
      }
      // Approval and group permissions may sync separately. Keep the request
      // until the trip has actually been added, and retry transient failures.
      if (!isCancelled() && retry)
        timer = setTimeout(() => void processRequests(), 3000)
    }

    void processRequests()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [approvedRequests])

  return null
}
