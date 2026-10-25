import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$trip/")({
  loader: ({ params }) => {
    throw redirect({
      to: "/$trip/itinerary",
      params,
    })
  },
})
