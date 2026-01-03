import type {
  Accommodation,
  Activity,
  Flight,
  GenericTransportation,
  Train,
  Transportation,
} from "@/domain"
import type { DayRenderData } from "@/types"
import ActivityEntry from "@/components/itinerary/ActivityEntry.tsx"
import DayLabel from "@/components/itinerary/DayLabel.tsx"
import DaySeparator from "@/components/itinerary/DaySeparator.tsx"
import FlightEntry from "@/components/itinerary/FlightEntry.tsx"
import TrainEntry from "@/components/itinerary/TrainEntry.tsx"
import TransportationEntry from "@/components/itinerary/TransportationEntry.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import { formatDuration, getDaysBetween, isSameDay } from "@/lib/datetime-utils"

export default function Day({
  dayData,
  nextDay,
  onActivityClick = () => {},
  onAccommodationClick = () => {},
  onFlightClick = () => {},
  onTrainClick = () => {},
  onTransportationClick = () => {},
}: {
  dayData: DayRenderData
  nextDay: string
  onActivityClick?: (activity: Activity) => void
  onAccommodationClick?: (accommodation: Accommodation | undefined) => void
  onFlightClick?: (flight: Flight) => void
  onTrainClick?: (train: Train) => void
  onTransportationClick?: (transportation: GenericTransportation) => void
}) {
  const collapsedDays = nextDay
    ? getDaysBetween(dayData.day, nextDay).length - 2
    : 0
  const hasNightTransportation =
    dayData.transportation.find(isOvernight) != undefined

  function isOvernight(transportation: Transportation): boolean {
    switch (transportation.type) {
      case "flight":
        return (
          transportation.legs.find(
            leg =>
              isSameDay(leg.departureDateTime, dayData.day) &&
              !isSameDay(leg.arrivalDateTime, dayData.day),
          ) != undefined
        )

      case "train":
        return (
          transportation.legs.find(
            leg =>
              isSameDay(leg.departureDateTime, dayData.day) &&
              !isSameDay(leg.arrivalDateTime, dayData.day),
          ) != undefined
        )

      case "generic":
        return !isSameDay(transportation.arrivalDateTime, dayData.day)
    }
  }

  function renderTransportation(transportation: Transportation) {
    switch (transportation.type) {
      case "flight": {
        return renderFlight(transportation)
      }

      case "train": {
        return renderTrain(transportation)
      }

      case "generic": {
        return (
          isSameDay(transportation.departureDateTime, dayData.day) && (
            <TransportationEntry
              transportation={transportation}
              onClick={() => onTransportationClick(transportation)}
            />
          )
        )
      }
    }
  }

  function renderFlight(flight: Flight) {
    const filteredLegs = flight.legs.filter(leg =>
      isSameDay(leg.departureDateTime, dayData.day),
    )

    return filteredLegs.map((leg, idx) => (
      <div key={idx}>
        <FlightEntry
          flight={flight}
          flightLeg={leg}
          onInfoBtnClick={() => onFlightClick(flight)}
        />
        {filteredLegs.length > idx + 1 && (
          <span className="mx-5 text-sm text-muted-foreground">
            {formatDuration(
              leg.arrivalDateTime,
              filteredLegs[idx + 1].departureDateTime,
            )}{" "}
            Layover
          </span>
        )}
      </div>
    ))
  }

  function renderTrain(train: Train) {
    const filteredLegs = train.legs.filter(leg =>
      isSameDay(leg.departureDateTime, dayData.day),
    )

    return filteredLegs.map((leg, idx) => (
      <div key={idx}>
        <TrainEntry trainLeg={leg} onInfoBtnClick={() => onTrainClick(train)} />
        {filteredLegs.length > idx + 1 && (
          <span className="mx-5 text-sm text-muted-foreground">
            {formatDuration(
              leg.arrivalDateTime,
              filteredLegs[idx + 1].departureDateTime,
            )}{" "}
            Layover
          </span>
        )}
      </div>
    ))
  }

  return (
    <div>
      <DayLabel date={dayData.day} />

      {dayData.activities.map(act => (
        <ActivityEntry
          key={act.id}
          activity={act}
          onClick={() => onActivityClick(act)}
        />
      ))}

      {dayData.transportation.map((transportation, idx) => (
        <div key={idx} className="mt-4">
          {renderTransportation(transportation)}
        </div>
      ))}

      {nextDay &&
        (hasNightTransportation ? (
          <Separator className="relative bottom-5 z-0" />
        ) : (
          <DaySeparator
            className="mt-4"
            accomodation={dayData.accommodation}
            collapsedDays={collapsedDays}
            onAccommodationClick={onAccommodationClick}
          />
        ))}
    </div>
  )
}
