import { zodResolver } from "@hookform/resolvers/zod"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, MinusSignIcon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import type { Train, TrainLeg } from "@/domain"
import { useTrip } from "@/components/provider/TripProvider"
import {
  Dialog,
  RowContainer,
  useDialogContext,
} from "@/components/dialog/Dialog.tsx"
import AmountInput from "@/components/dialog/input/AmountInput.tsx"
import DateInput from "@/components/dialog/input/DateInput.tsx"
import TrainStationInput from "@/components/dialog/input/TrainStationInput.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Form, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { dateFromString } from "@/lib/datetime-utils"
import { isoDate, trainStation } from "@/lib/formschema-utils"
import { useTransportationRepo } from "@/repo"

const formSchema = z.object({
  departureDate: isoDate("Required"),
  fromStationId: trainStation("Required"),
  toStationId: trainStation("Required"),
  viaStationId: trainStation().optional(),
  trainNumbers: z
    .array(
      z.object({
        value: z.string().nonempty("Required"),
      }),
    )
    .transform(x => x.map(y => y.value)),
  price: z.number().optional(),
})

export default function TrainDialog({
  train,
  open,
  onOpenChange,
}: {
  train?: Train
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TrainDialogContent train={train} />
    </Dialog>
  )
}

function TrainDialogContent({ train }: { train?: Train }) {
  const trip = useTrip()
  const { createTrain, updateTrain, remove } = useTransportationRepo(trip.stid)

  const [edit, setEdit] = useState<boolean>(train == null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { onClose } = useDialogContext()

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departureDate: train
        ? dateFromString(train.legs[0].departureDateTime)
        : undefined,
      fromStationId: getDefaultFromStation(train?.legs),
      toStationId: getDefaultToStation(train?.legs),
      viaStationId: undefined,
      trainNumbers: mapLegsOrDefault(train?.legs),
      price: train?.price ?? undefined,
    },
    disabled: !edit,
  })
  const { isSubmitting } = form.formState

  function getDefaultFromStation(trainLegs: Array<TrainLeg> | undefined) {
    if (trainLegs !== undefined) {
      return trainLegs[0].origin
    }
    return undefined
  }

  function getDefaultToStation(trainLegs: Array<TrainLeg> | undefined) {
    if (trainLegs !== undefined) {
      return trainLegs[trainLegs.length - 1].destination
    }
    return undefined
  }

  function mapLegsOrDefault(trainLegs: Array<TrainLeg> | undefined) {
    if (trainLegs !== undefined) {
      return trainLegs.map(leg => ({
        value: leg.lineName,
      }))
    }
    return [{ value: "" }]
  }

  const trainNumbersArray = useFieldArray({
    control: form.control,
    name: "trainNumbers",
    rules: {
      minLength: 1,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch("/api/v1/trains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (response.ok) {
      const responseJson = await response.json()
      if (train) {
        await updateTrain(train.id, {
          ...responseJson,
          price: values.price,
        })
      } else {
        await createTrain({
          ...responseJson,
          price: values.price,
        })
      }
      onClose()
    } else {
      toast("Error looking up Train", {
        description: await response.text(),
      })
    }
  }

  async function onDeleteButtonClick() {
    if (train === undefined) {
      return
    }

    if (showDeleteConfirm) {
      await remove(train.id)
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
  }

  function addLeg() {
    trainNumbersArray.append({ value: "" })
  }

  function deleteLeg() {
    trainNumbersArray.remove(trainNumbersArray.fields.length - 1)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {edit ? (train != null ? "Edit" : "New") : "View"} Train Journey
        </DialogTitle>
      </DialogHeader>
      <Form id="train-form" form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="fromStationId"
          label="From Station"
          render={({ field }) => (
            <TrainStationInput placeholder="Berlin Südkreuz" {...field} />
          )}
        />
        <FormField
          control={form.control}
          name="viaStationId"
          label="Via Station"
          render={({ field }) => (
            <TrainStationInput placeholder="Optional" {...field} />
          )}
        />
        <FormField
          control={form.control}
          name="toStationId"
          label="To Station"
          render={({ field }) => (
            <TrainStationInput placeholder="München" {...field} />
          )}
        />
        <RowContainer>
          <FormField
            control={form.control}
            name="departureDate"
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

        <div className="flex">
          <h3 className="font-semibold mb-2 grow">Train Legs</h3>
          {edit && (
            <div>
              {trainNumbersArray.fields.length > 1 ? (
                <Button
                  variant="ghost"
                  className="p-2 h-auto rounded-full"
                  onClick={() => deleteLeg()}
                >
                  <HugeiconsIcon icon={MinusSignIcon} />
                </Button>
              ) : (
                <div />
              )}
              <Button
                variant="ghost"
                className="p-2 h-auto rounded-full"
                onClick={() => addLeg()}
              >
                <HugeiconsIcon icon={Add01Icon} />
              </Button>
            </div>
          )}
        </div>

        {trainNumbersArray.fields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`trainNumbers.${index}.value`}
            label={`Train #${trainNumbersArray.fields.length > 1 ? index + 1 : ""}`}
            render={({ field }) => <Input placeholder="ICE707" {...field} />}
          />
        ))}
      </Form>
      <DialogFooter>
        {edit ? (
          <Button
            form="train-form"
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
