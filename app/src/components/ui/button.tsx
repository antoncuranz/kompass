import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    "focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:ring-[3px] aria-invalid:ring-[3px] ",
    "[&_svg:not([class*='size-'])]:size-5 inline-flex items-center justify-center whitespace-nowrap disabled:opacity-50 shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",

    "cursor-pointer disabled:pointer-events-none [&_svg]:pointer-events-none",
    "rounded-lg text-sm font-medium border shadow-sm active:shadow-xs transition-all active:scale-[0.98] disabled:shadow-none",
    "h-10 p-2 gap-1.5",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-primary-border hover:bg-primary-hover focus-visible:border-border",
        secondary:
          "bg-secondary text-secondary-foreground not-disabled:hover:bg-secondary-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover focus-visible:ring-destructive-foreground",
        ghost:
          "border-0 shadow-none active:shadow-none hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
      },
      size: {
        base: "",
        default: "px-6",
        round: "px-6 rounded-full",
        icon: "w-10",
        "icon-lg": "w-10 [&_svg:not([class*='size-'])]:size-6",
        "icon-round": "w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
