import { useState } from "react"
import type { AmbiguousFlightChoice } from "@/types.ts"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Field, FieldLabel } from "@/components/ui/field.tsx"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx"
import { formatDateShort } from "@/components/util.ts"

export function AmbiguousFlightDialogContent({
  flightChoices,
  flightLegs,
  onSelection,
}: {
  flightChoices: { [flightNumber: string]: Array<AmbiguousFlightChoice> }
  flightLegs: Array<{ date: string; flightNumber: string }>
  onSelection: (selectedFlights: Map<number, AmbiguousFlightChoice>) => void
}) {
  const [selectedChoices, setSelectedChoices] = useState(
    new Map<number, number>(),
  )

  const ambiguousFlightLegs = flightLegs
    .map((leg, idx) => ({ ...leg, legIdx: idx }))
    .filter(leg => leg.flightNumber in flightChoices)

  const handleSelectionChange = (legId: number, choiceIdx: number) => {
    setSelectedChoices(prev => new Map(prev).set(legId, choiceIdx))
  }

  const handleConfirm = () => {
    const finalChoices = new Map<number, AmbiguousFlightChoice>()

    selectedChoices.forEach((choiceIdx, legIdx) => {
      const flightNumber = flightLegs[legIdx].flightNumber
      finalChoices.set(legIdx, flightChoices[flightNumber][choiceIdx])
    })

    onSelection(finalChoices)
  }

  const canConfirm = ambiguousFlightLegs.every(
    leg => selectedChoices.get(leg.legIdx) !== undefined,
  )

  const formatDateTime = (dateTime: string) => {
    const formatted = new Date(dateTime).toLocaleString()
    return formatted.substring(0, formatted.length - 3) // remove seconds
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Multiple Flights Found</DialogTitle>
        <DialogDescription>
          Multiple flights were found for the flight numbers you entered. Please
          select the specific flight for each leg.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 overflow-y-auto space-y-2 [&>div]:px-4">
        {ambiguousFlightLegs.map(({ legIdx, ...leg }) => {
          const choices = flightChoices[leg.flightNumber]
          const legLabel = flightLegs.length > 1 ? ` (Leg ${legIdx + 1})` : ""

          return (
            <div key={legIdx} className="space-y-3">
              <h3 className="font-semibold">
                Flight {leg.flightNumber}
                {legLabel}
              </h3>
              <p className="text-sm text-muted-foreground">
                Date: {formatDateShort(leg.date)}
              </p>

              <Field>
                <RadioGroup
                  value={selectedChoices.get(legIdx) ?? -1}
                  onValueChange={value =>
                    handleSelectionChange(legIdx, value as number)
                  }
                >
                  {choices.map((choice, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <FieldLabel
                        htmlFor={`${legIdx}-choice-${idx}`}
                        className="flex flex-1 cursor-pointer rounded-md border p-3 hover:bg-muted/50"
                      >
                        <RadioGroupItem
                          value={idx.toString()}
                          id={`${legIdx}-choice-${idx}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {choice.originIata} → {choice.destinationIata}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(choice.departureDateTime)}
                            </span>
                          </div>
                        </div>
                      </FieldLabel>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
            </div>
          )
        })}
      </div>

      <DialogFooter>
        <Button
          className="w-full text-base"
          onClick={handleConfirm}
          disabled={!canConfirm}
        >
          Confirm Selection
        </Button>
      </DialogFooter>
    </>
  )
}
