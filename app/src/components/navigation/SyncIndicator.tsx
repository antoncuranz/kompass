import { CloudOff } from "lucide-react"
import { useSyncConnectionStatus } from "jazz-tools/react"

export function SyncIndicator() {
  const connected = useSyncConnectionStatus()

  return connected ? null : <CloudOff className="h-5 w-5 text-yellow-500" />
}
