import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons"
import { useState } from "react"
import { useMap } from "react-map-gl/maplibre"
import type { MouseEvent, MouseEventHandler } from "react"
import type { Flight, FlightLeg } from "@/domain"
import PrivacyFilter from "@/components/PrivacyFilter.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { formatDurationMinutes, formatTime } from "@/lib/datetime-utils"
import { cn } from "@/lib/utils"

export default function FlightEntry({
  flight,
  flightLeg,
  className,
  onInfoBtnClick,
}: {
  flight: Flight
  flightLeg: FlightLeg
  className?: string
  onInfoBtnClick?: MouseEventHandler<HTMLButtonElement> | undefined
}) {
  const [open, setOpen] = useState<boolean>(false)
  const { heroMap } = useMap()

  const iata = flightLeg.flightNumber.substring(0, 2)

  function onChevronClick(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation()
    heroMap?.flyTo({
      center: [
        flightLeg.origin.location.longitude,
        flightLeg.origin.location.latitude,
      ],
    })
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "rounded-lg border mx-5 p-2 px-3 grid bg-card z-10 relative group/flyto",
        "shadow-sm active:shadow-xs transition-all",
        className,
      )}
    >
      <CollapsibleTrigger className="grid grid-cols-[1.5rem_1fr] gap-2 cursor-pointer w-full text-left">
        <span className="mt-0 m-auto">✈️</span>
        <div className="flex overflow-hidden whitespace-nowrap w-full">
          <span className="overflow-hidden text-ellipsis w-full">
            {open
              ? `Flight from ${flightLeg.origin.municipality} to ${flightLeg.destination.municipality}`
              : `${formatTime(flightLeg.departureDateTime)}-${formatTime(flightLeg.arrivalDateTime)} Flight ${flightLeg.flightNumber} from ${flightLeg.origin.municipality} to ${flightLeg.destination.municipality}`}
          </span>
          {open ? (
            <HugeiconsIcon icon={ArrowUp01Icon} />
          ) : (
            <HugeiconsIcon icon={ArrowDown01Icon} />
          )}
        </div>
        {heroMap && (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="absolute top-2 -right-3 bg-card rounded-full border hidden group-hover/flyto:block"
            onClick={onChevronClick}
          />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className="grid mt-1"
          style={{ gridTemplateColumns: "1.5rem 1fr", columnGap: "0.5rem" }}
        >
          <div className="mt-0 m-auto flex flex-col items-center relative top-2">
            <div className="w-1.5 h-1.5 rounded-lg bg-gray-300" />
            <div className="h-10 w-0.5 bg-gray-300" />
            <div className="w-1.5 h-1.5 rounded-lg bg-gray-300" />
          </div>
          <div className="min-w-0">
            <p className="flex">
              <span className="truncate">
                {formatTime(flightLeg.departureDateTime)}{" "}
                {flightLeg.origin.name}
              </span>
              <span className="shrink-0 ml-1">({flightLeg.origin.iata})</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Duration: {formatDurationMinutes(flightLeg.durationInMinutes)}
            </p>
            <p className="flex">
              <span className="truncate">
                {formatTime(flightLeg.arrivalDateTime)}{" "}
                {flightLeg.destination.name}
              </span>
              <span className="shrink-0 ml-1">
                ({flightLeg.destination.iata})
              </span>
            </p>
          </div>
          <img
            src={"https://seats.aero/static/carriersng/" + iata + ".png"}
            className="h-4 mt-0 m-auto relative top-1"
            alt={iata}
          />
          <div className="flex flex-wrap items-center min-w-0">
            <span className="text-sm text-muted-foreground min-h-6 truncate">
              {flightLeg.airline} - {flightLeg.flightNumber} -{" "}
              {flightLeg.aircraft}
            </span>
            <div className="flex ml-auto">
              {flight.pnrs.map(pnr => (
                <PrivacyFilter key={pnr.id} className="flex" mode="hide">
                  <Button variant="secondary" className="ml-2 p-2 h-6">
                    {pnr.airline} {pnr.pnr}
                  </Button>
                </PrivacyFilter>
              ))}
              <Button
                variant="secondary"
                className="ml-2 p-2 h-6"
                onClick={onInfoBtnClick}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
