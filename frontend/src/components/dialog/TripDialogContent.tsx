import { RowContainer, useDialogContext } from "@/components/dialog/Dialog.tsx"
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
import { isoDate, optionalString } from "@/formschema.ts"
import { JazzAccount, Trip } from "@/schema.ts"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
  startDate: isoDate("Required"),
  endDate: isoDate("Required"),
  description: optionalString(),
  imageUrl: optionalString(),
})

export default function TripDialogContent({
  account,
  trip,
}: {
  account: JazzAccount
  trip?: Trip
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
      startDate: trip?.startDate ? dateFromString(trip.startDate) : undefined,
      endDate: trip?.endDate ? dateFromString(trip.endDate) : undefined,
      imageUrl: trip?.imageUrl ?? "",
    },
    disabled: !edit,
  })
  const { isSubmitting } = form.formState

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (trip) {
      trip.$jazz.applyDiff(values)
    } else {
      account.root.trips.$jazz.push({
        ...values,
        activities: [],
        accommodation: [],
        transportation: [],
      })
    }
    onClose()
  }

  async function onDeleteButtonClick() {
    if (trip === undefined) {
      return
    }

    account.root.trips.$jazz.remove(t => t?.$jazz.id == trip.$jazz.id)
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
        <RowContainer>
          <FormField
            control={form.control}
            name="startDate"
            label="Start Date"
            render={({ field }) => <DateInput {...field} />}
          />
          <FormField
            control={form.control}
            name="endDate"
            label="End Date"
            render={({ field }) => <DateInput {...field} />}
          />
        </RowContainer>
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
