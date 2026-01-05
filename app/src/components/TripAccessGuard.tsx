import { DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Dialog } from "./dialog/Dialog"
import { sendJoinRequest } from "@/lib/collaboration"
import { Button } from "@/components/ui/button.tsx"
import { useJoinRequests, useUserRole } from "@/repo/user"

export default function TripAccessGuard({ stid }: { stid: string }) {
  const userRole = useUserRole(stid)
  const joinRequests = useJoinRequests()

  const existingRequestStatus = joinRequests.$isLoaded
    ? joinRequests.get(stid)?.status
    : undefined

  return (
    userRole === "unauthorized" && (
      <Dialog>
        <DialogHeader>
          <DialogTitle>Unauthorized</DialogTitle>
        </DialogHeader>
        {existingRequestStatus === "pending" ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Access request pending
            </p>
            <p className="text-xs text-muted-foreground">
              The trip owner will review your request
            </p>
          </div>
        ) : existingRequestStatus === "rejected" ? (
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
                onClick={() => sendJoinRequest(stid)}
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
