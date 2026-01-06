import type { CostItem } from "./CostTypes.tsx"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { formatAmount } from "@/lib/formatting"

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
      <h2 className="text-lg font-semibold mx-5 my-2">{title}</h2>
      <Table className="table-fixed">
        <TableBody>
          {items.map((item, idx) => (
            <TableRow
              key={idx}
              className="cursor-pointer"
              onClick={() => onItemClick(item)}
            >
              <TableCell className="w-24 pl-5">{item.date}</TableCell>
              <TableCell className="flex-1 truncate">{item.name}</TableCell>
              <TableCell className="text-right w-20 pr-5">
                {item.price !== undefined ? formatAmount(item.price) : "—"}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold hover:bg-transparent">
            {/* TODO: disable hover without bg-transparent */}
            <TableCell colSpan={2} />
            <TableCell className="text-right pr-5">
              {formatAmount(total)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
