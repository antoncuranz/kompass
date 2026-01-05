import { dateFromString } from "@/lib/datetime"

export function formatDuration(timestampA: string, timestampB: string) {
  const difference =
    dateFromString(timestampB).getTime() - dateFromString(timestampA).getTime()
  return formatDurationMinutes(Math.floor(difference / (1000 * 60)))
}

export function formatDurationMinutes(minutes: number) {
  return Math.floor(minutes / 60) + "h " + (minutes % 60) + "min"
}

export function formatDateLong(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
  }).format(dateFromString(date))
}

export function formatDateMedium(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(dateFromString(date))
}

export function formatDateShort(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
  }).format(dateFromString(date))
}

export function formatTime(time: string, lacksDatePrefix: boolean = false) {
  const date = new Date(lacksDatePrefix ? "1970-01-01T" + time : time)
  return date.getHours() + ":" + date.getMinutes().toString().padStart(2, "0")
}

export function formatTimePadded(
  time: string,
  lacksDatePrefix: boolean = false,
) {
  const date = new Date(lacksDatePrefix ? "1970-01-01T" + time : time)
  return (
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0")
  )
}

export function formatAmount(
  amount: number | null | undefined,
  decimals = 2,
): string {
  if (amount == null) return ""
  const sign = amount < 0 ? "-" : ""
  let result =
    sign +
    Math.abs((amount / Math.pow(10, decimals)) >> 0)
      .toString()
      .padStart(1, "0")
  if (decimals != 0)
    result +=
      "," +
      Math.abs(amount % Math.pow(10, decimals))
        .toString()
        .padStart(decimals, "0")
  return result
}

export function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}
