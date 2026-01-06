import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Hotel01Icon } from "@hugeicons/core-free-icons"
import type { Accommodation } from "@/domain"
import { Separator } from "@/components/ui/separator.tsx"
import { cn } from "@/lib/utils"

export default function DaySeparator({
  collapsedDays,
  accomodation,
  onAccommodationClick = () => {},
  className,
}: {
  collapsedDays: number
  accomodation: Accommodation | undefined
  onAccommodationClick?: (accommodation: Accommodation | undefined) => void
  className?: string
}) {
  return (
    <>
      <div className={cn("mx-5 mt-2 text-sm text-muted-foreground", className)}>
        <span
          className="hover:underline hover:cursor-pointer"
          onClick={() => onAccommodationClick(accomodation)}
        >
          <HugeiconsIcon
            icon={accomodation ? Hotel01Icon : Alert02Icon}
            className="size-4 mr-1 inline"
          />
          {accomodation ? accomodation.name : "️missing accomodation"}
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
