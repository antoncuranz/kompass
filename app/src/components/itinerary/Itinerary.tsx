import { useState } from "react"
import { useRole } from "../provider/TripProvider"
import type {
  Accommodation,
  Activity,
  Flight,
  GenericTransportation,
  Train,
  Trip,
} from "@/schema.ts"
import type { DayRenderData } from "@/types.ts"
import type { co } from "jazz-tools"
import AccommodationDialog from "@/components/dialog/AccommodationDialog"
import ActivityDialog from "@/components/dialog/ActivityDialog"
import FlightDialog from "@/components/dialog/FlightDialog"
import TrainDialog from "@/components/dialog/TrainDialog"
import TransportationDialog from "@/components/dialog/TransportationDialog"
import Day from "@/components/itinerary/Day.tsx"
import { UserRole } from "@/lib/collaboration-utils"

export default function Itinerary({
  trip,
  dataByDays,
}: {
  trip: co.loaded<typeof Trip>
  dataByDays: Array<DayRenderData>
}) {
  const userRole = useRole()

  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [dialogActivity, setDialogActivity] = useState<
    co.loaded<typeof Activity> | undefined
  >()

  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false)
  const [dialogAccommodation, setDialogAccommodation] = useState<
    co.loaded<typeof Accommodation> | undefined
  >()

  const [flightDialogOpen, setFlightDialogOpen] = useState(false)
  const [dialogFlight, setDialogFlight] = useState<
    co.loaded<typeof Flight> | undefined
  >()

  const [trainDialogOpen, setTrainDialogOpen] = useState(false)
  const [dialogTrain, setDialogTrain] = useState<
    co.loaded<typeof Train> | undefined
  >()

  const [transportationDialogOpen, setTransportationDialogOpen] =
    useState(false)
  const [dialogTransportation, setDialogTransportation] = useState<
    co.loaded<typeof GenericTransportation> | undefined
  >()

  function onActivityClick(activity: co.loaded<typeof Activity>) {
    setDialogActivity(activity)
    setActivityDialogOpen(true)
  }

  function onAccommodationClick(
    accommodation: co.loaded<typeof Accommodation> | undefined,
  ) {
    if (accommodation !== undefined || userRole !== UserRole.GUEST) {
      setDialogAccommodation(accommodation)
      setAccommodationDialogOpen(true)
    }
  }

  function onFlightClick(flight: co.loaded<typeof Flight>) {
    setDialogFlight(flight)
    setFlightDialogOpen(true)
  }

  function onTrainClick(train: co.loaded<typeof Train>) {
    setDialogTrain(train)
    setTrainDialogOpen(true)
  }

  function onTransportationClick(
    transportation: co.loaded<typeof GenericTransportation>,
  ) {
    setDialogTransportation(transportation)
    setTransportationDialogOpen(true)
  }

  return (
    <div className="mb-5">
      {/* <Separator /> */}
      {dataByDays.map((dayData, idx) => (
        <Day
          key={dayData.day}
          dayData={dayData}
          nextDay={dataByDays[idx + 1]?.day}
          onActivityClick={onActivityClick}
          onAccommodationClick={onAccommodationClick}
          onFlightClick={onFlightClick}
          onTrainClick={onTrainClick}
          onTransportationClick={onTransportationClick}
        />
      ))}
      <ActivityDialog
        trip={trip}
        activity={dialogActivity}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
      />
      <AccommodationDialog
        trip={trip}
        accommodation={dialogAccommodation}
        open={accommodationDialogOpen}
        onOpenChange={setAccommodationDialogOpen}
      />
      <FlightDialog
        flight={dialogFlight}
        open={flightDialogOpen}
        onOpenChange={setFlightDialogOpen}
      />
      <TrainDialog
        trip={trip}
        train={dialogTrain}
        open={trainDialogOpen}
        onOpenChange={setTrainDialogOpen}
      />
      <TransportationDialog
        trip={trip}
        transportation={dialogTransportation}
        open={transportationDialogOpen}
        onOpenChange={setTransportationDialogOpen}
      />
    </div>
  )
}
