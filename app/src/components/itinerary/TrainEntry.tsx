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
import type { TrainLeg } from "@/domain"
import { Button } from "@/components/ui/button.tsx"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { formatDurationMinutes, formatTime } from "@/lib/datetime-utils"
import { cn } from "@/lib/utils"

export default function TrainEntry({
  trainLeg,
  className,
  onInfoBtnClick,
}: {
  trainLeg: TrainLeg
  className?: string
  onInfoBtnClick?: MouseEventHandler<HTMLButtonElement> | undefined
}) {
  const [open, setOpen] = useState<boolean>(false)
  const { heroMap } = useMap()

  function onChevronClick(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation()
    heroMap?.flyTo({
      center: [
        trainLeg.origin.location.longitude,
        trainLeg.origin.location.latitude,
      ],
    })
  }

  function logoFromOperatorName(operatorName: string): string {
    const lowerOperatorName = operatorName.toLowerCase()
    if (lowerOperatorName.startsWith("db")) {
      return "https://assets.static-bahn.de/dam/jcr:47b6ca20-95d9-4102-bc5a-6ebb5634f009/db-logo.svg"
    } else if (lowerOperatorName.startsWith("schweiz")) {
      return "https://digital.sbb.ch/assets/images/brand/signet.svg"
    } else if (lowerOperatorName.startsWith("österreich")) {
      return "https://upload.wikimedia.org/wikipedia/commons/5/5e/Logo_%C3%96BB.svg"
      // } else if (lowerOperatorName.startsWith("trenitalia")) {
    }
    return ""
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
        <span className="mt-0 m-auto text-2xl leading-[1.3rem] h-6">🚇</span>
        <div className="flex overflow-hidden whitespace-nowrap w-full">
          <span className="overflow-hidden text-ellipsis w-full">
            {open
              ? `Train from ${trainLeg.origin.name} to ${trainLeg.destination.name}`
              : `${formatTime(trainLeg.departureDateTime)}-${formatTime(trainLeg.arrivalDateTime)} ${trainLeg.lineName} from ${trainLeg.origin.name} to ${trainLeg.destination.name}`}
          </span>
          {open ? (
            <HugeiconsIcon
              icon={ArrowUp01Icon}
              className="float-right text-muted-foreground"
            />
          ) : (
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="float-right text-muted-foreground"
            />
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
            <p className="truncate">
              {formatTime(trainLeg.departureDateTime)} {trainLeg.origin.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Duration: {formatDurationMinutes(trainLeg.durationInMinutes)}
            </p>
            <p className="truncate">
              {formatTime(trainLeg.arrivalDateTime)} {trainLeg.destination.name}
            </p>
          </div>
          <img
            src={logoFromOperatorName(trainLeg.operatorName)}
            className="h-4 mt-0 m-auto relative top-[0.125rem]"
            alt={trainLeg.operatorName}
          />
          <div className="flex flex-wrap items-center min-w-0">
            <span className="text-sm text-muted-foreground min-h-6 truncate">
              {trainLeg.operatorName} - {trainLeg.lineName}
            </span>
            <div className="flex ml-auto">
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
