import { useResizeObserver } from "@wojtekmaj/react-hooks"
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react"
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
  const [pageNumber, setPageNumber] = useState(1)
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
    if (entry) {
      setContainerWidth(entry.contentRect.width)
    }
  }, [])

  useResizeObserver(containerRef, {}, onResize)

  useEffect(() => {
    setPageNumber(1)
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
            <Page pageNumber={pageNumber} width={containerWidth} />
          </Document>
        </div>
        {numPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-3 border-t shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
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
      <FileText className="h-16 w-16 text-muted-foreground" />
      <p className="text-muted-foreground">
        Preview not available for this file type
      </p>
      {onDownload && (
        <Button onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download {fileName}
        </Button>
      )}
    </div>
  )
}
