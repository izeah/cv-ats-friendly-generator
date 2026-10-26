import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "h-11 px-4 py-2 flex w-full rounded-xl border-[1.5px] border-forest/30 bg-input text-sm font-medium text-foreground placeholder:text-muted-foreground/80 transition-[border-color,box-shadow] duration-200 hover:border-forest/60 focus:outline-none focus:border-forest focus:ring-4 focus:ring-marigold/50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
