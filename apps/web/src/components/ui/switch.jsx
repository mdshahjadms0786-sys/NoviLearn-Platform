"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/utils";
const Switch = React.forwardRef(
  ({ className, label, description, error, id, ...props }, ref) => {
    const autoId = React.useId();
    const switchId = id || autoId;
    return (
      <div className="flex items-start space-x-3">
        <SwitchPrimitive.Root
          ref={ref}
          id={switchId}
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
            error && "data-[state=unchecked]:border-destructive",
            className,
          )}
          {...props}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
            )}
          />
        </SwitchPrimitive.Root>
        {label && (
          <div className="space-y-0.5">
            <label
              htmlFor={switchId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
            >
              {label}
            </label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Switch.displayName = SwitchPrimitive.Root.displayName;
export { Switch };
