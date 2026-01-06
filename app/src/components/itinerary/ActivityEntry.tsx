import { useMap } from "react-map-gl/maplibre"
import JumpToMapButton from "./JumpToMapButton"
import type { MouseEvent, MouseEventHandler } from "react"
import type { Activity } from "@/domain"
import { formatTime } from "@/lib/formatting"

export default function ActivityEntry({
  activity,
  onClick,
}: {
  activity: Activity
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
}) {
  const { heroMap } = useMap()

  function onChevronClick(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation()
    heroMap?.flyTo({
      center: [activity.location!.longitude, activity.location!.latitude],
    })
  }

  return (
    <div
      className="rounded-lg border border-dashed my-4 mx-5 p-2 px-3 hover:border-solid hover:shadow-sm active:shadow-xs cursor-pointer relative group/flyto"
      onClick={onClick}
    >
      {activity.name}
      <span className="float-right">
        {activity.time && formatTime(activity.time, true)}
      </span>
      {activity.location && heroMap && (
        <JumpToMapButton onClick={onChevronClick} />
      )}
    </div>
  )
}
