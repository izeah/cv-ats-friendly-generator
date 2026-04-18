import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'info'
}>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-primary/10 text-primary border-primary/20",
      secondary: "bg-secondary text-secondary-foreground border-secondary",
      outline: "border-border text-foreground",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
      info: "bg-info/10 text-info border-info/20",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
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
