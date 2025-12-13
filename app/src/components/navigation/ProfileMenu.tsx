import { Check, Monitor, Moon, Settings, Sun } from "lucide-react"
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
  light: Sun,
  dark: Moon,
  system: Monitor,
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
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
          />
        }
        className={className}
      >
        <Avatar accountId={account.$jazz.id} />
        <span className="sr-only">Open profile menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuPositioner align="end">
        <DropdownMenuContent>
          {themeOptions.map(t => {
            const Icon = themeIcons[t]
            return (
              <DropdownMenuItem key={t} onClick={() => setTheme(t)}>
                <Icon className="mr-2 h-4 w-4" />
                {titleCase(t)}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => togglePrivacyMode()}>
            <Check className={cn("mr-2 h-4 w-4", privacyMode && "invisible")} />
            Privacy Mode
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
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
