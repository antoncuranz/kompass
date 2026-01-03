import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTrip } from "../provider/TripProvider"
import type { Accommodation } from "@/domain"
import { dateFromString } from "@/lib/datetime-utils"
import {
  dateRange,
  optionalLocation,
  optionalString,
} from "@/lib/formschema-utils"

import { calculateDisabledDateRanges } from "@/lib/accommodation-utils.ts"
import { Dialog, useDialogContext } from "@/components/dialog/Dialog.tsx"
import AddressInput from "@/components/dialog/input/AddressInput.tsx"
import AmountInput from "@/components/dialog/input/AmountInput.tsx"
import DateInput from "@/components/dialog/input/DateInput.tsx"
import LocationInput from "@/components/dialog/input/LocationInput.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Form, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { Textarea } from "@/components/ui/textarea.tsx"
import { useAccommodation } from "@/repo"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
  description: optionalString(),
  dateRange: dateRange("Required"),
  price: z.number().optional(),
  address: optionalString(),
  location: optionalLocation(),
})

export default function AccommodationDialog({
  accommodation,
  open,
  onOpenChange,
}: {
  accommodation?: Accommodation
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AccommodationDialogContent accommodation={accommodation} />
    </Dialog>
  )
}

function AccommodationDialogContent({
  accommodation,
}: {
  accommodation?: Accommodation
}) {
  const trip = useTrip()
  const {
    create: createAccommodation,
    update: updateAccommodation,
    delete: deleteAccommodation,
  } = useAccommodation(trip.stid)

  const [edit, setEdit] = useState<boolean>(accommodation == null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { onClose } = useDialogContext()

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: accommodation?.name ?? "",
      description: accommodation?.description ?? "",
      dateRange: accommodation
        ? {
            from: dateFromString(accommodation.arrivalDate),
            to: dateFromString(accommodation.departureDate),
          }
        : undefined,
      price: accommodation?.price ?? undefined,
      address: accommodation?.address ?? "",
      location: accommodation?.location ?? undefined,
    },
    disabled: !edit,
  })
  const { isSubmitting } = form.formState

  const disabledRanges = calculateDisabledDateRanges(trip, accommodation?.id)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (accommodation) {
      await updateAccommodation(accommodation.id, {
        ...values,
        arrivalDate: values.dateRange.from,
        departureDate: values.dateRange.to,
      })
    } else {
      await createAccommodation(trip.stid, {
        ...values,
        arrivalDate: values.dateRange.from,
        departureDate: values.dateRange.to,
      })
    }
    onClose()
  }

  async function onDeleteButtonClick() {
    if (accommodation === undefined) {
      return
    }

    if (showDeleteConfirm) {
      await deleteAccommodation(trip.stid, accommodation.id)
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {edit ? (accommodation != null ? "Edit" : "New") : "View"}{" "}
          Accommodation
        </DialogTitle>
      </DialogHeader>
      <Form
        id="accommodation-form"
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          label="Name"
          render={({ field }) => <Input data-1p-ignore {...field} />}
        />
        <FormField
          control={form.control}
          name="dateRange"
          label="Arrival and Departure Date"
          render={({ field }) => (
            <DateInput
              mode="range"
              startDate={trip.startDate}
              endDate={trip.endDate}
              min={1}
              disabledRanges={disabledRanges}
              {...field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="description"
          label="Description"
          render={({ field }) => <Textarea {...field} />}
        />
        <FormField
          control={form.control}
          name="price"
          label="Price"
          render={({ field }) => <AmountInput {...field} />}
        />
        <FormField
          control={form.control}
          name="address"
          label="Address"
          render={({ field }) => (
            <AddressInput
              {...field}
              updateCoordinates={coords => form.setValue("location", coords)}
            />
          )}
        />
        <FormField
          control={form.control}
          name="location"
          label="Coordinates"
          render={({ field }) => <LocationInput {...field} />}
        />
      </Form>
      <DialogFooter>
        {edit ? (
          <Button
            form="accommodation-form"
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
