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

  function isUnauthorized() {
    const role = sharedTrip?.members.myRole()
    return sharedTrip != undefined && !canRead(role)
  }

  function canRead(role: string | undefined) {
    return (
      role == "reader" ||
      role == "writer" ||
      role == "manager" ||
      role == "admin"
    )
  }

  // const test = sharedTripId in account.root.requests
  console.log("existingRequest", account.root.requests[sharedTripId])
  const existingRequest = account.root.requests[sharedTripId]
  const requestStatus = existingRequest?.status

  return (
    <Dialog open={isUnauthorized()} setOpen={() => {}}>
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
              onClick={() => sendJoinRequest(sharedTrip!, account)}
            >
              Request Access
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  )
}
