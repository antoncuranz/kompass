import { useRef, useState } from "react"
import { toast } from "sonner"
import { Camera, X } from "lucide-react"
import type { ChangeEvent } from "react"
import { Avatar } from "@/components/Avatar"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageUpload({
  onFileSelect,
  accountId,
  className,
}: {
  onFileSelect: (file: File | null) => void
  accountId?: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]

    if (!file) {
      setSelectedFile(null)
      onFileSelect(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image too large (max 5MB)")
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleDelete = () => {
    setSelectedFile(null)
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    onFileSelect(null)
  }

  const hasImage = !!previewUrl

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative w-24 h-24">
        <div className="relative flex items-center justify-center rounded-full bg-muted overflow-hidden h-24 w-24 text-2xl">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <Avatar accountId={accountId} className="h-24 w-24 text-2xl" />
          )}
        </div>
        <div
          className="absolute bottom-0 right-0 bg-card rounded-full p-2 cursor-pointer flex items-center justify-center shadow-lg shadow-black/2 dark:shadow-white/4"
          onClick={hasImage ? handleDelete : handleClick}
        >
          {hasImage ? (
            <X className="h-4 w-4" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </div>
      </div>
      <input
        id="profile-image"
        name="profile-image"
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/gif, image/bmp"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  )
}
