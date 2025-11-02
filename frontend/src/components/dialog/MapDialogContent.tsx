import { useDialogContext } from "@/components/dialog/Dialog.tsx"
import MiniMap from "@/components/map/MiniMap.tsx"
import { Button } from "@/components/ui/button.tsx"
import { DialogTitle } from "@/components/ui/dialog.tsx"
import { Coordinates } from "@/types.ts"
import { useState } from "react"

export default function MapDialogContent({
  value,
  onChange,
}: {
  value: Coordinates
  onChange: (newLocation: Coordinates) => void
}) {
  const { onClose } = useDialogContext()
  const [coordinates, setCoordinates] = useState<Coordinates>(value)

  function onClick() {
    onChange(coordinates)
    onClose(false)
  }

  return (
    <>
      <DialogTitle className="hidden">Map Dialog</DialogTitle>
      <div className="h-160 max-h-full rounded-2xl overflow-hidden">
        <MiniMap value={coordinates} onChange={setCoordinates}>
          {coordinates && (
            <div className="p-4 absolute bottom-0 w-full">
              <Button className="w-full" onClick={() => onClick()}>
                Select Location
              </Button>
            </div>
          )}
        </MiniMap>
      </div>
    </>
  )
}
