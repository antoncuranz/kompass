import { useCoState } from "jazz-tools/react-core"
import { DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Dialog } from "./dialog/Dialog"
import type { co } from "jazz-tools"
import type { UserAccount } from "@/schema.ts"
import { SharedTrip } from "@/schema.ts"
import { sendJoinRequest } from "@/lib/collaboration.ts"
import { Button } from "@/components/ui/button.tsx"

export default function TripAccessGuard({
  account,
  sharedTripId,
}: {
  account: co.loaded<
    typeof UserAccount,
    { root: { requests: { $each: true } } }
  >
  sharedTripId: string
}) {
  const sharedTrip = useCoState(SharedTrip, sharedTripId, {
    resolve: { members: true, admins: true, requests: true },
  })

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
    sharedTrip.$isLoaded &&
    !canRead(sharedTrip.members.myRole()) && (
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
