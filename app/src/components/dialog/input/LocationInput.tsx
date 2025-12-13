import { Map } from "lucide-react"
import { useState } from "react"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import type { Coordinates } from "@/types.ts"
import MapDialog from "@/components/dialog/MapDialog"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { cn } from "@/lib/utils"

export default function LocationInput({
  onChange,
  onBlur,
  value,
  disabled,
  className,
}: ControllerRenderProps<FieldValues, string> & {
  className?: string
}) {
  const [mapDialogOpen, setMapDialogOpen] = useState(false)

  function onMapDialogClose(newLocation: Coordinates) {
    onChange(newLocation)
    onBlur()
  }

  return (
    <div className={cn("", className)}>
      <div className="flex gap-2">
        <Input
          value={value?.longitude ?? ""}
          disabled={true}
          placeholder="Longitude"
        />
        <Input
          value={value?.latitude ?? ""}
          disabled={true}
          placeholder="Latitude"
        />
        {!disabled && (
          <Button variant="secondary" onClick={() => setMapDialogOpen(true)}>
            <Map className="h-4 w-4" />
          </Button>
        )}
      </div>
      <MapDialog
        value={value}
        onChange={onMapDialogClose}
        open={mapDialogOpen}
        onOpenChange={setMapDialogOpen}
      />
    </div>
  )
}
