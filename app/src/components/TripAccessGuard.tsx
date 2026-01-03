import { useAccount, useCoState, useIsAuthenticated } from "jazz-tools/react"
import { DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Dialog } from "./dialog/Dialog"
import { SharedTripEntity, UserAccount } from "@/repo/jazzSchema"
import { sendJoinRequest } from "@/lib/collaboration-utils"
import { Button } from "@/components/ui/button.tsx"

export default function TripAccessGuard({
  sharedTripId,
}: {
  sharedTripId: string
}) {
  const account = useAccount(UserAccount)
  const isAuthenticated = useIsAuthenticated()
  const sharedTrip = useCoState(SharedTripEntity, sharedTripId, {
    resolve: { admins: true, members: true, guests: true, requests: true },
  })

  if (!account.$isLoaded || !sharedTrip.$isLoaded) return null
  if (!isAuthenticated) return null

  const existingRequest =
    sharedTripId in account.root.requests
      ? account.root.requests[sharedTripId]
      : undefined
  const requestStatus = existingRequest?.status

  function canRead(role: string | undefined) {
    return (
      role == "reader" ||
      role == "writer" ||
      role == "manager" ||
      role == "admin"
    )
  }

  return (
    !canRead(sharedTrip.guests.myRole()) && (
      <Dialog>
        <DialogHeader>
          <DialogTitle>Unauthorized</DialogTitle>
        </DialogHeader>
        {requestStatus === "pending" ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Access request pending
            </p>
            <p className="text-xs text-muted-foreground">
              The trip owner will review your request
            </p>
          </div>
        ) : requestStatus === "rejected" ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">Access request denied</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground text-center">
              You don't have access to this trip
            </p>
            <DialogFooter>
              <Button
                size="round"
                className="w-full"
                onClick={() => sendJoinRequest(sharedTrip, account)}
              >
                Request Access
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    )
  )
}
