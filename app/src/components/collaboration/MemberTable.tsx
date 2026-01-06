import { titleCase } from "@/lib/formatting"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Avatar } from "@/components/Avatar"

interface MemberTableProps {
  title: string
  members: Array<{ id: string; name: string; role: string }>
}

export default function MemberTable({ title, members }: MemberTableProps) {
  const hasMembers = members.length > 0

  if (!hasMembers) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mx-5 my-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {members.map(member => (
            <TableRow key={member.id} className="cursor-pointer">
              <TableCell className="flex-1 truncate pl-5">
                <div className="flex items-center gap-2">
                  <Avatar userId={member.id} />
                  <span className="truncate">{member.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right w-20 pr-5">
                {titleCase(member.role)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
