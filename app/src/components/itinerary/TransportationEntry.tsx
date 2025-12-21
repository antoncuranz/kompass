import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { useMap } from "react-map-gl/maplibre"
import type { MouseEvent, MouseEventHandler } from "react"
import type { GenericTransportation } from "@/schema.ts"
import type { co } from "jazz-tools"
import { formatTime } from "@/lib/datetime-utils"
import { getTransportationTypeEmoji } from "@/types.ts"

export default function TransportationEntry({
  transportation,
  onClick,
}: {
  transportation: co.loaded<typeof GenericTransportation>
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
}) {
  const { heroMap } = useMap()

  function onChevronClick(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation()
    heroMap?.flyTo({
      center: [transportation.origin.longitude, transportation.origin.latitude],
    })
  }

  return (
    <div
      className="cursor-pointer rounded-xl border mx-5 p-2 pl-4 pr-4 grid bg-card z-10 relative group/flyto"
      onClick={onClick}
    >
      <div className="grid grid-cols-[1.5rem_1fr] gap-2">
        <span className="mt-0 m-auto text-2xl leading-[1.3rem] h-6">
          {getTransportationTypeEmoji(transportation.genericType)}
        </span>
        <div className="flex overflow-hidden whitespace-nowrap w-full">
          <span className="overflow-hidden text-ellipsis w-full">
            {formatTime(transportation.departureDateTime)}-
            {formatTime(transportation.arrivalDateTime)} {transportation.name}
          </span>
        </div>
        {heroMap && (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="text-muted-foreground absolute top-2 -right-3 bg-card rounded-xl border hidden group-hover/flyto:block"
            onClick={onChevronClick}
          />
        )}
      </div>
    </div>
  )
}
