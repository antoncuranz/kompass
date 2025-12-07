import { createFileRoute } from "@tanstack/react-router"
import { co } from "jazz-tools"
import { useCoState } from "jazz-tools/react"
import {
  Building2,
  Link as LinkIcon,
  MapPin,
  Plane,
  Plus,
  Train,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import Card from "@/components/card/Card.tsx"
import EntitySelectorDialog from "@/components/files/EntitySelectorDialog"
import FileViewer from "@/components/files/FileViewer"
import { useTrip } from "@/components/provider/TripProvider"
import { formatDateShort } from "@/components/util"
import type { ResolvedReference } from "@/lib/file-utils"
import { useReferencedItem } from "@/lib/file-utils"
import { downloadBlob } from "@/lib/utils"
import type { Trip } from "@/schema"
import { FileAttachment } from "@/schema"
import { getTransportationTypeEmoji } from "@/types"

export const Route = createFileRoute("/$trip/files/$fileId")({
  component: FileDetailPage,
})

function FileDetailPage() {
  const { fileId } = Route.useParams()
  const trip = useTrip()
  const file = useCoState(FileAttachment, fileId, {
    resolve: { file: true, references: true },
  })
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [showEntitySelector, setShowEntitySelector] = useState(false)

  useEffect(() => {
    async function loadFile() {
      if (!file?.$isLoaded) return
      try {
        const blob = await co.fileStream().loadAsBlob(file.file.$jazz.id)
        if (blob) {
          const url = URL.createObjectURL(blob)
          setBlobUrl(url)
        }
      } catch (error) {
        console.error("Failed to load file:", error)
      }
    }

    loadFile()

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [file.$isLoaded, file.$isLoaded ? file.file.$jazz.id : null])

  function handleDownload() {
    if (blobUrl && file.$isLoaded) {
      downloadBlob(blobUrl, file.name)
    }
  }

  if (!file?.$isLoaded) {
    return (
      <Card title="Loading..." testId="file-detail-card">
        <div className="text-center text-muted-foreground py-8">
          Loading file...
        </div>
      </Card>
    )
  }

  function handleRemoveLink(refId: string) {
    if (file.$isLoaded && file.references.$isLoaded) {
      file.references.$jazz.remove(ref => ref === refId)
    }
  }

  return (
    <>
      <Card title={file.name} testId="file-detail-card">
        <div className="h-full flex flex-col overflow-hidden">
          <FileViewer
            fileUrl={blobUrl}
            fileName={file.name}
            onDownload={handleDownload}
          />

          <div className="border-t mt-4 pt-3 px-4 pb-4 sm:px-1 sm:pb-0">
            <div className="flex items-center gap-2 flex-wrap">
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
              {file.references.length > 0 ? (
                file.references.map((refId, idx) => (
                  <LinkedItemChip
                    key={idx}
                    trip={trip}
                    refId={refId}
                    onRemove={() => handleRemoveLink(refId)}
                  />
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No linked items
                </span>
              )}
              <button
                onClick={() => setShowEntitySelector(true)}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <EntitySelectorDialog
        trip={trip}
        file={file}
        open={showEntitySelector}
        onOpenChange={setShowEntitySelector}
      />
    </>
  )
}

function LinkedItemChip({
  trip,
  refId,
  onRemove,
}: {
  trip: co.loaded<typeof Trip>
  refId: string
  onRemove: () => void
}) {
  const item = useReferencedItem(trip, refId)

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
            className="ml-0.5 p-0.5 rounded-full hover:bg-background transition-colors cursor-pointer"
          >
            <X className="w-3 h-3 text-muted-foreground" />
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
  transportationType?: string
  className?: string
}) {
  switch (type) {
    case "activity":
      return <MapPin className={className} />
    case "accommodation":
      return <Building2 className={className} />
    case "transportation": {
      if (transportationType === "flight") {
        return <Plane className={className} />
      }
      if (transportationType === "train") {
        return <Train className={className} />
      }
      if (transportationType) {
        return (
          <span className="text-xs">
            {getTransportationTypeEmoji(transportationType)}
          </span>
        )
      }
      return <Plane className={className} />
    }
  }
}
