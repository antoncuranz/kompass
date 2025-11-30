import type { CostItem } from "./CostTypes.tsx"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { formatAmount } from "@/components/util.ts"

interface CostTableProps {
  title: string
  items: Array<CostItem>
  onItemClick: (item: CostItem) => void
  total: number
}

export default function CostTable({
  title,
  items,
  onItemClick,
  total,
}: CostTableProps) {
  const hasItems = items.length > 0

  if (!hasItems) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mx-3 my-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {items.map((item, idx) => (
            <TableRow
              key={idx}
              className="cursor-pointer"
              onClick={() => onItemClick(item)}
            >
              <TableCell className="w-32 px-3">{item.date}</TableCell>
              <TableCell className="flex-1 truncate px-3">{item.name}</TableCell>
              <TableCell className="text-right w-24 px-3">
                {item.price !== undefined ? formatAmount(item.price) : "—"}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold hover:bg-transparent">
            {/* TODO: disable hover without bg-transparent */}
            <TableCell colSpan={2} className="align-top px-3"></TableCell>
            <TableCell className="text-right w-32 align-top px-3">
              {formatAmount(total)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
