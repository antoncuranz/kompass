import { ChevronRight } from "lucide-react"
import { useMap } from "react-map-gl/maplibre"
import { formatTime } from "../util"
import type { MouseEvent, MouseEventHandler } from "react"
import type { Activity } from "@/schema"

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
      className="rounded-xl border border-dashed my-4 mx-3 py-2 px-4 hover:border-solid hover:cursor-pointer relative group/flyto"
      onClick={onClick}
    >
      {activity.name}
      <span className="float-right">
        {activity.time && formatTime(activity.time, true)}
      </span>
      {activity.location && heroMap && (
        <ChevronRight
          className="text-muted-foreground absolute top-2 -right-3 bg-background rounded-xl border hidden group-hover/flyto:block"
          onClick={onChevronClick}
        />
      )}
    </div>
  )
}
