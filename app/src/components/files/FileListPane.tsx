import { Link } from "@tanstack/react-router"
import { co } from "jazz-tools"
import { File as FileIcon, Link as LinkIcon, Plus, Upload } from "lucide-react"
import { useRef } from "react"
import { toast } from "sonner"
import { Route } from "@/routes/$trip/files"
import Pane from "@/components/Pane.tsx"
import { useTrip } from "@/components/provider/TripProvider"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { FileAttachment } from "@/schema"

export default function FileListPane() {
  const sharedTripId = Route.useParams().trip
  const trip = useTrip()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasFiles = trip.files.length > 0

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        const fileStream = await co.fileStream().createFromBlob(file, {
          owner: trip.$jazz.owner,
        })

        const attachment = FileAttachment.create(
          {
            name: file.name,
            file: fileStream,
            references: [],
          },
          trip.$jazz.owner,
        )

        trip.files.$jazz.push(attachment)
        toast.success(`Uploaded "${file.name}"`)
      } catch (error) {
        toast.error(`Failed to upload "${file.name}"`)
        console.error(error)
      }
    }

    // Reset input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function triggerFileUpload() {
    fileInputRef.current?.click()
  }

  return (
    <>
      <Pane
        title="Trip Files"
        testId="files-card"
        headerSlot={
          <Button
            size="sm"
            className="h-8 gap-1 mt-0 ml-1 self-end"
            onClick={triggerFileUpload}
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Upload File
            </span>
          </Button>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
        {hasFiles ? (
          <Table className="table-fixed">
            <TableBody>
              {trip.files.map(file => (
                <TableRow key={file.$jazz.id} className="cursor-pointer">
                  <TableCell className="p-0">
                    <Link
                      to="/$trip/files/$fileId"
                      params={{ trip: sharedTripId, fileId: file.$jazz.id }}
                      className="flex items-center gap-3 w-full py-2 pl-3 pr-4"
                    >
                      <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{file.name}</span>
                      {file.references.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <LinkIcon className="h-3 w-3" />
                          {file.references.length}
                        </span>
                      )}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No files attached to this trip
          </div>
        )}
      </Pane>
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <Button
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={triggerFileUpload}
        >
          <Plus className="size-6" />
        </Button>
      </div>
    </>
  )
}
