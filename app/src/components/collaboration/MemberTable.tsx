import { titleCase } from "../util"
import type { Account } from "jazz-tools"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Avatar } from "@/components/Avatar"

interface MemberTableProps {
  title: string
  members: Array<{ id: string; account: Account; role: string }>
}

export default function MemberTable({ title, members }: MemberTableProps) {
  const hasMembers = members.length > 0

  if (!hasMembers) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mx-3 my-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {members.map(member => (
            <TableRow key={member.id} className="cursor-pointer">
              <TableCell className="flex-1 truncate px-3">
                <div className="flex items-center gap-2">
                  <Avatar accountId={member.account.$jazz.id} />
                  <span className="truncate">
                    {member.account.profile.$isLoaded
                      ? member.account.profile.name
                      : "Unknown"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right w-20 px-3">
                {titleCase(member.role)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
