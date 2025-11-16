import { ChevronDown, ChevronRight, ChevronUp, SquarePen } from "lucide-react"
import { useState } from "react"
import { useMap } from "react-map-gl/maplibre"
import type { MouseEvent, MouseEventHandler } from "react"
import type { Flight, FlightLeg } from "@/schema.ts"
import type { co } from "jazz-tools"
import PrivacyFilter from "@/components/PrivacyFilter.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { formatDurationMinutes, formatTime } from "@/components/util.ts"
import { cn } from "@/lib/utils.ts"

export default function FlightEntry({
  flight,
  flightLeg,
  className,
  onInfoBtnClick,
}: {
  flight: co.loaded<typeof Flight>
  flightLeg: co.loaded<typeof FlightLeg>
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
        "rounded-xl border mx-3 p-2 pl-4 pr-4 grid bg-background z-10 relative group/flyto",
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
            <ChevronUp className="float-right text-muted-foreground" />
          ) : (
            <ChevronDown className="float-right text-muted-foreground" />
          )}
        </div>
        {heroMap && (
          <ChevronRight
            className="text-muted-foreground absolute top-2 -right-3 bg-background rounded-xl border hidden group-hover/flyto:block"
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
          <div>
            <p>
              {formatTime(flightLeg.departureDateTime)} {flightLeg.origin.name}{" "}
              ({flightLeg.origin.iata})
            </p>
            <p className="text-sm text-muted-foreground">
              Duration: {formatDurationMinutes(flightLeg.durationInMinutes)}
            </p>
            <p>
              {formatTime(flightLeg.arrivalDateTime)}{" "}
              {flightLeg.destination.name} ({flightLeg.destination.iata})
            </p>
          </div>
          <img
            src={"https://seats.aero/static/carriersng/" + iata + ".png"}
            className="h-4 mt-0 m-auto relative top-1"
            alt="LH"
          />
          <div>
            <span className="text-sm text-muted-foreground">
              {flightLeg.airline} - {flightLeg.flightNumber} -{" "}
              {flightLeg.aircraft}
            </span>
            <div className="flex float-right">
              {flight.pnrs.$isLoaded &&
                flight.pnrs.map(pnr => (
                  <PrivacyFilter
                    key={pnr.$jazz.id}
                    className="flex"
                    mode="hide"
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      className="ml-2 p-2 h-6"
                    >
                      {pnr.airline} {pnr.pnr}
                    </Button>
                  </PrivacyFilter>
                ))}
              <Button
                variant="secondary"
                className="ml-2 p-2 h-6"
                onClick={onInfoBtnClick}
              >
                <SquarePen className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
