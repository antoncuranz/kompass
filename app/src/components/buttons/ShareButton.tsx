import { Share2 } from "lucide-react"
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
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  return (
    <Button
      size="sm"
      className="h-8 gap-1 mt-0 ml-1 self-end"
      onClick={handleShare}
    >
      <Share2 size="sm" className="h-3.5 w-3.5" /> Copy Link
    </Button>
  )
}
