import { Check, X } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import type { co } from "jazz-tools"
import type { JoinRequest, SharedTrip } from "@/schema.ts"
import { Button } from "@/components/ui/button.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
} from "@/components/ui/select.tsx"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { approveJoinRequest, rejectJoinRequest } from "@/lib/collaboration.ts"
import { formatDateShort, titleCase } from "@/components/util.ts"
import { Avatar } from "@/components/Avatar"

interface RequestTableProps {
  title: string
  requests: Array<co.loaded<typeof JoinRequest>>
  sharedTrip: co.loaded<typeof SharedTrip>
}

export default function RequestTable({
  title,
  requests,
  sharedTrip,
}: RequestTableProps) {
  const hasRequests = requests.length > 0

  if (!hasRequests) return null

  return (
    <div>
      <h2 className="text-lg font-semibold m-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {requests.map(request => (
            <RequestRow
              key={request.$jazz.id}
              request={request}
              sharedTrip={sharedTrip}
            />
          ))}
        </TableBody>
      </Table>
    </div>
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
    <TableRow className="hover:bg-transparent">
      {/* TODO: disable hover without bg-transparent */}
      <TableCell className="flex-1 truncate">
        <div className="flex items-center gap-2">
          <Avatar accountId={request.account.$jazz.id} />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {request.account.profile.$isLoaded
                ? request.account.profile.name
                : "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              Requested {formatDateShort(request.requestedAt)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-end items-center gap-2">
          <Select
            value={selectedRole}
            onValueChange={v => setSelectedRole(v as "reader" | "writer")}
          >
            <SelectTrigger className="w-32">
              {titleCase(selectedRole)}
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
            className="shrink-0 h-10 w-10"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => processRequest(false)}
            disabled={isProcessing}
            aria-label="Reject"
            className="shrink-0 h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
