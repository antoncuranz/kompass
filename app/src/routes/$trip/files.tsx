import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { Allotment } from "allotment"
import { BreakPointHooks, breakpointsTailwind } from "@react-hooks-library/core"
import FileListPane from "@/components/files/FileListPane"

export const Route = createFileRoute("/$trip/files")({
  component: FilesPage,
})

function FilesPage() {
  const isListRoute = useLocation({
    select: location => location.pathname.endsWith("/files"),
  })

  const showFileList = BreakPointHooks(breakpointsTailwind).useGreater("lg")

  return (
    <Allotment proportionalLayout={false}>
      {(isListRoute || showFileList) && (
        <Allotment.Pane minSize={300} preferredSize={600}>
          <FileListPane />
        </Allotment.Pane>
      )}
      {!isListRoute && (
        <Allotment.Pane minSize={300} snap>
          <Outlet />
        </Allotment.Pane>
      )}
    </Allotment>
  )
}
