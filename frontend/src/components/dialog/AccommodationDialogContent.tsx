import { useDialogContext } from "@/components/dialog/Dialog.tsx"
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
import { dateFromString } from "@/components/util.ts"
import { dateRange, optionalLocation, optionalString } from "@/formschema.ts"
import { Accommodation, Trip } from "@/schema.ts"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
  description: optionalString(),
  dateRange: dateRange("Required"),
  price: z.number().optional(),
  address: optionalString(),
  location: optionalLocation(),
})

export default function AccommodationDialogContent({
  trip,
  accommodation,
}: {
  trip: Trip
  accommodation?: Accommodation
}) {
  const [edit, setEdit] = useState<boolean>(accommodation == null)
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (accommodation) {
      accommodation.$jazz.applyDiff({
        ...values,
        arrivalDate: values.dateRange.from,
        departureDate: values.dateRange.to,
      })
      if (!accommodation.location) {
        accommodation.$jazz.set("location", values.location)
      }
    } else {
      trip.accommodation.$jazz.push({
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

    trip.accommodation.$jazz.remove(a => a?.$jazz.id == accommodation.$jazz.id)
    onClose()
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
              {...field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="description"
          label="Description"
          render={({ field }) => <Textarea id="description" {...field} />}
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
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner variant="pinwheel" /> : "Save"}
          </Button>
        ) : (
          <>
            <Button
              variant="destructive"
              className="w-full"
              onClick={onDeleteButtonClick}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              className="w-full"
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
