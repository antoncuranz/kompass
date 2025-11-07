import { formatDateLong } from "@/components/util.ts"

export default function DayLabel({
  date,
  location,
}: {
  date: string
  location?: string | null
}) {
  return (
    <div className="mx-3 text-sm text-muted-foreground inline-block">
      {formatDateLong(date)}
      {location && ", "}
      {location}
    </div>
  )
}
