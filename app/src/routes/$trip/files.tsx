import { Outlet, createFileRoute } from "@tanstack/react-router"
import TwoCardLayout from "@/components/layout/TwoCardLayout"
import FilesMainCard from "@/components/files/FilesMainCard"

export const Route = createFileRoute("/$trip/files")({
  component: FilesPage,
})

function FilesPage() {
  return (
    <TwoCardLayout
      leftCard={<FilesMainCard />}
      rightCard={<Outlet />}
      primaryCard="right"
    />
  )
}
