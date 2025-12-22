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
      variant="secondary"
      size="icon-round"
      onClick={handleShare}
      aria-label="Copy Link"
    >
      <HugeiconsIcon icon={Share01Icon} />
    </Button>
  )
}
