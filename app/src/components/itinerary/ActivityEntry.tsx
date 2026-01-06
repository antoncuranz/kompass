import { useMap } from "react-map-gl/maplibre"
import { Button } from "../ui/button"
import JumpToMapButton from "./JumpToMapButton"
import type { MouseEvent, MouseEventHandler } from "react"
import type { Activity } from "@/domain"
import { formatTime } from "@/lib/formatting"

export default function ActivityEntry({
  activity,
  onClick,
}: {
  activity: Activity
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
}) {
  const { heroMap } = useMap()

  function onChevronClick(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation()
    heroMap?.flyTo({
      center: [activity.location!.longitude, activity.location!.latitude],
    })
  }

  return (
    <div className="mx-5 my-4">
      <Button
        variant="secondary"
        size="base"
        className="w-full h-auto active:scale-[1] text-base text-left! justify-between! not-hover:shadow-none border-dashed hover:border-solid not-disabled:hover:bg-transparent relative group/flyto"
        onClick={onClick}
      >
        <span>{activity.name}</span>
        <span>{activity.time && formatTime(activity.time, true)}</span>
        {activity.location && heroMap && (
          <JumpToMapButton onClick={onChevronClick} />
        )}
      </Button>
    </div>
  )
}
