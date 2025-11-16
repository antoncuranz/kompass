import { zodResolver } from "@hookform/resolvers/zod"
import { createImage } from "jazz-tools/media"
import {
  useAccount,
  useIsAuthenticated,
  usePasskeyAuth,
  usePassphraseAuth,
} from "jazz-tools/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import wordlist from "../lib/wordlist.ts"
import { UserAccount } from "@/schema.ts"
import { Dialog } from "@/components/dialog/Dialog.tsx"
import { ImageUpload } from "@/components/ImageUpload.tsx"
import { Button } from "@/components/ui/button.tsx"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx"
import { Form, FormField } from "@/components/ui/form.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { cn } from "@/lib/utils.ts"

const signupFormSchema = z.object({
  name: z.string().nonempty("Required"),
})

const loginFormSchema = z.object({
  passphrase: z.string().nonempty("Required"),
})

export function Auth() {
  const isAuthenticated = useIsAuthenticated()
  const passphraseAuth = usePassphraseAuth({ wordlist })
  const passkeyAuth = usePasskeyAuth({
    appName: "kompass",
  })
  const account = useAccount(UserAccount)

  const [passphraseFormShown, setPassphraseFormShown] = useState<boolean>(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)

  async function handleSignup(name: string) {
    await passkeyAuth.signUp(name)
    if (profileImage && account.$isLoaded) {
      try {
        await account.profile.$jazz.set(
          "avatar",
          await createImage(profileImage, {
            owner: account.profile.$jazz.owner,
            progressive: true,
            placeholder: "blur",
          }),
        )
      } catch (error) {
        toast.error("Failed to upload profile picture")
      }
    }
  }

  const signupForm = useForm<
    z.input<typeof signupFormSchema>,
    unknown,
    z.output<typeof signupFormSchema>
  >({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
    },
  })

  const loginForm = useForm<
    z.input<typeof loginFormSchema>,
    unknown,
    z.output<typeof loginFormSchema>
  >({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      passphrase: "",
    },
  })

  const isSubmitting = false

  async function onLoginWithPassphraseClick() {
    if (!passphraseFormShown) {
      setPassphraseFormShown(true)
      return
    }
    await loginForm.handleSubmit(
      async values => await passphraseAuth.logIn(values.passphrase),
    )()
  }

  return (
    !isAuthenticated && (
      <Dialog>
        <DialogHeader>
          <DialogTitle>Welcome to kompass!</DialogTitle>
        </DialogHeader>
        <div className="px-4 pt-4">
          <Button
            className="w-full text-base"
            disabled={isSubmitting}
            onClick={() => passkeyAuth.logIn()}
          >
            {isSubmitting ? <Spinner variant="pinwheel" /> : "Log in"}
          </Button>
        </div>
        <Form
          className={cn("py-1", !passphraseFormShown && "hidden")}
          form={loginForm}
          onSubmit={() => {}}
        >
          <FormField
            control={loginForm.control}
            name="passphrase"
            label="Passphrase"
            render={({ field }) => (
              <Input data-1p-ignore placeholder="" {...field} />
            )}
          />
        </Form>
        <div className="px-4 pb-4">
          <Button
            type="submit"
            variant="secondary"
            className="w-full text-base"
            disabled={isSubmitting}
            onClick={onLoginWithPassphraseClick}
          >
            {isSubmitting ? (
              <Spinner variant="pinwheel" />
            ) : (
              "Log in with Passphrase"
            )}
          </Button>
        </div>
        <Separator />
        <Form
          form={signupForm}
          onSubmit={signupForm.handleSubmit(
            async values => await handleSignup(values.name),
          )}
        >
          <h3 className="mx-4 text-lg font-semibold leading-none tracking-tight">
            Don't have an account yet?
          </h3>
          <div className="px-4">
            <ImageUpload onFileSelect={setProfileImage} />
          </div>
          <FormField
            control={signupForm.control}
            name="name"
            label="Name"
            render={({ field }) => (
              <Input data-1p-ignore placeholder="" {...field} />
            )}
          />
          <div className="mt-4">
            <Button
              type="submit"
              className="w-full text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner variant="pinwheel" /> : "Sign up"}
            </Button>
          </div>
        </Form>
      </Dialog>
    )
  )
}
