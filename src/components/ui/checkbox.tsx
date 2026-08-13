"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "onChange"
  > {
  asChild?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, asChild = false, checked, defaultChecked, onCheckedChange, ...props },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLButtonElement>}
          data-state={checked ? "checked" : "unchecked"}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        />
      )
    }

    return (
      <span className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className={cn(
            "peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded border border-border bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 checked:border-primary checked:bg-primary",
            className
          )}
          {...props}
        />
        <Check
          className="pointer-events-none absolute h-4 w-4 text-primary-foreground opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
