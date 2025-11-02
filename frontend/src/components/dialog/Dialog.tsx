import { DialogContent } from "@/components/ui/dialog.tsx"
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog"
import { useRouter } from "next/navigation"
import React, { createContext, ReactNode, useContext } from "react"

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
  open,
  setOpen,
}: {
  children: React.ReactNode | React.ReactNode[]
  open: boolean
  setOpen: (needsUpdate: boolean) => void
}) {
  const router = useRouter()

  function onClose(needsUpdate?: boolean) {
    setOpen(false)
    if (needsUpdate) router.refresh()
  }

  return (
    <BaseDialog.Root open={open} onOpenChange={open => open || onClose(false)}>
      <DialogContent>
        <DialogContextProvider onClose={onClose}>
          {children}
        </DialogContextProvider>
      </DialogContent>
    </BaseDialog.Root>
  )
}
Dialog.displayName = BaseDialog.Root.displayName

export const RowContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}
