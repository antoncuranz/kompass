import { Button } from "@/components/ui/button.tsx"
import { Calendar } from "@/components/ui/calendar.tsx"
import {
  Popover,
  PopoverContent,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover.tsx"
import { dateFromString, getNextDay } from "@/components/util.ts"
import { cn } from "@/lib/utils.ts"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Matcher } from "react-day-picker"
import { ControllerRenderProps, FieldValues } from "react-hook-form"

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
}: ControllerRenderProps<FieldValues, string> & {
  startDate?: string | null
  excludeStartDate?: boolean | null
  endDate?: string | null
}) {
  function getMatcher(): Matcher | undefined {
    const adjustedStartDate = getAdjustedStartDate()

    if (adjustedStartDate && endDate) {
      return {
        before: dateFromString(adjustedStartDate),
        after: dateFromString(endDate),
      }
    } else if (adjustedStartDate) {
      return { before: dateFromString(adjustedStartDate) }
    } else if (endDate) {
      return { after: dateFromString(endDate) }
    }
    return undefined
  }

  function getAdjustedStartDate() {
    if (!startDate) {
      return null
    }

    return excludeStartDate ? getNextDay(startDate) : startDate
  }

  function onSelect(value: Date) {
    onChange(value)
    onBlur()
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            ref={ref}
            name={name}
            variant="secondary"
            className={cn(
              //     "col-span-3 justify-start text-left font-normal w-full focus:ring-2 disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-auto",
              "w-full justify-start disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-auto text-sm",
              !value && "text-muted-foreground",
            )}
            disabled={disabled}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, "PP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent>
          <Calendar
            ISOWeek
            mode="single"
            selected={value}
            onSelect={onSelect}
            startMonth={
              startDate ? dateFromString(getAdjustedStartDate()!) : undefined
            }
            endMonth={endDate ? dateFromString(endDate) : undefined}
            disabled={getMatcher()}
            required={true}
          />
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  )
}
