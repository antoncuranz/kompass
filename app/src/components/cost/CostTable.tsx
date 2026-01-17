import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import type { CostItem } from "./CostTypes.tsx"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { formatAmount } from "@/lib/formatting"
import { getPricingTotal, isOverdue } from "@/domain"

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
          {items.map((item, idx) => {
            const price = getPricingTotal(item.pricing)
            const overdue = isOverdue(item.pricing)
            const hasPaidAndRemaining = item.pricing?.amountPaid && item.pricing.amountRemaining
            
            return (
              <TableRow
                key={idx}
                className="cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <TableCell className="w-24 pl-5">{item.date}</TableCell>
                <TableCell className="flex-1 truncate">
                  <div className="flex items-center gap-2">
                    {overdue && (
                      <HugeiconsIcon
                        icon={Alert01Icon}
                        className="text-yellow-500 shrink-0"
                        size={16}
                      />
                    )}
                    <span className={overdue ? "text-yellow-600" : ""}>
                      {item.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right w-32 pr-5">
                  {hasPaidAndRemaining && !item.pricing?.dueCurrency ? (
                    <div className="text-xs">
                      <div className="text-muted-foreground">
                        {formatAmount(item.pricing!.amountPaid)} paid
                      </div>
                      <div className="text-muted-foreground">
                        {formatAmount(item.pricing!.amountRemaining)} due
                      </div>
                      <div className="font-medium">
                        {price !== undefined ? formatAmount(price) : "—"}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {price !== undefined ? formatAmount(price) : "—"}
                      {item.pricing?.dueCurrency && item.pricing.amountRemaining && (
                        <div className="text-xs text-muted-foreground">
                          + {item.pricing.amountRemaining / 100} {item.pricing.dueCurrency}
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
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
