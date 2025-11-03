"use client"

import { Button } from "@/components/ui/button.tsx"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

export default function ShareButton({
  sharedTripId,
  className,
}: {
  sharedTripId: string
  className?: string
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
      variant="secondary"
      size="icon"
      className={className}
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
    </Button>
  )
}
