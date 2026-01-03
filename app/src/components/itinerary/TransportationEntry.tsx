import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { useMap } from "react-map-gl/maplibre"
import type { MouseEvent, MouseEventHandler } from "react"
import type { GenericTransportation } from "@/domain"
import { formatTime } from "@/lib/datetime-utils"
import { getTransportationTypeEmoji } from "@/types.ts"

export default function TransportationEntry({
  transportation,
  onClick,
}: {
  transportation: GenericTransportation
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
      className="cursor-pointer rounded-lg shadow-sm active:shadow-xs transition-all border mx-5 p-2 px-3 grid bg-card z-10 relative group/flyto"
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
            className="text-muted-foreground absolute top-2 -right-6 bg-ard rounded-full borer hidden group-hover/flyto:block"
            onClick={onChevronClick}
          />
        )}
      </div>
    </div>
  )
}
