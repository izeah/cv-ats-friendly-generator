import * as React from "react"
import { cn } from "@/lib/utils"

/** Shimmering placeholder shown while content loads. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("skeleton rounded-full", className)} {...props} />
}

export { Skeleton }
