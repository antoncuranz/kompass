import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Accommodation, Activity, Flight, GenericTransportation, Train } from "@/schema.ts";
import type { co } from "jazz-tools";
import type { CostItem } from "@/components/cost/CostTypes.tsx";
import AccommodationDialog from "@/components/dialog/AccommodationDialog.tsx";
import ActivityDialog from "@/components/dialog/ActivityDialog.tsx";
import FlightDialog from "@/components/dialog/FlightDialog.tsx";
import TrainDialog from "@/components/dialog/TrainDialog.tsx";
import TransportationDialog from "@/components/dialog/TransportationDialog.tsx";
import Card from "@/components/card/Card.tsx";
import { useTransportation, useTrip } from "@/components/provider/TripProvider";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatAmount } from "@/components/util.ts";
import CostTable from "@/components/cost/CostTable.tsx";
import { calculateTotals, createCostItems, sortCostItems } from "@/components/cost/CostTypes.tsx";

export const Route = createFileRoute("/$trip/cost")({
  component: CostPage,
});

interface EmptyStateProps {
  message?: string;
}

function EmptyState({ message = "No cost items yet" }: EmptyStateProps) {
  return <div className="text-center text-muted-foreground py-8">{message}</div>;
}

function CostPage() {
  const trip = useTrip();
  const transportation = useTransportation();

  const [activityDialog, setActivityDialog] = useState<co.loaded<typeof Activity> | undefined>(
    undefined,
  );
  const [accommodationDialog, setAccommodationDialog] = useState<
    co.loaded<typeof Accommodation> | undefined
  >(undefined);
  const [flightDialog, setFlightDialog] = useState<co.loaded<typeof Flight> | undefined>(undefined);
  const [trainDialog, setTrainDialog] = useState<co.loaded<typeof Train> | undefined>(undefined);
  const [transportationDialog, setTransportationDialog] = useState<
    co.loaded<typeof GenericTransportation> | undefined
  >(undefined);

  const { activities, accommodations, transportations } = createCostItems(trip, transportation);

  const totals = calculateTotals(activities, accommodations, transportations);

  const sortedActivities = sortCostItems(activities);
  const sortedAccommodations = sortCostItems(accommodations);
  const sortedTransportations = sortCostItems(transportations);

  const hasActivities = sortedActivities.length > 0;
  const hasAccommodations = sortedAccommodations.length > 0;
  const hasTransportations = sortedTransportations.length > 0;
  const hasAnyItems = hasActivities || hasAccommodations || hasTransportations;

  function handleItemClick(item: CostItem) {
    switch (item.type) {
      case "activity":
        setActivityDialog(item.item);
        break;
      case "accommodation":
        setAccommodationDialog(item.item);
        break;
      case "transportation": {
        const t = item.item;
        switch (t.type) {
          case "flight":
            setFlightDialog(t);
            break;
          case "train":
            setTrainDialog(t);
            break;
          case "generic":
            setTransportationDialog(t);
            break;
        }
        break;
      }
    }
  }

  return (
    <>
      <Card title="Trip Costs" testId="cost-card">
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

            {(totals.activities > 0 || totals.accommodations > 0 || totals.transportations > 0) && (
              <Table className="table-fixed">
                <TableBody>
                  <TableRow className="font-bold border-t-2 border-b-0 hover:bg-transparent">
                    <TableCell colSpan={2} className="align-top pl-3">
                      Total
                    </TableCell>
                    <TableCell className="text-right w-32 align-top pr-3">
                      {formatAmount(totals.grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </>
        )}
      </Card>

      <ActivityDialog
        trip={trip}
        activity={activityDialog}
        open={activityDialog !== undefined}
        onOpenChange={(open) => !open && setActivityDialog(undefined)}
      />
      <AccommodationDialog
        trip={trip}
        accommodation={accommodationDialog}
        open={accommodationDialog !== undefined}
        onOpenChange={(open) => !open && setAccommodationDialog(undefined)}
      />
      <FlightDialog
        trip={trip}
        flight={flightDialog}
        open={flightDialog !== undefined}
        onOpenChange={(open) => !open && setFlightDialog(undefined)}
      />
      <TrainDialog
        trip={trip}
        train={trainDialog}
        open={trainDialog !== undefined}
        onOpenChange={(open) => !open && setTrainDialog(undefined)}
      />
      <TransportationDialog
        trip={trip}
        transportation={transportationDialog}
        open={transportationDialog !== undefined}
        onOpenChange={(open) => !open && setTransportationDialog(undefined)}
      />
    </>
  );
}
