export function dateFromString(timestamp: string) {
  return new Date(timestamp)
}

export function dateTimeToString(date: Date) {
  const offset = date.getTimezoneOffset()
  const offsetDate = new Date(date.getTime() - offset * 60 * 1000)
  return offsetDate.toISOString().split("Z")[0]
}

export function dateToString(date: Date) {
  const offset = date.getTimezoneOffset()
  const offsetDate = new Date(date.getTime() - offset * 60 * 1000)
  return offsetDate.toISOString().split("T")[0]
}

export function getDaysBetween(startDateStr: string, endDateStr: string) {
  const startDate = dateFromString(startDateStr)
  const endDate = dateFromString(endDateStr)

  const dates = []
  const currentDate = new Date(startDate)

  if (endDate < startDate) {
    return []
  }

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates.map(dateToString)
}

export function getNextDay(date: string) {
  const nextDay = dateFromString(date)
  nextDay.setDate(nextDay.getDate() + 1)
  return dateToString(nextDay)
}

export function isSameDay(timestampA: string, timestampB: string) {
  return timestampA.substring(0, 10) == timestampB.substring(0, 10)
}

export function dayIsBetween(
  dateStr: string,
  timestampA: string,
  timestampB: string,
) {
  const date = new Date(dateStr)
  return (
    date >= new Date(timestampA.substring(0, 10)) &&
    date <= new Date(timestampB.substring(0, 10))
  )
}

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
  return value.charAt(0) + value.slice(1).toLowerCase()
}
