import { zodResolver } from "@hookform/resolvers/zod"
import { createImage } from "jazz-tools/media"
import { useLogOut, usePassphraseAuth } from "jazz-tools/react"
import { Download, Eye, EyeOff, LogOut } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import type { co } from "jazz-tools"
import type { UserAccount } from "@/schema"
import wordlist from "@/lib/wordlist"
import { Dialog, useDialogContext } from "@/components/dialog/Dialog"
import { ImageUpload } from "@/components/ImageUpload"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { exportUserData } from "@/lib/trip-utils"
import { useInspector } from "@/components/provider/InspectorProvider"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
})

export default function SettingsDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: co.loaded<typeof UserAccount>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SettingsDialogContent account={account} />
    </Dialog>
  )
}

function SettingsDialogContent({
  account,
}: {
  account: co.loaded<typeof UserAccount>
}) {
  const { onClose } = useDialogContext()
  const logOut = useLogOut()
  const passphraseAuth = usePassphraseAuth({ wordlist })
  const { showInspector, toggleInspector } = useInspector()

  const [profileImage, setProfileImage] = useState<File | null | undefined>()
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isUpdating, startTransition] = useTransition()

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account.profile.name,
    },
  })

  function handleUpdateProfile(values: z.output<typeof formSchema>) {
    startTransition(async () => {
      account.profile.$jazz.set("name", values.name)

      if (profileImage === null) {
        account.profile.$jazz.set("avatar", undefined)
      } else if (profileImage) {
        account.profile.$jazz.set(
          "avatar",
          await createImage(profileImage, {
            owner: account.profile.$jazz.owner,
            progressive: true,
            placeholder: "blur",
          }),
        )
        setProfileImage(null)
      }
    })
  }

  async function handleExportData() {
    try {
      const data = await exportUserData(account)

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `kompass-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Data exported")
    } catch (error) {
      toast.error("Failed to export data: " + error)
    }
  }

  function handleLogout() {
    if (showLogoutConfirm) {
      logOut()
      onClose()
    } else {
      setShowLogoutConfirm(true)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
      </DialogHeader>

      <Form form={form} onSubmit={form.handleSubmit(handleUpdateProfile)}>
        <ImageUpload
          onFileSelect={setProfileImage}
          accountId={account.$jazz.id}
        />

        <FormField
          control={form.control}
          name="name"
          label="Name"
          render={({ field }) => <Input data-1p-ignore {...field} />}
        />
        <div className="px-4">
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isUpdating}
          >
            {isUpdating ? <Spinner variant="pinwheel" /> : "Update Profile"}
          </Button>
        </div>
      </Form>

      <Separator />

      <div className="px-4 py-4 space-y-4">
        <label className="text-sm font-medium block mb-2">Passphrase</label>
        <div className="flex gap-2">
          <Input
            type={showPassphrase ? "text" : "password"}
            value={passphraseAuth.passphrase}
            readOnly
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => setShowPassphrase(!showPassphrase)}
            aria-label="Show Passphrase"
          >
            {showPassphrase ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Show Jazz Inspector</label>
          <Switch checked={showInspector} onCheckedChange={toggleInspector} />
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={handleExportData}
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>

        <Button
          variant={showLogoutConfirm ? "destructive" : "secondary"}
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {showLogoutConfirm ? "Confirm Logout" : "Logout"}
        </Button>
      </div>
    </>
  )
}
