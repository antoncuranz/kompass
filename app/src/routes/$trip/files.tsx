import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { Allotment } from "allotment"
import FileListPane from "@/components/files/FileListPane"
import { useIsMobile, useIsTwoColumn } from "@/hooks/useResponsive"

export const Route = createFileRoute("/$trip/files")({
  component: FilesPage,
})

function FilesPage() {
  const isListRoute = useLocation({
    select: location => location.pathname.endsWith("/files"),
  })

  const isMobile = useIsMobile()
  const isTwoColumn = useIsTwoColumn()

  return isMobile ? (
    isListRoute ? (
      <FileListPane />
    ) : (
      <Outlet />
    )
  ) : (
    <Allotment proportionalLayout={false}>
      {(isListRoute || isTwoColumn) && (
        <Allotment.Pane minSize={300} preferredSize={600} snap>
          <FileListPane />
        </Allotment.Pane>
      )}
      {!isListRoute && (
        <Allotment.Pane minSize={300}>
          <Outlet />
        </Allotment.Pane>
      )}
    </Allotment>
  )
}
