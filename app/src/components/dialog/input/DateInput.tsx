import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import type { DateRange, Matcher } from "react-day-picker"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import { Button } from "@/components/ui/button.tsx"
import { Calendar } from "@/components/ui/calendar.tsx"
import {
  Popover,
  PopoverContent,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover.tsx"
import { dateFromString, getNextDay } from "@/lib/datetime-utils"
import { cn } from "@/lib/utils"

export default function DateInput({
  onChange,
  onBlur,
  value,
  disabled,
  name,
  ref,
  startDate,
  excludeStartDate,
  endDate,
  mode = "single",
  min,
  disabledRanges,
}: ControllerRenderProps<FieldValues, string> & {
  startDate?: string | null
  excludeStartDate?: boolean | null
  endDate?: string | null
  mode?: "single" | "range"
  min?: number
  disabledRanges?: Array<DateRange>
}) {
  function getMatchers(): Matcher | Array<Matcher> | undefined {
    const matchers: Array<Matcher> = []
    const adjustedStartDate = getAdjustedStartDate()

    if (adjustedStartDate) {
      matchers.push({ before: dateFromString(adjustedStartDate) })
    }
    if (endDate) {
      matchers.push({ after: dateFromString(endDate) })
    }
    if (disabledRanges) {
      matchers.push(...disabledRanges)
    }
    return matchers.length > 0 ? matchers : undefined
  }

  function getAdjustedStartDate() {
    if (!startDate) {
      return null
    }

    return excludeStartDate ? getNextDay(startDate) : startDate
  }

  function onSelect(selectedValue: Date | DateRange | undefined) {
    onChange(selectedValue)
    onBlur()
  }

  return (
    <Popover>
      <div className="h-10">
        <PopoverTrigger
          render={
            <Button
              ref={ref}
              name={name}
              size="base"
              variant="secondary"
              className={cn(
                "w-full justify-start disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-auto text-sm",
                !value && "text-muted-foreground",
              )}
              disabled={disabled}
            />
          }
        >
          <HugeiconsIcon icon={Calendar03Icon} className="mr-2" />
          {mode === "range" ? (
            value?.to ? (
              `${format(value.from, "MMM dd")} - ${format(value.to, "MMM dd, yyyy")}`
            ) : (
              <span>Pick a date range</span>
            )
          ) : value ? (
            format(value as Date, "PP")
          ) : (
            <span>Pick a date</span>
          )}
        </PopoverTrigger>
        <PopoverPositioner>
          <PopoverContent>
            <Calendar
              ISOWeek
              mode={mode}
              selected={value}
              onSelect={onSelect}
              startMonth={
                startDate ? dateFromString(getAdjustedStartDate()!) : undefined
              }
              endMonth={endDate ? dateFromString(endDate) : undefined}
              disabled={getMatchers()}
              required={true}
              min={min}
            />
          </PopoverContent>
        </PopoverPositioner>
      </div>
    </Popover>
  )
}
