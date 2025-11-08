import { Pencil, Search } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { cn } from "@/lib/utils.ts"

export default function TrainStationInput({
  onChange,
  onBlur,
  value,
  disabled,
  name,
  ref,
  placeholder,
  className,
}: ControllerRenderProps<FieldValues, string> & {
  placeholder?: string
  className?: string
}) {
  const [edit, setEdit] = useState<boolean>(value == undefined)
  const [text, setText] = useState<string>(value?.name ?? "")
  const [isLoading, startTransition] = useTransition()

  async function searchForStationUsingGeocodeApi() {
    const url = encodeURI("/api/v1/geocoding/station?query=" + text)
    const response = await fetch(url, { method: "POST" })

    if (response.ok) {
      onChange(await response.json())
      setEdit(false)
    } else
      toast("No stations found", {
        description: await response.text(),
      })
  }

  function onButtonClick() {
    if (edit) {
      startTransition(async () => await searchForStationUsingGeocodeApi())
    } else {
      setText(value?.name ?? "")
      onChange(undefined)
      setEdit(true)
    }
    onBlur()
  }

  return (
    <div className={cn("", className)}>
      <div className="flex gap-2">
        <Input
          ref={ref}
          name={name}
          value={edit ? text : (value?.name ?? "")}
          onChange={e => edit && setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
        />
        {!disabled && (
          <Button
            variant="secondary"
            onClick={onButtonClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner className="h-4 w-4" variant="pinwheel" />
            ) : edit ? (
              <Search className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
