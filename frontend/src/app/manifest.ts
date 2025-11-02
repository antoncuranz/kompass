import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "kompass travel planner",
    short_name: "kompass",
    description: "kompass travel planner",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "chocolate",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "160x160",
        type: "image/png",
      },
    ],
  }
}
