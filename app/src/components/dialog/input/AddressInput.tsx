import { Search } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import type { Coordinates } from "@/types.ts"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { cn } from "@/lib/utils.ts"

export default function AddressInput({
  onChange,
  onBlur,
  value,
  disabled,
  name,
  ref,
  updateCoordinates,
  className,
}: ControllerRenderProps<FieldValues, string> & {
  updateCoordinates: (coordinates: Coordinates) => void
  className?: string
}) {
  const [isLoading, startTransition] = useTransition()

  async function searchForLocationUsingGeocodeApi() {
    const url = encodeURI("/api/v1/geocoding/location?query=" + value)
    const response = await fetch(url, { method: "POST" })

    if (response.ok) {
      const geocodeLocation = await response.json()
      onChange(geocodeLocation["label"])
      updateCoordinates(geocodeLocation)
    } else
      toast("Error looking up address", {
        description: await response.text(),
      })
  }

  function onClick() {
    startTransition(async () => await searchForLocationUsingGeocodeApi())
  }

  return (
    <div className={cn("", className)}>
      <div className="flex gap-2">
        <Input
          ref={ref}
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled || isLoading}
          data-1p-ignore
        />
        {!disabled && (
          <Button variant="secondary" onClick={onClick} disabled={isLoading}>
            {isLoading ? (
              <Spinner className="h-4 w-4" variant="pinwheel" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
