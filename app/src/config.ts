declare global {
  interface Window {
    MAPLIBRE_STYLE_URL?: string
    JAZZ_SYNC_URL?: string
  }
}

const config = {
  MAPLIBRE_STYLE_URL:
    window.MAPLIBRE_STYLE_URL ||
    "https://antoncuranz.github.io/basemaps-assets/streets.json",
  JAZZ_SYNC_URL: (window.JAZZ_SYNC_URL || "ws://127.0.0.1:4200") as
    | `wss://${string}`
    | `ws://${string}`,
}

export default config
