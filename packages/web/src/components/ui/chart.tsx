"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative h-[350px] w-full", className)}
    {...props}
  />
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-lg border bg-background px-3 py-2 text-sm shadow-xl",
      className
    )}
    {...props}
  />
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-2", className)} {...props} />
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
