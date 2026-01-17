import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  DollarCircleIcon,
  MoreVerticalCircle01Icon,
} from "@hugeicons/core-free-icons"
import { useEffect, useState } from "react"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import type { Pricing } from "@/domain"
import AmountInput from "@/components/dialog/input/AmountInput.tsx"
import CurrencyCombobox from "@/components/dialog/input/CurrencyCombobox.tsx"
import DateInput from "@/components/dialog/input/DateInput.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import { Label } from "@/components/ui/label.tsx"
import { cn } from "@/lib/utils"
import { dateFromString } from "@/lib/datetime"

export default function PricingInput({
  onChange,
  onBlur,
  value,
  disabled,
  className,
}: ControllerRenderProps<FieldValues, string> & {
  className?: string
}) {
  const [hasDueDate, setHasDueDate] = useState(!!value?.dueDate)
  const [hasPartialPayment, setHasPartialPayment] = useState(
    !!value?.amountRemaining,
  )
  const hasCustomCurrency = !!value?.dueCurrency

  // Sync local state when value changes
  useEffect(() => {
    setHasDueDate(!!value?.dueDate)
    setHasPartialPayment(!!(value?.amountRemaining ?? 0))
  }, [value])

  function updatePricing(updates: Partial<Pricing>) {
    const newPricing: Pricing = {
      amountPaid: value?.amountPaid,
      amountRemaining: value?.amountRemaining,
      dueCurrency: value?.dueCurrency,
      dueDate: value?.dueDate,
      ...updates,
    }

    // Clean up undefined values
    if (!newPricing.amountPaid && !newPricing.amountRemaining) {
      onChange(undefined)
      return
    }

    onChange(newPricing)
    onBlur()
  }

  function toggleDueDate() {
    if (hasDueDate) {
      updatePricing({ dueDate: undefined })
    }
    setHasDueDate(!hasDueDate)
  }

  function togglePartialPayment() {
    if (!hasPartialPayment) {
      // Splitting: move current price to remaining, set paid to 0
      const total = value?.amountPaid ?? 0
      updatePricing({ amountPaid: 0, amountRemaining: total })
    } else {
      // Combining: move remaining to paid, clear remaining and currency
      const total = (value?.amountPaid ?? 0) + (value?.amountRemaining ?? 0)
      updatePricing({
        amountPaid: total,
        amountRemaining: undefined,
        dueCurrency: undefined,
      })
    }
    setHasPartialPayment(!hasPartialPayment)
  }

  function onPriceChange(newValue: number | undefined) {
    if (hasPartialPayment) {
      // When in partial payment mode, changing "paid" doesn't affect remaining
      updatePricing({ amountPaid: newValue })
    } else {
      // In simple mode, price = amountPaid, amountRemaining = 0
      updatePricing({
        amountPaid: newValue,
        amountRemaining: 0,
        dueCurrency: undefined,
      })
    }
  }

  function onPaidChange(newValue: number | undefined) {
    if (hasCustomCurrency) {
      // In multi-currency mode, paid and remaining are independent
      updatePricing({ amountPaid: newValue })
    } else {
      // In same-currency mode, recalculate remaining
      const total = (newValue ?? 0) + (value?.amountRemaining ?? 0)
      // Keep total constant, adjust remaining
      const newRemaining = total - (newValue ?? 0)
      updatePricing({
        amountPaid: newValue,
        amountRemaining: newRemaining > 0 ? newRemaining : undefined,
      })
    }
  }

  function onRemainingChange(newValue: number | undefined) {
    updatePricing({ amountRemaining: newValue })
  }

  function onCurrencyChange(currency: string | undefined) {
    if (currency) {
      updatePricing({ dueCurrency: currency })
    } else {
      // Clearing currency: recalc remaining from total - paid
      const total = (value?.amountPaid ?? 0) + (value?.amountRemaining ?? 0)
      const newRemaining = total - (value?.amountPaid ?? 0)
      updatePricing({
        dueCurrency: undefined,
        amountRemaining: newRemaining > 0 ? newRemaining : undefined,
      })
    }
  }

  function onDueDateChange(date: Date | undefined) {
    updatePricing({ dueDate: date?.toISOString() })
  }

  const totalAmount =
    !hasCustomCurrency && hasPartialPayment
      ? (value?.amountPaid ?? 0) + (value?.amountRemaining ?? 0)
      : undefined

  const remainingAmount = hasPartialPayment ? value?.amountRemaining : undefined

  return (
    <div className={cn("space-y-2", className)}>
      {/* Row 1: Price (or Paid in multi-currency mode) */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">
            {hasCustomCurrency ? "Paid" : "Price"}
          </Label>
          <AmountInput
            value={
              hasPartialPayment && !hasCustomCurrency
                ? value?.amountPaid
                : value?.amountPaid ?? undefined
            }
            onChange={hasPartialPayment ? onPaidChange : onPriceChange}
            onBlur={onBlur}
            disabled={disabled}
            name="pricing.amountPaid"
            ref={() => {}}
          />
        </div>

        {/* Kebab menu */}
        {!disabled && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="shrink-0 mt-5">
                  <HugeiconsIcon icon={MoreVerticalCircle01Icon} />
                </Button>
              }
            />
            <DropdownMenuPositioner>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={hasDueDate}
                  onCheckedChange={toggleDueDate}
                >
                  <HugeiconsIcon icon={Calendar03Icon} />
                  Add Due Date
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={hasPartialPayment}
                  onCheckedChange={togglePartialPayment}
                >
                  <HugeiconsIcon icon={DollarCircleIcon} />
                  Add Partial Payment
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenu>
        )}
      </div>

      {/* Row 2: Paid + Remaining (when in partial payment mode) */}
      {hasPartialPayment && !hasCustomCurrency && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Paid</Label>
            <AmountInput
              value={value?.amountPaid}
              onChange={onPaidChange}
              onBlur={onBlur}
              disabled={disabled}
              name="pricing.amountPaid"
              ref={() => {}}
            />
          </div>
          <div className="flex-1 relative">
            <Label className="text-xs text-muted-foreground">Remaining</Label>
            <div className="flex items-center gap-1">
              <AmountInput
                value={remainingAmount}
                onChange={onRemainingChange}
                onBlur={onBlur}
                disabled={disabled}
                readOnly={true}
                name="pricing.amountRemaining"
                ref={() => {}}
                className="flex-1"
              />
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => onCurrencyChange("USD")}
                  title="Add different currency"
                >
                  <HugeiconsIcon
                    icon={DollarCircleIcon}
                    className="text-muted-foreground"
                  />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Multi-currency Remaining */}
      {hasPartialPayment && hasCustomCurrency && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Remaining</Label>
            <AmountInput
              value={remainingAmount}
              onChange={onRemainingChange}
              onBlur={onBlur}
              disabled={disabled}
              name="pricing.amountRemaining"
              ref={() => {}}
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Currency</Label>
            <CurrencyCombobox
              value={value?.dueCurrency}
              onChange={onCurrencyChange}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* Row 4: Due Date */}
      {hasDueDate && (
        <div>
          <Label className="text-xs text-muted-foreground">Due</Label>
          <DateInput
            value={value?.dueDate ? dateFromString(value.dueDate) : undefined}
            onChange={onDueDateChange}
            onBlur={onBlur}
            disabled={disabled}
            name="pricing.dueDate"
            ref={() => {}}
          />
        </div>
      )}

      {/* Total display (only when in same-currency partial payment mode) */}
      {totalAmount !== undefined && totalAmount > 0 && (
        <div className="text-xs text-muted-foreground text-right">
          Total: {(totalAmount / 100).toFixed(2)}
        </div>
      )}
    </div>
  )
}
