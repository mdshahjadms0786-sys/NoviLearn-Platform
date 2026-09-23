"use client";

import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "text-destructive border-destructive/50 dark:border-destructive [&>svg]:text-destructive dark:bg-destructive/20",
        success:
          "text-success border-success/50 dark:border-success [&>svg]:text-success dark:bg-success/20",
        warning:
          "text-warning border-warning/50 dark:border-warning [&>svg]:text-warning dark:bg-warning/20",
        info: "text-info border-info/50 dark:border-info [&>svg]:text-info dark:bg-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      alertVariants({
        variant,
      }),
      className,
    )}
    {...props}
  />
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h5>
  ),
);
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";
export { Alert, AlertTitle, AlertDescription };
