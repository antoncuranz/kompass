import { zodResolver } from "@hookform/resolvers/zod"
import {
  useIsAuthenticated,
  usePasskeyAuth,
  usePassphraseAuth,
} from "jazz-tools/react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import wordlist from "../lib/wordlist.ts"
import { Dialog } from "@/components/dialog/Dialog.tsx"
import { ImageUpload } from "@/components/ImageUpload.tsx"
import { Button } from "@/components/ui/button.tsx"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx"
import { Form, FormField } from "@/components/ui/form.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { cn } from "@/lib/utils"
import { useUserQuery } from "@/repo/user"

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
  const { user, update } = useUserQuery()

  const [passphraseFormShown, setPassphraseFormShown] = useState<boolean>(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)

  async function uploadProfileImage() {
    if (profileImage && user.$isLoaded) {
      try {
        await update({
          avatarImage: profileImage,
        })
      } catch {
        toast.error("Failed to upload profile picture")
      }
    }
  }

  async function handleSignup(name: string) {
    try {
      await passkeyAuth.signUp(name)
      await uploadProfileImage()
    } catch {
      toast.error("Failed to sign up")
    }
  }

  async function handlePassphraseSignup(name: string) {
    await passphraseAuth.signUp(name)
    await uploadProfileImage()
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

  const [isPending, startTransition] = useTransition()

  function onLoginWithPassphraseClick() {
    if (!passphraseFormShown) {
      setPassphraseFormShown(true)
      return
    }
    startTransition(async () => {
      await loginForm.handleSubmit(
        async values => await passphraseAuth.logIn(values.passphrase),
      )()
    })
  }

  return (
    !isAuthenticated && (
      <Dialog>
        <DialogHeader>
          <DialogTitle>Welcome to kompass!</DialogTitle>
        </DialogHeader>
        <Form
          form={signupForm}
          onSubmit={e => {
            e.preventDefault()
            startTransition(async () => {
              await signupForm.handleSubmit(
                async values => await handleSignup(values.name),
              )()
            })
          }}
        >
          <div className="px-3">
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
          <div>
            <Button
              type="submit"
              className="w-full text-base"
              disabled={isPending}
            >
              {isPending ? <Spinner variant="pinwheel" /> : "Sign up"}
            </Button>
            {import.meta.env.MODE !== "production" && (
              <Button
                type="button"
                variant="secondary"
                className="w-full text-base mt-2"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await signupForm.handleSubmit(async values =>
                      handlePassphraseSignup(values.name),
                    )()
                  })
                }
              >
                Sign up with Passphrase
              </Button>
            )}
          </div>
        </Form>
        <Separator />
        <h3 className="mx-3 text-lg font-semibold leading-none tracking-tight">
          Already have an account?
        </h3>
        <div className="flex flex-col gap-2">
          <div className="px-3">
            <Button
              className="w-full text-base"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await passkeyAuth.logIn()
                  } catch {
                    toast.error("Failed to log in")
                  }
                })
              }
            >
              {isPending ? <Spinner variant="pinwheel" /> : "Log in"}
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
          <div className="px-3 pb-3">
            <Button
              type="submit"
              variant="secondary"
              className="w-full text-base"
              disabled={isPending}
              onClick={onLoginWithPassphraseClick}
            >
              Log in with Passphrase
            </Button>
          </div>
        </div>
      </Dialog>
    )
  )
}
