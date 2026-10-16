import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-3xl border border-foreground/35 bg-input px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-foreground/25 focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
