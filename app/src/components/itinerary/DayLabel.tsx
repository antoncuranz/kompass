import { formatDateLong } from "@/lib/formatting"

export default function DayLabel({
  date,
  location,
}: {
  date: string
  location?: string | null
}) {
  return (
    <div className="mx-5 text-sm text-muted-foreground inline-block">
      {formatDateLong(date)}
      {location && ", "}
      {location}
    </div>
  )
}
