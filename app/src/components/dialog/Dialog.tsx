import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import React, { createContext, useContext } from "react"
import type { ReactNode } from "react"
import { DialogContent } from "@/components/ui/dialog.tsx"

interface DialogContextType {
  onClose: (needsUpdate?: boolean) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogContextProvider({
  children,
  onClose,
}: {
  onClose: () => void
  children: ReactNode
}) {
  return (
    <DialogContext.Provider value={{ onClose }}>
      {children}
    </DialogContext.Provider>
  )
}

export function useDialogContext(): DialogContextType {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

export function Dialog({
  children,
  open = true,
  onOpenChange: setOpen = () => {},
  className,
}: {
  children: React.ReactNode | Array<React.ReactNode>
  open?: boolean
  onOpenChange?: (needsUpdate: boolean) => void
  className?: string
}) {
  function onClose() {
    setOpen(false)
  }

  return (
    <BaseDialog.Root open={open} onOpenChange={open => open || onClose()}>
      <DialogContent className={className}>
        <DialogContextProvider onClose={onClose}>
          {children}
        </DialogContextProvider>
      </DialogContent>
    </BaseDialog.Root>
  )
}

export const RowContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}
