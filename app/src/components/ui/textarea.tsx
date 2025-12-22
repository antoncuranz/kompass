import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg shadow-sm border disabled:shadow-none dark:placeholder-text-neutral-600 flex h-10 w-full px-3 py-2 text-sm text-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-hidden dark:text-white",
        "focus-visible:ring-ring focus-visible:ring-[3px] transition-all",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
