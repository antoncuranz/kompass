import { useEffect, useState } from "react"
import { generateAuthToken } from "jazz-tools"
import { toast } from "sonner"
import { useSharedTrip } from "@/components/provider/TripProvider"
import config from "@/config"

interface PushNotificationStatus {
  toggle: () => void
  sendTestNotification: () => void
  status: "active" | "inactive" | "blocked"
  blockedReason: string | null
}

function usePushManager() {
  const [pushManager, setPushManager] = useState<PushManager | undefined>(
    undefined,
  )

  async function retrievePushManger() {
    const registration = await navigator.serviceWorker.ready
    setPushManager(registration.pushManager)
  }

  useEffect(() => {
    void retrievePushManger()
  }, [])

  return pushManager
}

export function usePushNotifications(isAdmin: boolean): PushNotificationStatus {
  const pushManager = usePushManager()
  const [isPwa, setIsPwa] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<
    NotificationPermission | "unsupported"
  >("default")

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    setIsPwa(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setIsPwa(e.matches)
    mediaQuery.addEventListener("change", handleChange)

    if (!("Notification" in window)) {
      setPermissionStatus("unsupported")
    } else {
      setPermissionStatus(Notification.permission)
    }

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const [subscriptionState, setSubscriptionState] = useState<
    boolean | undefined
  >(undefined)
  const [monitorState, setMonitorState] = useState<boolean | undefined>(
    undefined,
  )

  const transportation = useSharedTrip({ select: st => st.trip.transportation })

  async function updateMonitorState(coListId: string) {
    setMonitorState(undefined)
    const response = await fetch("/worker/monitor/" + coListId, {
      headers: {
        Authorization: `Jazz ${generateAuthToken()}`,
      },
    })
    setMonitorState(response.ok)
  }

  useEffect(() => {
    void updateMonitorState(transportation.$jazz.id)
  }, [transportation.$jazz.id])

  async function updateSubscriptionState(
    subscription: PushSubscription | null,
  ) {
    if (subscription === null) {
      setSubscriptionState(false)
      return
    }

    setSubscriptionState(undefined)
    const response = await fetch("/worker/web-push/subscriptions", {
      headers: {
        Authorization: `Jazz ${generateAuthToken()}`,
      },
    })
    if (!response.ok) {
      setSubscriptionState(false)
    } else {
      const list = (await response.json()) as Array<string>
      setSubscriptionState(list.includes(subscription.endpoint))
    }
  }

  useEffect(() => {
    if (pushManager) {
      void pushManager.getSubscription().then(updateSubscriptionState)
    }
  }, [pushManager])

  let blockedReason: string | null = null

  if (!isPwa) {
    blockedReason = "Install app to enable"
  } else if (permissionStatus === "unsupported") {
    blockedReason = "Notifications not supported"
  } else if (permissionStatus === "denied") {
    blockedReason = "Notifications blocked"
  } else if (!isAdmin) {
    // TODO: should also be possible if admin added worker already
    blockedReason = "Admin access required"
  } else if (
    pushManager === undefined ||
    subscriptionState === undefined ||
    monitorState === undefined
  ) {
    blockedReason = "Loading..."
  }

  const status =
    blockedReason !== null
      ? "blocked"
      : subscriptionState && monitorState
        ? "active"
        : "inactive"

  return {
    toggle: async () => {
      const coListId = transportation.$jazz.id
      if (status === "inactive") {
        if (!subscriptionState && pushManager) {
          const subscription = await pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: config.VAPID_PUBLIC_KEY,
          })
          const response = await fetch("/worker/web-push/subscriptions", {
            method: "POST",
            headers: {
              Authorization: `Jazz ${generateAuthToken()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          })
          if (!response.ok) {
            toast.error("error posting subscription", {
              description: await response.text(),
            })
          }
          void updateSubscriptionState(subscription)
        }

        if (!monitorState) {
          const response = await fetch("/worker/monitor/" + coListId, {
            method: "POST",
            headers: {
              Authorization: `Jazz ${generateAuthToken()}`,
            },
          })
          if (!response.ok) {
            toast.error("error monitoring coList", {
              description: await response.text(),
            })
          }
          void updateMonitorState(coListId)
        }
      } else if (status === "active") {
        const response = await fetch("/worker/monitor/" + coListId, {
          method: "DELETE",
          headers: {
            Authorization: `Jazz ${generateAuthToken()}`,
          },
        })
        if (!response.ok) {
          toast.error("error unmonitoring coList", {
            description: await response.text(),
          })
        }
        void updateMonitorState(coListId)
      }
    },
    sendTestNotification: async () => {
      const response = await fetch("/worker/send-notification", {
        method: "POST",
        headers: {
          Authorization: `Jazz ${generateAuthToken()}`,
        },
      })
      if (!response.ok) {
        toast.error("error sending test notification", {
          description: await response.text(),
        })
      }
    },
    status,
    blockedReason,
  }
}
