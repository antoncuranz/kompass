import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  File01Icon,
  Link01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
import { useRef } from "react"
import { toast } from "sonner"
import Pane from "@/components/Pane.tsx"
import { useTrip } from "@/components/provider/TripProvider"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useAttachmentRepo } from "@/repo"

export default function FileListPane() {
  const trip = useTrip()
  const { attachments, create } = useAttachmentRepo(trip.stid)

  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        await create({
          name: file.name,
          file,
          references: [],
        })
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
        title="File Attachments"
        testId="files-card"
        rightSlot={
          <Button
            variant="secondary"
            size="icon-round"
            onClick={triggerFileUpload}
          >
            <HugeiconsIcon icon={Upload01Icon} size={14} />
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
        {attachments.length > 0 ? (
          <Table className="table-fixed">
            <TableBody>
              {attachments.map(file => (
                <TableRow key={file.id} className="cursor-pointer">
                  <TableCell className="p-0">
                    <Link
                      to={"/" + trip.stid + "/files/" + file.id}
                      className="flex items-center gap-3 w-full py-2 pl-3 pr-4"
                    >
                      <HugeiconsIcon
                        icon={File01Icon}
                        size={20}
                        className="text-muted-foreground shrink-0"
                      />
                      <span className="truncate flex-1">{file.name}</span>
                      {file.references.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <HugeiconsIcon icon={Link01Icon} size={12} />
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
          <HugeiconsIcon icon={Add01Icon} size={24} />
        </Button>
      </div>
    </>
  )
}
