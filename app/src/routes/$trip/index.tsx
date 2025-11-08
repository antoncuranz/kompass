import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$trip/")({
  loader: () => {
    throw redirect({
      href: "./itinerary",
    })
  },
})
