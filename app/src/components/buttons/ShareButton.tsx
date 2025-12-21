import { HugeiconsIcon } from "@hugeicons/react"
import { Share01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button.tsx"

export default function ShareButton({
  sharedTripId,
}: {
  sharedTripId: string
}) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/${sharedTripId}`
    void navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  return (
    <Button
      size="sm"
      className="h-8 gap-1 mt-0 ml-1 self-end"
      onClick={handleShare}
    >
      <HugeiconsIcon icon={Share01Icon} size={14} /> Copy Link
    </Button>
  )
}
