import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Notification01Icon } from "@hugeicons/core-free-icons"
import type { Trip } from "@/domain"
import { Dialog, useDialogContext } from "@/components/dialog/Dialog.tsx"
import DateInput from "@/components/dialog/input/DateInput.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Form, FormField } from "@/components/ui/form.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { Switch } from "@/components/ui/switch.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"
import { usePushNotifications } from "@/hooks/usePushNotificationStatus"
import { dateFromString } from "@/lib/datetime-utils"
import { dateRange, optionalString } from "@/lib/formschema-utils"
import { useTripMutations } from "@/repo"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
  dateRange: dateRange("Required"),
  description: optionalString(),
  imageUrl: optionalString(),
})

export default function TripDialog({
  trip,
  open,
  onOpenChange,
}: {
  trip?: Trip
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TripDialogContent trip={trip} />
    </Dialog>
  )
}

function TripDialogContent({ trip }: { trip?: Trip }) {
  const { create, update, remove } = useTripMutations()
  const [edit, setEdit] = useState<boolean>(trip == undefined)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { onClose } = useDialogContext()

  const {
    toggle: toggleNotifications,
    sendTestNotification,
    status: notificationStatus,
    blockedReason,
  } = usePushNotifications(trip?.stid)

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (trip) {
      await update(trip.stid, {
        ...values,
        startDate: values.dateRange.from,
        endDate: values.dateRange.to,
      })
    } else {
      await create({
        ...values,
        startDate: values.dateRange.from,
        endDate: values.dateRange.to,
      })
    }
    onClose()
  }

  async function onDeleteButtonClick() {
    if (trip === undefined) {
      return
    }

    if (showDeleteConfirm) {
      await remove(trip.stid)
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
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
          render={({ field }) => <Textarea {...field} />}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          label="Image URL"
          render={({ field }) => <Input {...field} />}
        />
        {trip && (
          <div className="flex items-center justify-between">
            <Label>Schedule Change Notifications</Label>
            <div className="flex items-center gap-2 text-muted-foreground">
              {notificationStatus !== "blocked" ? (
                <>
                  <Switch
                    checked={notificationStatus === "active"}
                    onCheckedChange={toggleNotifications}
                    disabled={!edit}
                  />
                  <Button
                    variant="secondary"
                    size="icon-round"
                    disabled={!edit}
                    onClick={sendTestNotification}
                  >
                    <HugeiconsIcon icon={Notification01Icon} />
                  </Button>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Alert02Icon} size={16} />
                  <span className="text-sm">{blockedReason}</span>
                </>
              )}
            </div>
          </div>
        )}
      </Form>
      <DialogFooter>
        {edit ? (
          <Button
            form="trip-form"
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
