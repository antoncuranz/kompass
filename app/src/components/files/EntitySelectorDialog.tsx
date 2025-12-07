import type { co } from "jazz-tools"
import { Building2, Link as LinkIcon, MapPin, Plane, Train } from "lucide-react"
import { Dialog, useDialogContext } from "@/components/dialog/Dialog.tsx"
import { useTransportation } from "@/components/provider/TripProvider"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateShort } from "@/components/util.ts"
import { getDepartureDateTime, getTransportationShortName } from "@/lib/utils"
import type { FileAttachment, Transportation, Trip } from "@/schema"
import { getTransportationTypeEmoji } from "@/types"

export default function EntitySelectorDialog({
  trip,
  file,
  open,
  onOpenChange,
}: {
  trip: co.loaded<typeof Trip>
  file: co.loaded<typeof FileAttachment>
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EntitySelectorContent trip={trip} file={file} />
    </Dialog>
  )
}

function EntitySelectorContent({
  trip,
  file,
}: {
  trip: co.loaded<typeof Trip>
  file: co.loaded<typeof FileAttachment>
}) {
  const transportation = useTransportation()
  const { onClose } = useDialogContext()

  const existingRefs = new Set(file.references)

  function handleSelect(entityId: string) {
    if (!existingRefs.has(entityId)) {
      file.references.$jazz.push(entityId)
    }
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Link to...</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="activity" className="px-4">
        <TabsList className="w-full">
          <TabsTrigger value="activity">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Activities</span>
          </TabsTrigger>
          <TabsTrigger value="accommodation">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Accommodation</span>
          </TabsTrigger>
          <TabsTrigger value="transportation">
            <Plane className="w-4 h-4" />
            <span className="hidden sm:inline">Transport</span>
          </TabsTrigger>
        </TabsList>

        <div className="overflow-y-auto min-h-[200px] max-h-[300px] py-2">
          <TabsContent value="activity">
            <ActivityList
              activities={trip.activities}
              existingRefs={existingRefs}
              onSelect={handleSelect}
            />
          </TabsContent>
          <TabsContent value="accommodation">
            <AccommodationList
              accommodation={trip.accommodation}
              existingRefs={existingRefs}
              onSelect={handleSelect}
            />
          </TabsContent>
          <TabsContent value="transportation">
            <TransportationList
              transportation={transportation}
              existingRefs={existingRefs}
              onSelect={handleSelect}
            />
          </TabsContent>
        </div>
      </Tabs>

      <DialogFooter>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onClose()}
        >
          Cancel
        </Button>
      </DialogFooter>
    </>
  )
}

function ActivityList({
  activities,
  existingRefs,
  onSelect,
}: {
  activities: co.loaded<typeof Trip>["activities"]
  existingRefs: Set<string>
  onSelect: (id: string) => void
}) {
  const sorted = [...activities].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No activities found
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sorted.map(activity => {
        const isLinked = existingRefs.has(activity.$jazz.id)
        return (
          <EntityRow
            key={activity.$jazz.id}
            icon={<MapPin className="w-4 h-4" />}
            name={activity.name}
            date={formatDateShort(activity.date)}
            isLinked={isLinked}
            onSelect={() => onSelect(activity.$jazz.id)}
          />
        )
      })}
    </div>
  )
}

function AccommodationList({
  accommodation,
  existingRefs,
  onSelect,
}: {
  accommodation: co.loaded<typeof Trip>["accommodation"]
  existingRefs: Set<string>
  onSelect: (id: string) => void
}) {
  const sorted = [...accommodation].sort(
    (a, b) =>
      new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No accommodation found
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sorted.map(acc => {
        const isLinked = existingRefs.has(acc.$jazz.id)
        return (
          <EntityRow
            key={acc.$jazz.id}
            icon={<Building2 className="w-4 h-4" />}
            name={acc.name}
            date={`${formatDateShort(acc.arrivalDate)} - ${formatDateShort(acc.departureDate)}`}
            isLinked={isLinked}
            onSelect={() => onSelect(acc.$jazz.id)}
          />
        )
      })}
    </div>
  )
}

function TransportationList({
  transportation,
  existingRefs,
  onSelect,
}: {
  transportation: Array<Transportation>
  existingRefs: Set<string>
  onSelect: (id: string) => void
}) {
  const getIcon = (t: Transportation) => {
    switch (t.type) {
      case "flight":
        return <Plane className="w-4 h-4" />
      case "train":
        return <Train className="w-4 h-4" />
      case "generic":
        return (
          <span className="text-sm">
            {getTransportationTypeEmoji(t.genericType)}
          </span>
        )
    }
  }

  const sorted = [...transportation].sort(
    (a, b) =>
      new Date(getDepartureDateTime(a)).getTime() -
      new Date(getDepartureDateTime(b)).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No transportation found
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sorted.map(t => {
        const isLinked = existingRefs.has(t.$jazz.id)
        return (
          <EntityRow
            key={t.$jazz.id}
            icon={getIcon(t)}
            name={getTransportationShortName(t)}
            date={formatDateShort(getDepartureDateTime(t).substring(0, 10))}
            isLinked={isLinked}
            onSelect={() => onSelect(t.$jazz.id)}
          />
        )
      })}
    </div>
  )
}

function EntityRow({
  icon,
  name,
  date,
  isLinked,
  onSelect,
}: {
  icon: React.ReactNode
  name: string
  date: string
  isLinked: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      disabled={isLinked}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isLinked
          ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
          : "hover:bg-muted cursor-pointer"
      }`}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 truncate">{name}</span>
      <span className="text-sm text-muted-foreground shrink-0">{date}</span>
      {isLinked && <LinkIcon className="w-4 h-4 text-muted-foreground" />}
    </button>
  )
}
