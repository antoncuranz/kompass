import type { Accommodation } from "@/schema.ts"
import type { co } from "jazz-tools"
import { Separator } from "@/components/ui/separator.tsx"
import { cn } from "@/lib/utils"

export default function DaySeparator({
  collapsedDays,
  accomodation,
  onAccommodationClick = () => {},
  className,
}: {
  collapsedDays: number
  accomodation: co.loaded<typeof Accommodation> | undefined
  onAccommodationClick?: (
    accommodation: co.loaded<typeof Accommodation> | undefined,
  ) => void
  className?: string
}) {
  return (
    <>
      <div className={cn("mx-3 mt-2 text-sm text-muted-foreground", className)}>
        <span
          className="hover:underline hover:cursor-pointer"
          onClick={() => onAccommodationClick(accomodation)}
        >
          {accomodation ? `🛏️ ${accomodation.name}` : "⚠️ missing accomodation"}
        </span>
        {collapsedDays > 0 && (
          <span>
            {" "}
            ({collapsedDays} {collapsedDays != 1 ? "days" : "day"} collapsed)
          </span>
        )}
      </div>
      <Separator />
    </>
  )
}
