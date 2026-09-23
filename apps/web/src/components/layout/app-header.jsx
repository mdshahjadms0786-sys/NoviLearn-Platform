"use client";

import { GraduationCap, LogOut } from "lucide-react";
import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { useSignOut } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Header, HeaderActions, HeaderBrand } from "@/components/ui/navigation";
import { useAuthStore } from "@/lib/auth-store";
function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const { signingOut, signOut } = useSignOut();
  return (
    <Header className="sticky top-0 z-40">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <HeaderBrand href="/home" className="shrink-0">
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
          NoviLearn
        </HeaderBrand>
      </div>
      <HeaderActions>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Open profile menu"
            >
              <Avatar>
                <AvatarFallback>
                  {user !== null ? getInitials(user.name) : "NL"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {user !== null ? (
                <div className="flex flex-col gap-1">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              ) : (
                "Account"
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <span className="flex items-center gap-2">Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              onSelect={(event) => {
                event.preventDefault();
                void signOut();
              }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start"
                disabled={signingOut}
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </HeaderActions>
    </Header>
  );
}
