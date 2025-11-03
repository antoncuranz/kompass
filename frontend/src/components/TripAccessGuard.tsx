"use client"

import { Button } from "@/components/ui/button.tsx"
import { sendJoinRequest } from "@/lib/collaboration.ts"
import { JazzAccount, RESOLVE_ACCOUNT, SharedTrip } from "@/schema.ts"
import {
  useAccount,
  useCoState,
  useCoStateWithSelector,
} from "jazz-tools/react-core"
import { useState } from "react"
import { toast } from "sonner"
import Card from "./card/Card"

export default function TripAccessGuard({
  tripId,
  children,
}: {
  tripId: string
  children: React.ReactNode
}) {
  const { me: account } = useAccount(JazzAccount, { resolve: RESOLVE_ACCOUNT })
  const sharedTrip = useCoState(SharedTrip, tripId, {
    resolve: { joinRequests: true },
  })
  const trip = useCoStateWithSelector(SharedTrip, tripId, {
    select: sharedTrip => sharedTrip?.trip,
  })
  const [hasRequested, setHasRequested] = useState(false)

  if (!sharedTrip || !account) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md p-8">
          <p className="text-center text-muted-foreground">Loading trip...</p>
        </Card>
      </div>
    )
  }

  if (trip) {
    return <>{children}</>
  }

  const existingRequest = sharedTrip.joinRequests.find(
    req => req?.account?.$jazz.id === account.$jazz.id,
  )

  const requestStatus = existingRequest?.status

  const handleRequestAccess = () => {
    sendJoinRequest(sharedTrip.joinRequests, account)
    setHasRequested(true)
    toast.success("Access request sent")
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="max-w-md p-8 space-y-6">
        <div className="space-y-4">
          {requestStatus === "pending" || hasRequested ? (
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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                You don&apos;t have access to this trip
              </p>
              <Button onClick={handleRequestAccess} className="w-full">
                Request Access
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
