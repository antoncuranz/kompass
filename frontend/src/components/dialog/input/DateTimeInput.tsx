import { RowContainer } from "@/components/dialog/Dialog.tsx"
import DateInput from "@/components/dialog/input/DateInput.tsx"
import { Input } from "@/components/ui/input.tsx"
import { formatTimePadded } from "@/components/util.ts"
import { setHours, setMinutes } from "date-fns"
import { ChangeEventHandler, useState } from "react"
import { ControllerRenderProps, FieldValues } from "react-hook-form"

export default function DateTimeInput({
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
  const [timeValue, setTimeValue] = useState<string>(
    value ? formatTimePadded(value) : "00:00",
  )

  const handleTimeChange: ChangeEventHandler<HTMLInputElement> = e => {
    const time = e.target.value
    if (!value) {
      setTimeValue(time)
      return
    }
    const [hours, minutes] = time.split(":").map(str => parseInt(str, 10))
    const newSelectedDate = setHours(setMinutes(value, minutes), hours)
    onChange(newSelectedDate)
    setTimeValue(time)
    onBlur()
  }

  const handleDaySelect = (date: Date | undefined) => {
    if (!timeValue || !date) {
      onChange(date)
      return
    }
    const [hours, minutes] = timeValue.split(":").map(str => parseInt(str, 10))
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
    )
    onChange(newDate)
    onBlur()
  }

  return (
    <RowContainer>
      <div>
        <DateInput
          value={value}
          onChange={handleDaySelect}
          onBlur={onBlur}
          name={name}
          ref={ref}
          startDate={startDate}
          excludeStartDate={excludeStartDate}
          endDate={endDate}
          disabled={disabled}
        />
      </div>
      <div>
        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled}
          className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </RowContainer>
  )
}
