import { useState } from "react"
import type { DayRenderData } from "@/components/itinerary/types"
import type {
  Accommodation,
  Activity,
  Flight,
  GenericTransportation,
  Train,
} from "@/domain"
import { UserRoleHelpers } from "@/domain"
import { useTrip } from "@/components/provider/TripProvider"
import AccommodationDialog from "@/components/dialog/AccommodationDialog"
import ActivityDialog from "@/components/dialog/ActivityDialog"
import FlightDialog from "@/components/dialog/FlightDialog"
import TrainDialog from "@/components/dialog/TrainDialog"
import TransportationDialog from "@/components/dialog/TransportationDialog"
import Day from "@/components/itinerary/Day.tsx"
import { useUserRole } from "@/repo/user"

export default function Itinerary({
  dataByDays,
}: {
  dataByDays: Array<DayRenderData>
}) {
  const trip = useTrip()
  const userRole = useUserRole(trip.stid)

  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [dialogActivity, setDialogActivity] = useState<Activity | undefined>()

  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false)
  const [dialogAccommodation, setDialogAccommodation] = useState<
    Accommodation | undefined
  >()

  const [flightDialogOpen, setFlightDialogOpen] = useState(false)
  const [dialogFlight, setDialogFlight] = useState<Flight | undefined>()

  const [trainDialogOpen, setTrainDialogOpen] = useState(false)
  const [dialogTrain, setDialogTrain] = useState<Train | undefined>()

  const [transportationDialogOpen, setTransportationDialogOpen] =
    useState(false)
  const [dialogTransportation, setDialogTransportation] = useState<
    GenericTransportation | undefined
  >()

  function onActivityClick(activity: Activity) {
    setDialogActivity(activity)
    setActivityDialogOpen(true)
  }

  function onAccommodationClick(accommodation: Accommodation | undefined) {
    if (accommodation !== undefined || UserRoleHelpers.canWrite(userRole)) {
      setDialogAccommodation(accommodation)
      setAccommodationDialogOpen(true)
    }
  }

  function onFlightClick(flight: Flight) {
    setDialogFlight(flight)
    setFlightDialogOpen(true)
  }

  function onTrainClick(train: Train) {
    setDialogTrain(train)
    setTrainDialogOpen(true)
  }

  function onTransportationClick(transportation: GenericTransportation) {
    setDialogTransportation(transportation)
    setTransportationDialogOpen(true)
  }

  return (
    <div className="mb-5">
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
        activity={dialogActivity}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
      />
      <AccommodationDialog
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
        train={dialogTrain}
        open={trainDialogOpen}
        onOpenChange={setTrainDialogOpen}
      />
      <TransportationDialog
        transportation={dialogTransportation}
        open={transportationDialogOpen}
        onOpenChange={setTransportationDialogOpen}
      />
    </div>
  )
}
