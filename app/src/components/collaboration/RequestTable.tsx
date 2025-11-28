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
  SelectValue,
} from "@/components/ui/select.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { approveJoinRequest, rejectJoinRequest } from "@/lib/collaboration.ts"
import { formatDateShort } from "@/components/util.ts"

interface RequestTableProps {
  title: string
  requests: Array<co.loaded<typeof JoinRequest>>
  sharedTrip: co.loaded<typeof SharedTrip>
}

export default function RequestTable({ title, requests, sharedTrip }: RequestTableProps) {
  const hasRequests = requests.length > 0

  if (!hasRequests) return null

  return (
    <div className="mb-2 last:mb-0">
      <h2 className="text-lg font-semibold mb-2 mx-2 mt-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {requests.map((request) => (
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
    <TableRow className="hover:bg-muted/50 border-y">
      <TableCell className="min-w-0 flex-1 truncate">
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
      </TableCell>
      <TableCell className="w-32">
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
      </TableCell>
      <TableCell className="w-24">
        <div className="flex items-center gap-4">
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
      </TableCell>
    </TableRow>
  )
}