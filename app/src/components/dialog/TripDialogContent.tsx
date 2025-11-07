import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { co } from "jazz-tools"
import type { Trip, UserAccount } from "@/schema.ts"
import { useDialogContext } from "@/components/dialog/Dialog.tsx"
import DateInput from "@/components/dialog/input/DateInput.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Form, FormField } from "@/components/ui/form.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { Textarea } from "@/components/ui/textarea.tsx"
import { dateFromString } from "@/components/util.ts"
import { dateRange, optionalString } from "@/formschema.ts"
import { createNewTrip } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
  dateRange: dateRange("Required"),
  description: optionalString(),
  imageUrl: optionalString(),
})

export default function TripDialogContent({
  account,
  trip,
}: {
  account: co.loaded<typeof UserAccount>
  trip?: co.loaded<typeof Trip>
}) {
  const [edit, setEdit] = useState<boolean>(trip == undefined)
  const { onClose } = useDialogContext()

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: trip?.name ?? "",
      description: trip?.description ?? "",
      dateRange: trip
        ? {
            from: dateFromString(trip.startDate),
            to: dateFromString(trip.endDate),
          }
        : undefined,
      imageUrl: trip?.imageUrl ?? "",
    },
    disabled: !edit,
  })
  const { isSubmitting } = form.formState

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (trip) {
      trip.$jazz.applyDiff({
        ...values,
        startDate: values.dateRange.from,
        endDate: values.dateRange.to,
      })
    } else {
      createNewTrip(account, {
        ...values,
        startDate: values.dateRange.from,
        endDate: values.dateRange.to,
        activities: [],
        accommodation: [],
        transportation: [],
      })
    }
    onClose()
  }

  function onDeleteButtonClick() {
    if (trip === undefined) {
      return
    }

    account.root.trips.$jazz.remove(st => st.trip.$jazz.id == trip.$jazz.id)
    // TODO: think about revoking access
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {edit ? (trip != null ? "Edit" : "New") : "View"} Trip
        </DialogTitle>
      </DialogHeader>
      <Form id="trip-form" form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          label="Name"
          render={({ field }) => (
            <Input data-1p-ignore placeholder="My awesome Trip" {...field} />
          )}
        />
        <FormField
          control={form.control}
          name="dateRange"
          label="Start and End Date"
          render={({ field }) => <DateInput mode="range" min={1} {...field} />}
        />
        <FormField
          control={form.control}
          name="description"
          label="Description"
          render={({ field }) => <Textarea id="description" {...field} />}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          label="Image URL"
          render={({ field }) => <Input {...field} />}
        />
      </Form>
      <DialogFooter>
        {edit ? (
          <Button
            form="trip-form"
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
