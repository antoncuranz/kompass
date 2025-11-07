import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { FocusEvent } from "react"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import { Input } from "@/components/ui/input.tsx"
import { formatAmount } from "@/components/util.ts"
import { cn } from "@/lib/utils.ts"

export default function AmountInput({
  onChange,
  onBlur,
  value,
  disabled,
  name,
  ref,
  decimals = 2,
  placeholder,
  className,
  readOnly = false,
}: ControllerRenderProps<FieldValues, string> & {
  decimals?: number
  placeholder?: string
  readOnly?: boolean
  className?: string
}) {
  const [stringAmount, setStringAmount] = useState("")

  useEffect(() => {
    setStringAmount(formatAmount(value, decimals))
  }, [value, decimals])

  function onBlurLocal(event: FocusEvent<HTMLInputElement>) {
    const newAmount = event.target.value

    try {
      const newValue = newAmount ? parseMonetaryValue(newAmount) : undefined
      onChange(newValue)
      setStringAmount(formatAmount(newValue, decimals))
    } catch {
      toast("Unable to parse amount")
      setStringAmount(formatAmount(value, decimals))
    }
    onBlur()
  }

  function parseMonetaryValue(valueString: string) {
    const re = new RegExp(
      String.raw`^(-)?(\d*)(?:[.,](\d{0,${decimals}}))?\d*$`,
    )
    const match = valueString.replace(/\s/g, "").match(re)

    if (
      !match ||
      match[2].length + (match.length > 3 ? match[3].length : 0) == 0
    )
      throw new Error("Unable to parse value string '" + valueString + "'")

    const sign = match[1] ? -1 : 1
    const euros = parseInt(match[2]) || 0
    let cents = parseInt(match[3]) || 0

    if (match[3]) cents *= Math.pow(10, decimals - match[3].length)

    return sign * (euros * Math.pow(10, decimals) + cents)
  }

  return (
    <Input
      ref={ref}
      name={name}
      value={stringAmount}
      placeholder={placeholder}
      onChange={e => setStringAmount(e.target.value)}
      onBlur={onBlurLocal}
      className={cn(className, "text-right")}
      disabled={disabled}
      readOnly={readOnly}
    />
  )
}
