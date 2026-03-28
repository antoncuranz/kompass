import { HugeiconsIcon } from "@hugeicons/react"
import { Share01Icon } from "@hugeicons/core-free-icons"
import { usePostHog } from "posthog-js/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button.tsx"

export default function ShareButton({ stid }: { stid: string }) {
  const posthog = usePostHog()

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/${stid}`
    void navigator.clipboard.writeText(url)
    posthog.capture("trip_link_copied", { stid })
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
