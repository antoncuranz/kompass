import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Activity } from "@/domain"
import { useTrip } from "@/components/provider/TripProvider"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"

import {
  Dialog,
  RowContainer,
  useDialogContext,
} from "@/components/dialog/Dialog.tsx"
import AddressInput from "@/components/dialog/input/AddressInput.tsx"
import AmountInput from "@/components/dialog/input/AmountInput.tsx"
import DateInput from "@/components/dialog/input/DateInput.tsx"
import LocationInput from "@/components/dialog/input/LocationInput.tsx"
import { Form, FormField } from "@/components/ui/form"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { dateFromString } from "@/lib/datetime-utils"
import {
  isoDate,
  optionalLocation,
  optionalString,
} from "@/lib/formschema-utils"
import { useActivityMutations } from "@/repo"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
  description: optionalString(),
  date: isoDate("Required"),
  price: z.number().optional(),
  address: optionalString(),
  location: optionalLocation(),
})

export default function ActivityDialog({
  activity,
  open,
  onOpenChange,
}: {
  activity?: Activity
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActivityDialogContent activity={activity} />
    </Dialog>
  )
}

function ActivityDialogContent({ activity }: { activity?: Activity }) {
  const trip = useTrip()
  const { create, update, remove } = useActivityMutations(trip.stid)

  const [edit, setEdit] = useState<boolean>(activity == null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { onClose } = useDialogContext()

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: activity?.name ?? "",
      description: activity?.description ?? "",
      date: activity?.date ? dateFromString(activity.date) : undefined,
      price: activity?.price ?? undefined,
      address: activity?.address ?? "",
      location: activity?.location ?? undefined,
    },
    disabled: !edit,
  })
  const { isSubmitting } = form.formState

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (activity) {
      await update(activity.id, values)
    } else {
      await create(values)
    }
    onClose()
  }

  async function onDeleteButtonClick() {
    if (activity === undefined) {
      return
    }

    if (showDeleteConfirm) {
      await remove(activity.id)
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {edit ? (activity != null ? "Edit" : "New") : "View"} Activity
        </DialogTitle>
      </DialogHeader>
      <Form
        id="activity-form"
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          label="Name"
          render={({ field }) => (
            <Input data-1p-ignore placeholder="My new Activity" {...field} />
          )}
        />
        <FormField
          control={form.control}
          name="description"
          label="Description"
          render={({ field }) => <Textarea {...field} />}
        />
        <RowContainer>
          <FormField
            control={form.control}
            name="date"
            label="Date"
            render={({ field }) => (
              <DateInput
                startDate={trip.startDate}
                endDate={trip.endDate}
                {...field}
              />
            )}
          />
          <FormField
            control={form.control}
            name="price"
            label="Price"
            render={({ field }) => <AmountInput {...field} />}
          />
        </RowContainer>
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
            form="activity-form"
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
