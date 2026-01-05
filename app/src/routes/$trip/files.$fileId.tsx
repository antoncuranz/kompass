import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  AirplaneTakeOff01Icon,
  Building03Icon,
  Cancel01Icon,
  Link01Icon,
  Location01Icon,
  Train01Icon,
} from "@hugeicons/core-free-icons"
import { useEffect, useState } from "react"
import type { ResolvedReference } from "@/lib/files"
import type { TransportationType } from "@/domain/transportation"
import Pane from "@/components/Pane.tsx"
import LinkDialog from "@/components/files/LinkDialog"
import FileViewer from "@/components/files/FileViewer"
import { useTrip } from "@/components/provider/TripProvider"
import { formatDateShort } from "@/lib/formatting"
import { downloadBlob, useReferencedItem } from "@/lib/files"
import { getTransportationTypeEmoji } from "@/domain/transportation"
import { useAttachmentMutations, useAttachmentQuery } from "@/repo"
import { useTripEntities } from "@/hooks/useTripEntities"

export const Route = createFileRoute("/$trip/files/$fileId")({
  component: FileDetailPage,
})

function FileDetailPage() {
  const { fileId } = Route.useParams()

  const trip = useTrip()
  const { attachment, loadAsBlob } = useAttachmentQuery(fileId)
  const { update } = useAttachmentMutations(trip.stid)
  const { activities, accommodation, transportation } = useTripEntities(
    trip.stid,
  )

  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [showEntitySelector, setShowEntitySelector] = useState(false)

  const hasLinkableItems =
    activities.length > 0 ||
    accommodation.length > 0 ||
    transportation.length > 0

  useEffect(() => {
    let currentBlobUrl: string | null = null

    async function loadFile() {
      if (!attachment.$isLoaded) return
      try {
        const blob = await loadAsBlob()
        if (blob) {
          currentBlobUrl = URL.createObjectURL(blob)
          setBlobUrl(currentBlobUrl)
        }
      } catch (error) {
        console.error("Failed to load file:", error)
      }
    }

    void loadFile()

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl)
      }
    }
  }, [attachment])

  function handleDownload() {
    if (blobUrl && attachment.$isLoaded) {
      downloadBlob(blobUrl, attachment.name)
    }
  }

  if (!attachment.$isLoaded) {
    return (
      <Pane title="Loading..." testId="file-detail-card">
        <div className="text-center text-muted-foreground py-8">
          Loading file...
        </div>
      </Pane>
    )
  }

  async function handleRemoveLink(refId: string) {
    if (attachment.$isLoaded) {
      await update(attachment.id, {
        references: attachment.references.filter(id => id !== refId),
      })
    }
  }

  return (
    <>
      <Pane title={attachment.name} testId="file-detail-card">
        <div className="h-full flex flex-col overflow-hidden">
          <FileViewer
            fileUrl={blobUrl}
            fileName={attachment.name}
            onDownload={handleDownload}
          />

          <div className="border-t p-2">
            <div className="flex items-center gap-2 flex-wrap">
              <HugeiconsIcon
                icon={Link01Icon}
                className="text-muted-foreground"
              />
              {attachment.references.length > 0 ? (
                attachment.references.map((refId, idx) => (
                  <LinkedItemChip
                    key={idx}
                    refId={refId}
                    onRemove={() => handleRemoveLink(refId)}
                  />
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No linked items
                </span>
              )}
              {hasLinkableItems && (
                <button
                  onClick={() => setShowEntitySelector(true)}
                  className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Add01Icon} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Pane>

      <LinkDialog
        attachment={attachment}
        open={showEntitySelector}
        onOpenChange={setShowEntitySelector}
      />
    </>
  )
}

function LinkedItemChip({
  refId,
  onRemove,
}: {
  refId: string
  onRemove: () => void
}) {
  const item = useReferencedItem(refId)

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-sm">
      {!item ? (
        <span className="text-muted-foreground">Loading...</span>
      ) : (
        <>
          <TransportationIcon
            type={item.type}
            transportationType={item.transportationType}
          />
          <span className="max-w-[150px] truncate">{item.name}</span>
          <span className="text-muted-foreground text-xs">
            {formatDateShort(item.date)}
          </span>
          <button
            onClick={onRemove}
            className="ml-0.5 p-0.5 rounded-full hover:bg-card transition-colors cursor-pointer"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={12}
              className="text-muted-foreground"
            />
          </button>
        </>
      )}
    </div>
  )
}

export function TransportationIcon({
  type,
  transportationType,
  className = "w-3.5 h-3.5 text-muted-foreground",
}: {
  type: ResolvedReference["type"]
  transportationType?: TransportationType
  className?: string
}) {
  switch (type) {
    case "activity":
      return <HugeiconsIcon icon={Location01Icon} className={className} />
    case "accommodation":
      return <HugeiconsIcon icon={Building03Icon} className={className} />
    case "transportation": {
      if (transportationType === "flight") {
        return (
          <HugeiconsIcon icon={AirplaneTakeOff01Icon} className={className} />
        )
      }
      if (transportationType === "train") {
        return <HugeiconsIcon icon={Train01Icon} className={className} />
      }
      if (transportationType) {
        return (
          <span className="text-xs">
            {getTransportationTypeEmoji(transportationType)}
          </span>
        )
      }
      return (
        <HugeiconsIcon icon={AirplaneTakeOff01Icon} className={className} />
      )
    }
  }
}
