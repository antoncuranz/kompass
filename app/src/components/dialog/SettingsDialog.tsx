import { zodResolver } from "@hookform/resolvers/zod"
import { useLogOut, usePassphraseAuth } from "jazz-tools/react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download01Icon,
  Logout05Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons"
import type { User } from "@/domain"
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
import { isLoaded } from "@/domain"
import { useUserRepo } from "@/repo/user"
import { downloadBlob } from "@/lib/misc-utils"

const formSchema = z.object({
  name: z.string().nonempty("Required"),
})

export default function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user } = useUserRepo()

  return (
    isLoaded(user) && (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <SettingsDialogContent user={user} />
      </Dialog>
    )
  )
}

function SettingsDialogContent({ user }: { user: User }) {
  const { update } = useUserRepo()

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
      name: user.name,
    },
  })

  function handleUpdateProfile(values: z.output<typeof formSchema>) {
    startTransition(async () => {
      await update({
        name: values.name,
        avatarImage: profileImage,
      })
    })
  }

  async function handleExportData() {
    try {
      const data = await exportUserData(user)

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      downloadBlob(
        url,
        `kompass-data-${new Date().toISOString().split("T")[0]}.json`,
      )
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
        <ImageUpload onFileSelect={setProfileImage} />

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

      <div className="px-3 py-3 space-y-3">
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
            size="icon"
            onClick={() => setShowPassphrase(!showPassphrase)}
            aria-label="Show Passphrase"
          >
            {showPassphrase ? (
              <HugeiconsIcon icon={ViewIcon} />
            ) : (
              <HugeiconsIcon icon={ViewOffSlashIcon} />
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
          <HugeiconsIcon icon={Download01Icon} />
          Export Data
        </Button>

        <Button
          variant={showLogoutConfirm ? "destructive" : "secondary"}
          className="w-full"
          onClick={handleLogout}
        >
          <HugeiconsIcon icon={Logout05Icon} />
          {showLogoutConfirm ? "Confirm Logout" : "Logout"}
        </Button>
      </div>
    </>
  )
}
