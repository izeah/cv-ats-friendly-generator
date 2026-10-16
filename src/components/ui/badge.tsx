import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'marigold'
}>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground border-primary",
      secondary: "bg-secondary text-secondary-foreground border-secondary",
      outline: "border-foreground text-foreground",
      marigold: "bg-marigold text-forest border-forest",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
