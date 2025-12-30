import { useEffect, useState } from "react"

interface PushNotificationStatus {
  isPwa: boolean
  permissionStatus: NotificationPermission | "unsupported"
  canEnable: boolean
  blockedReason: string | null
}

export function usePushNotificationStatus(
  isAdmin: boolean,
): PushNotificationStatus {
  const [isPwa, setIsPwa] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<
    NotificationPermission | "unsupported"
  >("default")

  useEffect(() => {
    // Check if running as installed PWA (standalone mode)
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    setIsPwa(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setIsPwa(e.matches)
    mediaQuery.addEventListener("change", handleChange)

    // Check notification support and permission
    if (!("Notification" in window)) {
      setPermissionStatus("unsupported")
    } else {
      setPermissionStatus(Notification.permission)
    }

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Determine if feature can be enabled and why not
  let blockedReason: string | null = null

  if (!isPwa) {
    blockedReason = "Install app to enable"
  } else if (permissionStatus === "unsupported") {
    blockedReason = "Notifications not supported"
  } else if (permissionStatus === "denied") {
    blockedReason = "Notifications blocked"
  } else if (!isAdmin) {
    blockedReason = "Admin access required"
  }

  const canEnable = blockedReason === null

  return {
    isPwa,
    permissionStatus,
    canEnable,
    blockedReason,
  }
}
