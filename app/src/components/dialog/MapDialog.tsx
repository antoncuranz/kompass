import { useState } from "react"
import type { Coordinates } from "@/types.ts"
import { Dialog, useDialogContext } from "@/components/dialog/Dialog.tsx"
import MiniMap from "@/components/map/MiniMap.tsx"
import { Button } from "@/components/ui/button.tsx"
import { DialogTitle } from "@/components/ui/dialog.tsx"

export default function MapDialog({
  value,
  onChange,
  open,
  onOpenChange,
}: {
  value: Coordinates
  onChange: (newLocation: Coordinates) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MapDialogContent value={value} onChange={onChange} />
    </Dialog>
  )
}

function MapDialogContent({
  value,
  onChange,
}: {
  value: Coordinates
  onChange: (newLocation: Coordinates) => void
}) {
  const { onClose } = useDialogContext()
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>(value)

  function onSelect() {
    if (coordinates) {
      onChange(coordinates)
      onClose(false)
    }
  }

  return (
    <>
      <DialogTitle className="hidden">Map Dialog</DialogTitle>
      <div className="h-160 max-h-full rounded-xl overflow-hidden">
        <MiniMap value={coordinates} onChange={setCoordinates}>
          {coordinates && (
            <div className="p-4 absolute bottom-0 w-full">
              <Button className="w-full" onClick={() => onSelect()}>
                Select Location
              </Button>
            </div>
          )}
        </MiniMap>
      </div>
    </>
  )
}
