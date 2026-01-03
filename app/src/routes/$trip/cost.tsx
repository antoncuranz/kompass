import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import type { CostItem } from "@/components/cost/CostTypes.tsx"
import type {
  Accommodation,
  Activity,
  Flight,
  GenericTransportation,
  Train,
} from "@/domain"
import AccommodationDialog from "@/components/dialog/AccommodationDialog.tsx"
import ActivityDialog from "@/components/dialog/ActivityDialog.tsx"
import FlightDialog from "@/components/dialog/FlightDialog.tsx"
import TrainDialog from "@/components/dialog/TrainDialog.tsx"
import TransportationDialog from "@/components/dialog/TransportationDialog.tsx"
import Pane from "@/components/Pane.tsx"
import { useTrip } from "@/components/provider/TripProvider"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { formatAmount } from "@/lib/misc-utils"
import CostTable from "@/components/cost/CostTable.tsx"
import {
  calculateTotals,
  createCostItems,
  sortCostItems,
} from "@/components/cost/CostTypes.tsx"
import {
  useAccommodationRepo,
  useActivityRepo,
  useTransportation,
} from "@/repo"

export const Route = createFileRoute("/$trip/cost")({
  component: CostPage,
})

interface EmptyStateProps {
  message?: string
}

function EmptyState({ message = "No cost items yet" }: EmptyStateProps) {
  return <div className="text-center text-muted-foreground py-8">{message}</div>
}

function CostPage() {
  const trip = useTrip()
  const { activities } = useActivityRepo(trip.stid)
  const { accommodation } = useAccommodationRepo(trip.stid)
  const { transportation } = useTransportation(trip.stid)

  const [activityDialog, setActivityDialog] = useState<Activity | undefined>(
    undefined,
  )
  const [accommodationDialog, setAccommodationDialog] = useState<
    Accommodation | undefined
  >(undefined)
  const [flightDialog, setFlightDialog] = useState<Flight | undefined>(
    undefined,
  )
  const [trainDialog, setTrainDialog] = useState<Train | undefined>(undefined)
  const [transportationDialog, setTransportationDialog] = useState<
    GenericTransportation | undefined
  >(undefined)

  const { activityItems, accommodationItems, transportationItems } =
    createCostItems(activities, accommodation, transportation)

  const totals = calculateTotals(
    activityItems,
    accommodationItems,
    transportationItems,
  )

  const sortedActivities = sortCostItems(activityItems)
  const sortedAccommodations = sortCostItems(accommodationItems)
  const sortedTransportations = sortCostItems(transportationItems)

  const hasActivities = sortedActivities.length > 0
  const hasAccommodations = sortedAccommodations.length > 0
  const hasTransportations = sortedTransportations.length > 0
  const hasAnyItems = hasActivities || hasAccommodations || hasTransportations

  function handleItemClick(item: CostItem) {
    switch (item.type) {
      case "activity":
        setActivityDialog(item.item)
        break
      case "accommodation":
        setAccommodationDialog(item.item)
        break
      case "transportation": {
        const t = item.item
        switch (t.type) {
          case "flight":
            setFlightDialog(t)
            break
          case "train":
            setTrainDialog(t)
            break
          case "generic":
            setTransportationDialog(t)
            break
        }
        break
      }
    }
  }

  return (
    <>
      <Pane testId="cost-card">
        <div className="my-3">
          {!hasAnyItems ? (
            <EmptyState />
          ) : (
            <>
              <CostTable
                title="Activities"
                items={sortedActivities}
                onItemClick={handleItemClick}
                total={totals.activities}
              />
              <CostTable
                title="Transportation"
                items={sortedTransportations}
                onItemClick={handleItemClick}
                total={totals.transportations}
              />
              <CostTable
                title="Accommodation"
                items={sortedAccommodations}
                onItemClick={handleItemClick}
                total={totals.accommodations}
              />

              {(totals.activities > 0 ||
                totals.accommodations > 0 ||
                totals.transportations > 0) && (
                <Table className="table-fixed">
                  <TableBody>
                    <TableRow className="font-bold border-t-2 border-b-0 hover:bg-transparent">
                      <TableCell colSpan={2} className="align-top pl-5">
                        Total
                      </TableCell>
                      <TableCell className="text-right w-32 align-top pr-5">
                        {formatAmount(totals.grandTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </div>
      </Pane>

      <ActivityDialog
        activity={activityDialog}
        open={activityDialog !== undefined}
        onOpenChange={open => !open && setActivityDialog(undefined)}
      />
      <AccommodationDialog
        accommodation={accommodationDialog}
        open={accommodationDialog !== undefined}
        onOpenChange={open => !open && setAccommodationDialog(undefined)}
      />
      <FlightDialog
        flight={flightDialog}
        open={flightDialog !== undefined}
        onOpenChange={open => !open && setFlightDialog(undefined)}
      />
      <TrainDialog
        train={trainDialog}
        open={trainDialog !== undefined}
        onOpenChange={open => !open && setTrainDialog(undefined)}
      />
      <TransportationDialog
        transportation={transportationDialog}
        open={transportationDialog !== undefined}
        onOpenChange={open => !open && setTransportationDialog(undefined)}
      />
    </>
  )
}
