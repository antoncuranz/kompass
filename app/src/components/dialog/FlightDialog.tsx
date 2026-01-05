import { zodResolver } from "@hookform/resolvers/zod"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, MinusSignIcon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import type { AmbiguousFlightChoice } from "@/components/dialog/types"
import type { Flight, FlightLeg, PNR } from "@/domain"
import { useTrip } from "@/components/provider/TripProvider"
import AmbiguousFlightDialog from "@/components/dialog/AmbiguousFlightDialog"
import {
  Dialog,
  RowContainer,
  useDialogContext,
} from "@/components/dialog/Dialog.tsx"
import AmountInput from "@/components/dialog/input/AmountInput.tsx"
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
import { dateFromString } from "@/lib/datetime"
import { isoDate, optionalString } from "@/lib/formschema"
import { useTransportationMutations } from "@/repo"

const formSchema = z.object({
  legs: z.array(
    z.object({
      date: isoDate("Required"),
      flightNumber: z.string().nonempty("Required"),
      originAirport: optionalString(),
    }),
  ),
  pnrs: z.array(
    z.object({
      airline: z.string().nonempty("Required"),
      pnr: z.string().nonempty("Required"),
    }),
  ),
  price: z.number().optional(),
})

type AmbiguousDialogData = {
  legs: Array<{ date: string; flightNumber: string }>
  choices: { [flightNumber: string]: Array<AmbiguousFlightChoice> }
}

export default function FlightDialog({
  flight,
  open,
  onOpenChange,
}: {
  flight?: Flight
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FlightDialogContent flight={flight} />
    </Dialog>
  )
}

function FlightDialogContent({ flight }: { flight?: Flight }) {
  const trip = useTrip()
  const { createFlight, updateFlight, remove } = useTransportationMutations(
    trip.stid,
  )

  const [edit, setEdit] = useState<boolean>(flight == undefined)
  const [ambiguousDialogOpen, setAmbiguousDialogOpen] = useState(false)
  const [ambiguousDialogData, setAmbiguousDialogData] =
    useState<AmbiguousDialogData>({ legs: [], choices: {} })
  const { onClose } = useDialogContext()

  function mapLegsOrDefault(flightLegs: Array<FlightLeg> | undefined) {
    if (flightLegs) {
      return flightLegs.map(leg => ({
        date: dateFromString(leg.amadeusFlightDate ?? leg.departureDateTime),
        flightNumber: leg.flightNumber,
      }))
    }

    return [
      {
        date: dateFromString(trip.startDate),
        flightNumber: "",
      },
    ]
  }

  function mapPnrsOrDefault(pnrs: Array<PNR>) {
    return pnrs.map(pnr => ({
      airline: pnr.airline,
      pnr: pnr.pnr,
    }))
  }

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legs: mapLegsOrDefault(flight?.legs),
      pnrs: mapPnrsOrDefault(flight?.pnrs ?? []),
      price: flight?.price ?? undefined,
    },
    disabled: !edit,
  })
  const { isSubmitting } = form.formState

  const legsArray = useFieldArray({
    control: form.control,
    name: "legs",
    rules: {
      minLength: 1,
    },
  })

  const pnrsArray = useFieldArray({
    control: form.control,
    name: "pnrs",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch("/api/v1/flights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legs: values.legs }),
    })

    if (response.ok) {
      const responseJson = await response.json()
      const augmentedValues = {
        ...values,
        legs: responseJson.legs,
        geoJson: responseJson.geoJson,
      }
      if (flight) {
        await updateFlight(flight.id, augmentedValues)
      } else {
        await createFlight(augmentedValues)
      }
      onClose()
    } else if (response.status === 422) {
      try {
        const ambiguousChoices = (await response.json()) as Record<
          string,
          Array<AmbiguousFlightChoice>
        >
        setAmbiguousDialogData({
          legs: values.legs,
          choices: ambiguousChoices,
        })
        setAmbiguousDialogOpen(true)
      } catch {
        toast("Error parsing ambiguous flight response", {
          description: "Unable to parse flight choices",
        })
      }
    } else {
      toast("Error looking up Flight", {
        description: await response.text(),
      })
    }
  }

  function handleAmbiguousFlightSelection(
    selectedFlights: Map<number, AmbiguousFlightChoice>,
  ) {
    setAmbiguousDialogOpen(false)
    setAmbiguousDialogData({ legs: [], choices: {} })

    for (const [legId, flight] of selectedFlights) {
      form.setValue(`legs.${legId}.originAirport`, flight.originIata)
    }

    void form.handleSubmit(onSubmit)()
  }

  async function onDeleteButtonClick() {
    if (flight === undefined) {
      return
    }

    await remove(flight.id)
    onClose()
  }

  function addLeg() {
    legsArray.append({
      date: legsArray.fields[legsArray.fields.length - 1].date,
      flightNumber: "",
    })
  }

  function deleteLeg() {
    legsArray.remove(legsArray.fields.length - 1)
  }

  function addPnr() {
    pnrsArray.append({ airline: "", pnr: "" })
  }

  function deletePnr() {
    pnrsArray.remove(pnrsArray.fields.length - 1)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {edit ? (flight != null ? "Edit" : "New") : "View"} Flight
        </DialogTitle>
      </DialogHeader>
      <Form id="flight-form" form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex">
          <h3 className="font-semibold mb-2 grow">Flight Legs</h3>
          {edit && (
            <div>
              {legsArray.fields.length > 1 ? (
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

        {legsArray.fields.map((field, index) => (
          <div key={field.id}>
            <RowContainer>
              <FormField
                control={form.control}
                name={`legs.${index}.date`}
                label={`Date ${legsArray.fields.length > 1 ? index + 1 : ""}`}
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
                name={`legs.${index}.flightNumber`}
                label={`Flight #${legsArray.fields.length > 1 ? index + 1 : ""}`}
                render={({ field }) => <Input placeholder="LH717" {...field} />}
              />
            </RowContainer>
          </div>
        ))}

        {((flight && flight.pnrs.length > 0) || edit) && (
          <>
            <div className="flex">
              <h3 className="font-semibold mb-2 grow">PNRs</h3>
              {edit && (
                <div>
                  {pnrsArray.fields.length > 0 ? (
                    <Button
                      aria-label="Delete PNR"
                      variant="ghost"
                      className="p-2 h-auto rounded-full"
                      onClick={() => deletePnr()}
                    >
                      <HugeiconsIcon icon={MinusSignIcon} />
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button
                    aria-label="Add PNR"
                    variant="ghost"
                    className="p-2 h-auto rounded-full"
                    onClick={() => addPnr()}
                  >
                    <HugeiconsIcon icon={Add01Icon} />
                  </Button>
                </div>
              )}
            </div>

            {pnrsArray.fields.map((field, index) => (
              <div key={field.id}>
                <RowContainer>
                  <FormField
                    control={form.control}
                    name={`pnrs.${index}.airline`}
                    label={`Airline ${pnrsArray.fields.length > 1 ? index + 1 : ""}`}
                    render={({ field }) => (
                      <Input placeholder="LH" {...field} />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`pnrs.${index}.pnr`}
                    label={`PNR ${pnrsArray.fields.length > 1 ? index + 1 : ""}`}
                    render={({ field }) => (
                      <Input placeholder="123ABC" {...field} />
                    )}
                  />
                </RowContainer>
              </div>
            ))}
          </>
        )}

        <FormField
          control={form.control}
          name="price"
          label="Price"
          render={({ field }) => <AmountInput {...field} />}
        />
      </Form>
      <AmbiguousFlightDialog
        flightLegs={ambiguousDialogData.legs}
        flightChoices={ambiguousDialogData.choices}
        onSelection={handleAmbiguousFlightSelection}
        open={ambiguousDialogOpen}
        onOpenChange={setAmbiguousDialogOpen}
      />
      <DialogFooter>
        {edit ? (
          <Button
            form="flight-form"
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
              Delete
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
