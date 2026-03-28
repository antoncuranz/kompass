declare global {
  interface Window {
    MAPLIBRE_STYLE_URL?: string
    JAZZ_SYNC_URL?: string
    JAZZ_WORKER_ACCOUNT?: string
    VAPID_PUBLIC_KEY?: string
    POSTHOG_PROJECT_TOKEN?: string
    POSTHOG_HOST?: string
  }
}

const config = {
  MAPLIBRE_STYLE_URL:
    window.MAPLIBRE_STYLE_URL ||
    "https://antoncuranz.github.io/basemaps-assets/streets.json",
  JAZZ_SYNC_URL: (window.JAZZ_SYNC_URL || "ws://127.0.0.1:4200") as
    | `wss://${string}`
    | `ws://${string}`,
  JAZZ_WORKER_ACCOUNT: window.JAZZ_WORKER_ACCOUNT!,
  VAPID_PUBLIC_KEY: window.VAPID_PUBLIC_KEY!,
  POSTHOG_PROJECT_TOKEN: window.POSTHOG_PROJECT_TOKEN,
  POSTHOG_HOST: window.POSTHOG_HOST || "https://eu.i.posthog.com",
}

export default config
