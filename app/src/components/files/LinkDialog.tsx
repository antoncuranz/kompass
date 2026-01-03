import { HugeiconsIcon } from "@hugeicons/react"
import {
  AirplaneTakeOff01Icon,
  Building03Icon,
  Link01Icon,
  Location01Icon,
  Train01Icon,
} from "@hugeicons/core-free-icons"
import { useTrip } from "../provider/TripProvider"
import type {
  Accommodation,
  Activity,
  FileAttachment,
  Transportation,
} from "@/domain"
import { Dialog, useDialogContext } from "@/components/dialog/Dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateShort } from "@/lib/datetime-utils"
import { getTransportationTypeEmoji } from "@/types"
import { getDepartureDateTime, getTransportationShortName } from "@/domain"
import {
  useAccommodationRepo,
  useActivityRepo,
  useTransportation,
} from "@/repo"

export default function LinkDialog({
  file,
  open,
  onOpenChange,
}: {
  file: FileAttachment
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <LinkDialogContent file={file} />
    </Dialog>
  )
}

function LinkDialogContent({ file }: { file: FileAttachment }) {
  const trip = useTrip()
  const { activities } = useActivityRepo(trip.stid)
  const { accommodation } = useAccommodationRepo(trip.stid)
  const { transportation } = useTransportation(trip.stid)
  const { onClose } = useDialogContext()

  const existingRefs = new Set(file.references)

  const hasActivities = activities.length > 0
  const hasAccommodation = accommodation.length > 0
  const hasTransportation = transportation.length > 0

  const defaultTab = hasActivities
    ? "activity"
    : hasAccommodation
      ? "accommodation"
      : "transportation"

  function handleSelect(entityId: string) {
    if (!existingRefs.has(entityId)) {
      // file.references.$jazz.push(entityId)
      alert("fixme")
    }
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Link to...</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue={defaultTab} className="px-3">
        <TabsList className="w-full">
          {hasActivities && (
            <TabsTrigger value="activity">
              <HugeiconsIcon icon={Location01Icon} />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
          )}
          {hasAccommodation && (
            <TabsTrigger value="accommodation">
              <HugeiconsIcon icon={Building03Icon} />
              <span className="hidden sm:inline">Accommodation</span>
            </TabsTrigger>
          )}
          {hasTransportation && (
            <TabsTrigger value="transportation">
              <HugeiconsIcon icon={AirplaneTakeOff01Icon} />
              <span className="hidden sm:inline">Transport</span>
            </TabsTrigger>
          )}
        </TabsList>

        <div className="overflow-y-auto min-h-[200px] max-h-[300px] py-2">
          {hasActivities && (
            <TabsContent value="activity">
              <ActivityList
                activities={activities}
                existingRefs={existingRefs}
                onSelect={handleSelect}
              />
            </TabsContent>
          )}
          {hasAccommodation && (
            <TabsContent value="accommodation">
              <AccommodationList
                accommodation={accommodation}
                existingRefs={existingRefs}
                onSelect={handleSelect}
              />
            </TabsContent>
          )}
          {hasTransportation && (
            <TabsContent value="transportation">
              <TransportationList
                transportation={transportation}
                existingRefs={existingRefs}
                onSelect={handleSelect}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>

      <DialogFooter>
        <Button
          variant="secondary"
          size="round"
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
  activities: Array<Activity>
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
        const isLinked = existingRefs.has(activity.id)
        return (
          <EntityRow
            key={activity.id}
            icon={<HugeiconsIcon icon={Location01Icon} />}
            name={activity.name}
            date={formatDateShort(activity.date)}
            isLinked={isLinked}
            onSelect={() => onSelect(activity.id)}
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
  accommodation: Array<Accommodation>
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
        const isLinked = existingRefs.has(acc.id)
        return (
          <EntityRow
            key={acc.id}
            icon={<HugeiconsIcon icon={Building03Icon} />}
            name={acc.name}
            date={`${formatDateShort(acc.arrivalDate)} - ${formatDateShort(acc.departureDate)}`}
            isLinked={isLinked}
            onSelect={() => onSelect(acc.id)}
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
        return <HugeiconsIcon icon={AirplaneTakeOff01Icon} />
      case "train":
        return <HugeiconsIcon icon={Train01Icon} />
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
        const isLinked = existingRefs.has(t.id)
        return (
          <EntityRow
            key={t.id}
            icon={getIcon(t)}
            name={getTransportationShortName(t)}
            date={formatDateShort(getDepartureDateTime(t).substring(0, 10))}
            isLinked={isLinked}
            onSelect={() => onSelect(t.id)}
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
      {isLinked && (
        <HugeiconsIcon icon={Link01Icon} className="text-muted-foreground" />
      )}
    </button>
  )
}
