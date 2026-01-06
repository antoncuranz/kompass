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

export function isSameDayDate(dateA: Date, dateB: Date): boolean {
  return dateA.getTime() === dateB.getTime()
}

export function isSameDay(timestampA: string, timestampB: string): boolean {
  return timestampA.substring(0, 10) == timestampB.substring(0, 10)
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

export function subDays(date: Date, days: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() - days)
  return newDate
}

export function getDaysBetween(startDateStr: string, endDateStr: string) {
  const startDate = dateFromString(startDateStr)
  const endDate = dateFromString(endDateStr)

  const dates: Array<Date> = []
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
