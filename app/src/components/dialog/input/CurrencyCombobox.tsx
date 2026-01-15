import { useId } from "react"
import { Input } from "@/components/ui/input.tsx"
import { cn } from "@/lib/utils"

const CURRENCY_SUGGESTIONS = [
  "AED",
  "ARS",
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "IDR",
  "ILS",
  "INR",
  "JPY",
  "KRW",
  "MXN",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RUB",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "USD",
  "ZAR",
]

export interface CurrencyComboboxProps {
  value?: string
  onChange: (currency?: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export default function CurrencyCombobox({
  value,
  onChange,
  disabled,
  placeholder = "Currency",
  className,
}: CurrencyComboboxProps) {
  const listId = useId()

  return (
    <>
      <Input
        value={value ?? ""}
        onChange={e => onChange(e.target.value || undefined)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn("uppercase", className)}
        list={listId}
        maxLength={10}
      />
      <datalist id={listId}>
        {CURRENCY_SUGGESTIONS.map(currency => (
          <option key={currency} value={currency} />
        ))}
      </datalist>
    </>
  )
}
