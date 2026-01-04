import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import type { JoinRequest, UserRole } from "@/domain"
import { Button } from "@/components/ui/button.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
} from "@/components/ui/select.tsx"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  approveJoinRequest,
  rejectJoinRequest,
} from "@/lib/collaboration-utils"
import { formatDateShort } from "@/lib/datetime-utils"
import { Avatar } from "@/components/Avatar"
import { UserRoleValues } from "@/domain"
import { titleCase } from "@/lib/misc-utils"

export default function RequestTable({
  title,
  joinRequests,
  stid,
}: {
  title: string
  joinRequests: Array<JoinRequest>
  stid: string
}) {
  const hasRequests = joinRequests.length > 0

  if (!hasRequests) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mx-5 my-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {joinRequests.map(request => (
            <RequestRow key={request.id} joinRequest={request} stid={stid} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function RequestRow({
  joinRequest,
  stid,
}: {
  joinRequest: JoinRequest
  stid: string
}) {
  const [isProcessing, startTransition] = useTransition()
  const [selectedRole, setSelectedRole] = useState<UserRole>("guest")

  function processRequest(approve: boolean) {
    startTransition(async () => {
      if (approve) {
        await approveJoinRequest(stid, joinRequest.id, selectedRole)
        toast.success(`Access granted as ${selectedRole}`)
      } else {
        await rejectJoinRequest(stid, joinRequest.id)
        toast.success("Access request rejected")
      }
    })
  }

  return (
    <TableRow className="hover:bg-transparent">
      {/* TODO: disable hover without bg-transparent */}
      <TableCell className="flex-1 truncate pl-5">
        <div className="flex items-center gap-2">
          <Avatar />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{joinRequest.account.name}</p>
            <p className="text-xs text-muted-foreground">
              Requested {formatDateShort(joinRequest.requestedAt)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="pr-5">
        <div className="flex justify-end items-center gap-2">
          <Select
            value={selectedRole}
            onValueChange={v => setSelectedRole(v as UserRole)}
          >
            <SelectTrigger className="w-32">
              {titleCase(selectedRole)}
            </SelectTrigger>
            <SelectPositioner>
              <SelectContent>
                {UserRoleValues.map(role => (
                  <SelectItem value={role}>{titleCase(role)}</SelectItem>
                ))}
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
            <HugeiconsIcon icon={Tick02Icon} />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => processRequest(false)}
            disabled={isProcessing}
            aria-label="Reject"
            className="shrink-0 h-10 w-10"
          >
            <HugeiconsIcon icon={Cancel01Icon} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
