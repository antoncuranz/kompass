import { HugeiconsIcon } from "@hugeicons/react"
import { WifiDisconnected01Icon } from "@hugeicons/core-free-icons"
import { useSyncConnectionStatus } from "jazz-tools/react"

export function SyncIndicator() {
  const connected = useSyncConnectionStatus()

  return connected ? null : <HugeiconsIcon icon={WifiDisconnected01Icon} size={20} className="text-yellow-500" />
}
