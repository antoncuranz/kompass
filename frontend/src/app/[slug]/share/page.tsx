"use client"

import Card from "@/components/card/Card.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import { approveJoinRequest, rejectJoinRequest } from "@/lib/collaboration.ts"
import {
  JazzAccount,
  JoinRequest,
  RESOLVE_ACCOUNT,
  RESOLVE_SHARED_TRIP,
  SharedTrip,
} from "@/schema.ts"
import { useAccount, useCoState } from "jazz-tools/react-core"
import { Check, X } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function SharePage() {
  const params = useParams()
  const tripId = params.slug as string
  const { me: account } = useAccount(JazzAccount, { resolve: RESOLVE_ACCOUNT })
  const sharedTrip = useCoState(SharedTrip, tripId, {
    resolve: RESOLVE_SHARED_TRIP,
  })

  if (!sharedTrip || !account) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-2xl p-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </Card>
      </div>
    )
  }

  const isOwner = sharedTrip.$jazz.owner.myRole() === "admin"

  if (!isOwner) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-2xl p-8">
          <p className="text-center text-muted-foreground">
            Only the trip owner can access this page
          </p>
        </Card>
      </div>
    )
  }

  const pendingRequests = sharedTrip.joinRequests.filter(
    req => req?.status === "pending",
  )
  const rejectedRequests = sharedTrip.joinRequests.filter(
    req => req?.status === "rejected",
  )

  return (
    <div className="flex h-full gap-4 py-4">
      <Card className="w-full max-w-4xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Share Trip</h1>
          <p className="text-sm text-muted-foreground">
            Manage access to {sharedTrip.trip.name}
          </p>
        </div>

        {/* Pending Requests */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Pending Requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending access requests
            </p>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map(request =>
                request ? (
                  <RequestRow
                    key={request.$jazz.id}
                    request={request}
                    sharedTrip={sharedTrip}
                  />
                ) : null,
              )}
            </div>
          )}
        </div>

        {/* Members */}
        <MembersSection sharedTrip={sharedTrip} account={account} />

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Rejected Requests ({rejectedRequests.length})
            </h2>
            <div className="space-y-2">
              {rejectedRequests.map(request =>
                request ? (
                  <div
                    key={request.$jazz.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg opacity-50"
                  >
                    <div>
                      <p className="font-medium">
                        {request.account?.profile?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm text-destructive">Rejected</span>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function RequestRow({
  request,
  sharedTrip,
}: {
  request: JoinRequest
  sharedTrip: SharedTrip
}) {
  const [selectedRole, setSelectedRole] = useState<"reader" | "writer">(
    "reader",
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = () => {
    setIsProcessing(true)
    approveJoinRequest(request, sharedTrip.trip.$jazz.owner, selectedRole)
    toast.success(`Access granted as ${selectedRole}`)
    setIsProcessing(false)
  }

  const handleReject = () => {
    setIsProcessing(true)
    rejectJoinRequest(request)
    toast.success("Access request rejected")
    setIsProcessing(false)
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div>
        <p className="font-medium">
          {request.account?.profile?.name || "Unknown"}
        </p>
        <p className="text-xs text-muted-foreground">
          Requested {new Date(request.requestedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectPositioner>
            <SelectContent>
              <SelectItem value="reader">Reader</SelectItem>
              <SelectItem value="writer">Writer</SelectItem>
            </SelectContent>
          </SelectPositioner>
        </Select>
        <Button
          size="icon"
          variant="default"
          onClick={handleApprove}
          disabled={isProcessing}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={handleReject}
          disabled={isProcessing}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function MembersSection({
  sharedTrip,
  account,
}: {
  sharedTrip: SharedTrip
  account: JazzAccount
}) {
  // TODO: Get members from group when Jazz provides API
  // For now, show approved requests
  const approvedRequests = sharedTrip.joinRequests.filter(
    req => req?.status === "approved",
  )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Members</h2>
      <div className="space-y-2">
        {/* Owner */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="font-medium">{account.profile.name} (You)</p>
          </div>
          <span className="text-sm text-muted-foreground">Owner</span>
        </div>

        {/* Approved members */}
        {approvedRequests.map(request =>
          request?.account ? (
            <div
              key={request.$jazz.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {request.account.profile?.name || "Unknown"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Member</span>
                {/* TODO: Add role change and remove member functionality */}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}
