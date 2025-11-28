import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { formatAmount } from "@/components/util.ts"
import type { CostItem } from "./CostTypes.tsx"

interface CostTableProps {
  title: string
  items: CostItem[]
  onItemClick: (item: CostItem) => void
  total: number
}

export default function CostTable({ title, items, onItemClick, total }: CostTableProps) {
  const hasItems = items.length > 0

  if (!hasItems) return null

  return (
    <div className="mb-2 last:mb-0">
      <h2 className="text-lg font-semibold mb-2 mx-2 mt-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {items.map((item, idx) => (
            <TableRow
              key={`${item.type}-${idx}`}
              className={`cursor-pointer hover:bg-muted/50${idx === 0 ? " border-t" : ""}`}
              onClick={() => onItemClick(item)}
            >
              <TableCell className="w-32">{item.date}</TableCell>
              <TableCell className="min-w-0 flex-1 truncate">{item.name}</TableCell>
              <TableCell className="text-right w-32">
                {item.price !== undefined ? formatAmount(item.price) : "—"}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold border-t border-b-0 hover:bg-transparent">
            <TableCell colSpan={2} className="align-top"></TableCell>
            <TableCell className="text-right w-32 align-top">
              {formatAmount(total)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}