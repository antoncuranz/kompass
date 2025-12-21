import { useResizeObserver } from "@wojtekmaj/react-hooks"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, FileAttachmentIcon } from "@hugeicons/core-free-icons"
import { useCallback, useEffect, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

export default function FileViewer({
  fileUrl,
  fileName,
  onDownload,
}: {
  fileUrl: string | null
  fileName: string
  onDownload?: () => void
}) {
  const [numPages, setNumPages] = useState<number>(0)
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>()

  const handleContainerRef = useCallback((node: HTMLElement | null) => {
    setContainerRef(node)
    if (node) {
      setContainerWidth(node.clientWidth)
    }
  }, [])

  const onResize = useCallback<ResizeObserverCallback>(entries => {
    const [entry] = entries
    setContainerWidth(entry.contentRect.width)
  }, [])

  useResizeObserver(containerRef, {}, onResize)

  useEffect(() => {
    setNumPages(0)
  }, [fileUrl])

  const isPdf = fileName.toLowerCase().endsWith(".pdf")
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName.toLowerCase())

  if (!fileUrl) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading file content...
      </div>
    )
  }

  if (isPdf) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-auto" ref={handleContainerRef}>
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <div className="flex flex-col gap-4">
              {Array.from({ length: numPages }, (_, index) => (
                <Page
                  key={index + 1}
                  pageNumber={index + 1}
                  width={containerWidth}
                />
              ))}
            </div>
          </Document>
        </div>
      </div>
    )
  }

  if (isImage) {
    return (
      <div className="flex items-center justify-center h-full">
        <img
          src={fileUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
      <HugeiconsIcon icon={FileAttachmentIcon} size={64} className="text-muted-foreground" />
      <p className="text-muted-foreground">
        Preview not available for this file type
      </p>
      {onDownload && (
        <Button onClick={onDownload}>
          <HugeiconsIcon icon={Download01Icon} className="mr-2" />
          Download {fileName}
        </Button>
      )}
    </div>
  )
}
