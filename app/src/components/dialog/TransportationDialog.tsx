import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import type { GenericTransportation } from "@/domain"
import { useTrip } from "@/components/provider/TripProvider"
import {
  Dialog,
  RowContainer,
  useDialogContext,
} from "@/components/dialog/Dialog.tsx"
import AddressInput from "@/components/dialog/input/AddressInput.tsx"
import AmountInput from "@/components/dialog/input/AmountInput.tsx"
import DateTimeInput from "@/components/dialog/input/DateTimeInput.tsx"
import LocationInput from "@/components/dialog/input/LocationInput.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Form, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { dateFromString, dateToString } from "@/lib/datetime-utils"
import { titleCase } from "@/lib/misc-utils"
import { isoDateTime, location, optionalString } from "@/lib/formschema-utils"
import { TransportationType, getTransportationTypeEmoji } from "@/types.ts"
import { useTransportationMutations } from "@/repo"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
  genericType: z.string().nonempty("Required"),
  price: z.number().optional(),
  departureDateTime: isoDateTime("Required"),
  arrivalDateTime: isoDateTime("Required"),
  origin: location("Required"),
  destination: location("Required"),
  originAddress: optionalString(),
  destinationAddress: optionalString(),
})

export default function TransportationDialog({
  transportation,
  open,
  onOpenChange,
}: {
  transportation?: GenericTransportation
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TransportationDialogContent transportation={transportation} />
    </Dialog>
  )
}

function TransportationDialogContent({
  transportation,
}: {
  transportation?: GenericTransportation
}) {
  const trip = useTrip()
  const {
    createGeneric: createGenericTransportation,
    updateGeneric: updateGenericTransportation,
    remove,
  } = useTransportationMutations(trip.stid)

  const [edit, setEdit] = useState<boolean>(transportation == null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { onClose } = useDialogContext()

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: transportation?.name ?? "",
      genericType: transportation?.genericType ?? "",
      price: transportation?.price ?? undefined,
      departureDateTime: transportation?.departureDateTime
        ? dateFromString(transportation.departureDateTime)
        : undefined,
      arrivalDateTime: transportation?.arrivalDateTime
        ? dateFromString(transportation.arrivalDateTime)
        : undefined,
      origin: transportation?.origin ?? undefined,
      destination: transportation?.destination ?? undefined,
      originAddress: transportation?.originAddress ?? "",
      destinationAddress: transportation?.destinationAddress ?? "",
    },
    disabled: !edit,
  })
  const { isSubmitting } = form.formState

  function enrichGeoJsonPoints(
    geoJson: GeoJSON.FeatureCollection,
    values: z.infer<typeof formSchema>,
  ) {
    for (const feature of geoJson.features) {
      if (feature.geometry.type === "Point") {
        feature.properties = {
          ...feature.properties,
          type: values.genericType.toUpperCase(),
          name: values.name,
          departureDateTime: values.departureDateTime,
          arrivalDateTime: values.arrivalDateTime,
        }
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const directionsResponse = await fetch("/api/v1/geocoding/directions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: values.origin,
        end: values.destination,
        transportationType: values.genericType.toUpperCase(),
      }),
    })

    if (!directionsResponse.ok) {
      toast("Error fetching directions", {
        description: await directionsResponse.text(),
      })
      return
    }

    const geoJson = await directionsResponse.json()
    enrichGeoJsonPoints(geoJson, values)

    if (transportation) {
      await updateGenericTransportation(transportation.id, {
        geoJson,
        ...values,
      })
    } else {
      await createGenericTransportation({
        geoJson,
        ...values,
      })
    }
    onClose()
  }

  async function onDeleteButtonClick() {
    if (transportation === undefined) {
      return
    }

    if (showDeleteConfirm) {
      await remove(transportation.id)
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {edit ? (transportation != null ? "Edit" : "New") : "View"}{" "}
          Transportation
        </DialogTitle>
      </DialogHeader>
      <Form
        id="transportation-form"
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          label="Name"
          render={({ field }) => (
            <Input
              data-1p-ignore
              placeholder="My new Transportation"
              {...field}
            />
          )}
        />
        <RowContainer>
          <FormField
            control={form.control}
            name="genericType"
            label="Type"
            render={({ field }) => (
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
                disabled={field.disabled}
              >
                <SelectTrigger
                  data-testid="generic-type-select"
                  className="w-full"
                >
                  <SelectValue placeholder="Select type">
                    {field.value
                      ? `${getTransportationTypeEmoji(field.value)} ${titleCase(field.value)}`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectPositioner>
                  <SelectContent>
                    {[
                      TransportationType.Bus,
                      TransportationType.Ferry,
                      TransportationType.Boat,
                      TransportationType.Bike,
                      TransportationType.Car,
                      TransportationType.Hike,
                      TransportationType.Other,
                    ].map(type => (
                      <SelectItem key={type} value={type}>
                        {getTransportationTypeEmoji(type)} {titleCase(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectPositioner>
              </Select>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            label="Price"
            render={({ field }) => <AmountInput {...field} />}
          />
        </RowContainer>
        <Separator className="mt-4 mb-2" />
        <FormField
          control={form.control}
          name="departureDateTime"
          label="Departure Time"
          render={({ field }) => (
            <DateTimeInput
              startDate={trip.startDate}
              endDate={trip.endDate}
              {...field}
              onChange={date => {
                field.onChange(date)
                form.setValue("arrivalDateTime", date)
              }}
            />
          )}
        />
        <FormField
          control={form.control}
          name="originAddress"
          label="Origin Address"
          render={({ field }) => (
            <AddressInput
              {...field}
              updateCoordinates={coords => form.setValue("origin", coords)}
            />
          )}
        />
        <FormField
          control={form.control}
          name="origin"
          label="Origin Coordinates"
          render={({ field }) => <LocationInput {...field} />}
        />
        <Separator className="mt-4 mb-2" />
        <FormField
          control={form.control}
          name="arrivalDateTime"
          label="Arrival Time"
          render={({ field }) => (
            <DateTimeInput
              startDate={
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                form.getValues("departureDateTime")
                  ? dateToString(form.getValues("departureDateTime"))
                  : trip.startDate
              }
              endDate={trip.endDate}
              {...field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="destinationAddress"
          label="Destination Address"
          render={({ field }) => (
            <AddressInput
              {...field}
              updateCoordinates={coords => form.setValue("destination", coords)}
            />
          )}
        />
        <FormField
          control={form.control}
          name="destination"
          label="Destination Coordinates"
          render={({ field }) => <LocationInput {...field} />}
        />
      </Form>
      <DialogFooter>
        {edit ? (
          <Button
            form="transportation-form"
            type="submit"
            size="round"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner variant="pinwheel" /> : "Save"}
          </Button>
        ) : (
          <>
            <Button
              variant="destructive"
              size="round"
              className="w-full shrink-1"
              onClick={onDeleteButtonClick}
            >
              {showDeleteConfirm ? "Confirm Delete" : "Delete"}
            </Button>
            <Button
              variant="secondary"
              size="round"
              className="w-full shrink-1"
              onClick={() => setEdit(true)}
            >
              Edit
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  )
}
