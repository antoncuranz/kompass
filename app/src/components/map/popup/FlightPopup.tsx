import type { GeoJsonFlight, GeoJsonFlightLeg } from "@/components/map/types"
import { formatTimePadded } from "@/lib/formatting"

export default function FlightPopup({
  properties,
}: {
  properties: GeoJsonFlight
}) {
  const legs = JSON.parse(properties.legs) as Array<GeoJsonFlightLeg>

  return (
    <div className="text-sm">
      <strong>
        ✈️ Flight from {properties.fromMunicipality} to{" "}
        {properties.toMunicipality}
      </strong>
      <div className="iconsolata grid grid-cols-[auto_auto_1fr] gap-x-2">
        {legs.map((leg, idx) => (
          <div key={idx} className="grid col-span-3 grid-cols-subgrid">
            <span>
              {formatTimePadded(leg.departureDateTime)}-
              {formatTimePadded(leg.arrivalDateTime)}
            </span>
            <span className="text-right">{leg.flightNumber}</span>
            <span>
              {leg.fromIata}-{leg.toIata}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
