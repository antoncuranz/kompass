import { useState } from "react"
import { useRole } from "../provider/TripProvider"
import type { Trip } from "@/schema"
import type { co } from "jazz-tools"
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
import { UserRole } from "@/lib/collaboration-utils"

export default function AddEntryDropdown({
  trip,
  trigger,
}: {
  trip: co.loaded<typeof Trip>
  trigger: React.ReactElement<
    Record<string, unknown>,
    string | React.JSXElementConstructor<any>
  >
}) {
  const role = useRole()

  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false)
  const [flightDialogOpen, setFlightDialogOpen] = useState(false)
  const [trainDialogOpen, setTrainDialogOpen] = useState(false)
  const [transportationDialogOpen, setTransportationDialogOpen] =
    useState(false)

  return (
    role !== UserRole.GUEST && (
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
          trip={trip}
          open={activityDialogOpen}
          onOpenChange={setActivityDialogOpen}
        />
        <AccommodationDialogContent
          trip={trip}
          open={accommodationDialogOpen}
          onOpenChange={setAccommodationDialogOpen}
        />
        <FlightDialog
          open={flightDialogOpen}
          onOpenChange={setFlightDialogOpen}
        />
        <TrainDialog
          trip={trip}
          open={trainDialogOpen}
          onOpenChange={setTrainDialogOpen}
        />
        <TransportationDialog
          trip={trip}
          open={transportationDialogOpen}
          onOpenChange={setTransportationDialogOpen}
        />
      </div>
    )
  )
}
