import { createFileRoute } from "@tanstack/react-router"
import { co } from "jazz-tools"
import { useCoState } from "jazz-tools/react"
import { useEffect, useState } from "react"
import Card from "@/components/card/Card.tsx"
import FileViewer from "@/components/files/FileViewer"
import { FileAttachment } from "@/schema"

export const Route = createFileRoute("/$trip/files/$fileId")({
  component: FileDetailPage,
})

function FileDetailPage() {
  const { fileId } = Route.useParams()
  const file = useCoState(FileAttachment, fileId, { resolve: { file: true } })
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

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
  }, [file?.$isLoaded, file?.$isLoaded ? file.file.$jazz.id : null])

  function handleDownload() {
    if (blobUrl && file?.$isLoaded) {
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
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

  return (
    <Card title={file.name} testId="file-detail-card">
      <div className="h-full flex flex-col overflow-hidden">
        <FileViewer
          fileUrl={blobUrl}
          fileName={file.name}
          onDownload={handleDownload}
        />
      </div>
    </Card>
  )
}
