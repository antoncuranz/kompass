import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerIcon,
  Moon02Icon,
  Settings01Icon,
  SunIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { useAccount } from "jazz-tools/react"
import { useState } from "react"
import { usePrivacy } from "../provider/PrivacyProvider"
import { useTheme } from "../provider/ThemeProvider"
import SettingsDialog from "../dialog/SettingsDialog"
import { UserAccount } from "@/schema"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar } from "@/components/Avatar"
import { cn } from "@/lib/utils"
import { titleCase } from "@/lib/misc-utils"

const themeIcons = {
  light: SunIcon,
  dark: Moon02Icon,
  system: ComputerIcon,
}

export function ProfileMenu({ className }: { className?: string }) {
  const account = useAccount(UserAccount)
  const { theme, setTheme } = useTheme()
  const { privacyMode, togglePrivacyMode } = usePrivacy()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!account.$isLoaded) return null

  const themeOptions = (["light", "dark", "system"] as const).filter(
    t => t !== theme,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="secondary" size="icon-round" className="p-0" />
        }
        className={className}
      >
        <Avatar
          accountId={account.$jazz.id}
          className="h-full w-full border-0"
        />
        <span className="sr-only">Open profile menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuPositioner align="end">
        <DropdownMenuContent>
          {themeOptions.map(t => {
            const Icon = themeIcons[t]
            return (
              <DropdownMenuItem key={t} onClick={() => setTheme(t)}>
                <HugeiconsIcon icon={Icon} className="mr-2" />
                {titleCase(t)}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => togglePrivacyMode()}>
            <HugeiconsIcon
              icon={Tick02Icon}
              className={cn("mr-2", privacyMode && "invisible")}
            />
            Privacy Mode
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <HugeiconsIcon icon={Settings01Icon} className="mr-2" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPositioner>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        account={account}
      />
    </DropdownMenu>
  )
}
