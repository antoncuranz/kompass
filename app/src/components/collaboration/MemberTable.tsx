import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import type { Account } from "jazz-tools"

interface MemberTableProps {
  title: string
  members: Array<{ id: string; account: Account; role: string }>
}

export default function MemberTable({ title, members }: MemberTableProps) {
  const hasMembers = members.length > 0

  if (!hasMembers) return null

  return (
    <div className="mb-2 last:mb-0">
      <h2 className="text-lg font-semibold mb-2 mx-2 mt-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {members.map((member, idx) => (
            <TableRow
              key={member.id}
              className="cursor-pointer hover:bg-muted/50 border-y"
            >
              <TableCell className="min-w-0 flex-1 truncate">
                {member.account.profile.$isLoaded ? member.account.profile.name : "Unknown"}
              </TableCell>
              <TableCell className="text-right w-32 align-top">
                {member.role}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}