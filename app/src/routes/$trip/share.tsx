import { Check, X } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { createFileRoute } from "@tanstack/react-router"
import type { Account, co } from "jazz-tools"
import type { JoinRequest, SharedTrip } from "@/schema.ts"
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
import { formatDateShort } from "@/components/util.ts"
import ShareButton from "@/components/buttons/ShareButton"
import { useSharedTrip } from "@/components/provider/TripProvider"

export const Route = createFileRoute("/$trip/share")({
  component: SharePage,
})

function SharePage() {
  const sharedTrip = useSharedTrip()

  const pendingRequests = Object.values(sharedTrip.requests).filter(
    req => req.status === "pending",
  )

  const admins = sharedTrip.admins.getDirectMembers()
  const members = sharedTrip.members.getDirectMembers()

  return (
    <Card
      title="Share Trip"
      headerSlot={<ShareButton sharedTripId={sharedTrip.$jazz.id} />}
      testId="share-card"
    >
      <div className="m-2 space-y-2">
        {pendingRequests.length > 0 && (
          <>
            <h2 className="text-lg font-semibold">Pending Requests</h2>
            <div className="space-y-2">
              {pendingRequests.map(request => (
                <RequestRow
                  key={request.$jazz.id}
                  request={request}
                  sharedTrip={sharedTrip}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="text-lg font-semibold">Admins</h2>
        <div className="space-y-2">
          {admins.map(admin => (
            <MemberRow
              key={admin.id}
              account={admin.account}
              role={admin.role}
            />
          ))}
        </div>

        <h2 className="text-lg font-semibold">Members</h2>
        <div className="space-y-2">
          {members.map(member => (
            <MemberRow
              key={member.id}
              account={member.account}
              role={member.role}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

function RequestRow({
  request,
  sharedTrip,
}: {
  request: co.loaded<typeof JoinRequest>
  sharedTrip: co.loaded<typeof SharedTrip>
}) {
  const [isProcessing, startTransition] = useTransition()
  const [selectedRole, setSelectedRole] = useState<"reader" | "writer">(
    "reader",
  )

  async function processRequest(approve: boolean) {
    const loaded = await sharedTrip.$jazz.ensureLoaded({
      resolve: { admins: true, statuses: true },
    })

    startTransition(() => {
      if (approve) {
        approveJoinRequest(loaded, request, selectedRole)
        toast.success(`Access granted as ${selectedRole}`)
      } else {
        rejectJoinRequest(loaded, request)
        toast.success("Access request rejected")
      }
    })
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div>
        <p className="font-medium">
          {request.account.profile.$isLoaded
            ? request.account.profile.name
            : "Unknown"}
        </p>
        <p className="text-xs text-muted-foreground">
          Requested {formatDateShort(request.requestedAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={selectedRole}
          onValueChange={v => setSelectedRole(v as "reader" | "writer")}
        >
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
          onClick={() => processRequest(true)}
          disabled={isProcessing}
          aria-label="Approve"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={() => processRequest(false)}
          disabled={isProcessing}
          aria-label="Reject"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function MemberRow({ account, role }: { account: Account; role: string }) {
  const name = account.profile.$isLoaded ? account.profile.name : undefined

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div>
        <p className="font-medium">{name}</p>
      </div>
      <span className="text-sm text-muted-foreground">{role}</span>
    </div>
  )
}
