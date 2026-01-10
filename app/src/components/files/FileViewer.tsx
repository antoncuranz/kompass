import { useResizeObserver } from "@wojtekmaj/react-hooks"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download01Icon,
  FileAttachmentIcon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { useCallback, useEffect, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

const MIN_SCALE = 1
const SCALE_STEP = 0.5

function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
}: {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
}) {
  return (
    <>
      {/* Mobile: fixed FAB */}
      <div className="fixed bottom-6 right-6 flex gap-2 z-50 sm:hidden">
        <Button
          variant="secondary"
          size="fab"
          onClick={onZoomOut}
          disabled={scale <= MIN_SCALE}
          aria-label="Zoom out"
        >
          <HugeiconsIcon icon={MinusSignIcon} />
        </Button>
        <Button
          variant="secondary"
          size="fab"
          onClick={onZoomIn}
          aria-label="Zoom in"
        >
          <HugeiconsIcon icon={PlusSignIcon} />
        </Button>
      </div>
      {/* Desktop: absolute within viewer */}
      <div className="hidden sm:flex absolute bottom-4 right-4 gap-2 z-10">
        <Button
          variant="secondary"
          size="icon-round"
          onClick={onZoomOut}
          disabled={scale <= MIN_SCALE}
          aria-label="Zoom out"
        >
          <HugeiconsIcon icon={MinusSignIcon} />
        </Button>
        <Button
          variant="secondary"
          size="icon-round"
          onClick={onZoomIn}
          aria-label="Zoom in"
        >
          <HugeiconsIcon icon={PlusSignIcon} />
        </Button>
      </div>
    </>
  )
}

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
  const [scale, setScale] = useState(1)

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
    setScale(1)
  }, [fileUrl])

  const zoomIn = useCallback(() => {
    setScale(s => s + SCALE_STEP)
  }, [])

  const zoomOut = useCallback(() => {
    setScale(s => Math.max(MIN_SCALE, s - SCALE_STEP))
  }, [])

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
      <div className="relative flex flex-col h-full min-h-0">
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
                  width={containerWidth ? containerWidth * scale : undefined}
                />
              ))}
            </div>
          </Document>
        </div>
        <ZoomControls scale={scale} onZoomIn={zoomIn} onZoomOut={zoomOut} />
      </div>
    )
  }

  if (isImage) {
    return (
      <div className="relative flex items-center justify-center h-full overflow-auto">
        <img
          src={fileUrl}
          alt={fileName}
          className="object-contain"
          style={{
            maxWidth: scale === 1 ? "100%" : "none",
            maxHeight: scale === 1 ? "100%" : "none",
            transform: `scale(${scale})`,
            transformOrigin: "center",
          }}
        />
        <ZoomControls scale={scale} onZoomIn={zoomIn} onZoomOut={zoomOut} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
      <HugeiconsIcon
        icon={FileAttachmentIcon}
        size={64}
        className="text-muted-foreground"
      />
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
