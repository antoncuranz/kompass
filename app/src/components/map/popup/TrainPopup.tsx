import type { GeoJsonTrain, GeoJsonTrainLeg } from "@/types.ts"
import { formatTimePadded } from "@/components/util.ts"

export default function TrainPopup({
  properties,
}: {
  properties: GeoJsonTrain
}) {
  const legs = JSON.parse(properties.legs) as Array<GeoJsonTrainLeg>

  return (
    <div className="text-sm">
      <strong>
        🚇 Train from {properties.fromMunicipality} to{" "}
        {properties.toMunicipality}
      </strong>
      <div className="iconsolata grid grid-cols-[auto_auto_1fr] gap-x-2">
        {legs.map((leg, idx) => (
          <div key={idx} className="grid col-span-3 grid-cols-subgrid">
            <span>
              {formatTimePadded(leg.departureDateTime)}-
              {formatTimePadded(leg.arrivalDateTime)}
            </span>
            <span className="text-right">{leg.lineName}</span>
            <span>
              {leg.fromStation}-{leg.toStation}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
