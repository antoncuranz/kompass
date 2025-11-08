import { PlaneTakeoff } from "lucide-react"
import { useState } from "react"
import type { Trip } from "@/schema"
import type { co } from "jazz-tools"
import AccommodationDialogContent from "@/components/dialog/AccommodationDialog"
import ActivityDialog from "@/components/dialog/ActivityDialog"
import FlightDialog from "@/components/dialog/FlightDialog"
import TrainDialog from "@/components/dialog/TrainDialog"
import TransportationDialog from "@/components/dialog/TransportationDialog"
import { Button } from "@/components/ui/button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"

export default function AddSomethingDropdown({
  trip,
}: {
  trip: co.loaded<typeof Trip>
}) {
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false)
  const [flightDialogOpen, setFlightDialogOpen] = useState(false)
  const [trainDialogOpen, setTrainDialogOpen] = useState(false)
  const [transportationDialogOpen, setTransportationDialogOpen] =
    useState(false)

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size="sm" className="h-8 gap-1 mt-0 ml-1 self-end" />}
        >
          <PlaneTakeoff className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Something
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuPositioner align="end">
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setActivityDialogOpen(true)}>
              Add Activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccommodationDialogOpen(true)}>
              Add Accommodation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFlightDialogOpen(true)}>
              Add Flight
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTrainDialogOpen(true)}>
              Add Train
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTransportationDialogOpen(true)}>
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
        trip={trip}
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
}
