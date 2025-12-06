import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import TwoCardLayout from "@/components/layout/TwoCardLayout"
import FileListCard from "@/components/files/FileListCard"

export const Route = createFileRoute("/$trip/files")({
  component: FilesPage,
})

function FilesPage() {
  const isListRoute = useLocation({
    select: location => location.pathname.endsWith("/files"),
  })
  return (
    <TwoCardLayout
      leftCard={<FileListCard />}
      rightCard={<Outlet />}
      primaryCard={isListRoute ? "left" : "right"}
    />
  )
}
