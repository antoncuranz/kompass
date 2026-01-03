import { useState } from "react"
import { useTrip } from "@/components/provider/TripProvider"
import AccommodationDialogContent from "@/components/dialog/AccommodationDialog"
import ActivityDialog from "@/components/dialog/ActivityDialog"
import FlightDialog from "@/components/dialog/FlightDialog"
import TrainDialog from "@/components/dialog/TrainDialog"
import TransportationDialog from "@/components/dialog/TransportationDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import { useUserRole } from "@/repo/userRepo"

export default function AddEntryDropdown({
  trigger,
}: {
  trigger: React.ReactElement<
    Record<string, unknown>,
    string | React.JSXElementConstructor<any>
  >
}) {
  const trip = useTrip()
  const role = useUserRole(trip.stid)

  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false)
  const [flightDialogOpen, setFlightDialogOpen] = useState(false)
  const [trainDialogOpen, setTrainDialogOpen] = useState(false)
  const [transportationDialogOpen, setTransportationDialogOpen] =
    useState(false)

  return (
    role &&
    role !== "guest" && (
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger render={trigger} />
          <DropdownMenuPositioner align="end">
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActivityDialogOpen(true)}>
                Add Activity
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAccommodationDialogOpen(true)}
              >
                Add Accommodation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFlightDialogOpen(true)}>
                Add Flight
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTrainDialogOpen(true)}>
                Add Train
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTransportationDialogOpen(true)}
              >
                Add Transportation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenu>
        <ActivityDialog
          open={activityDialogOpen}
          onOpenChange={setActivityDialogOpen}
        />
        <AccommodationDialogContent
          open={accommodationDialogOpen}
          onOpenChange={setAccommodationDialogOpen}
        />
        <FlightDialog
          open={flightDialogOpen}
          onOpenChange={setFlightDialogOpen}
        />
        <TrainDialog open={trainDialogOpen} onOpenChange={setTrainDialogOpen} />
        <TransportationDialog
          open={transportationDialogOpen}
          onOpenChange={setTransportationDialogOpen}
        />
      </div>
    )
  )
}
