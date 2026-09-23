"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
export function NavLink({ className, isActive, children, ...props }) {
  return (
    <Link
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
export function NavMain({ children, className }) {
  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {children}
    </nav>
  );
}
export function Header({ children, className }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {children}
      </div>
    </header>
  );
}
export function HeaderBrand({ children, href = "/", className }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 text-xl font-bold", className)}
      aria-label="NoviLearn Home"
    >
      {children}
    </Link>
  );
}
export function HeaderActions({ children, className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}
