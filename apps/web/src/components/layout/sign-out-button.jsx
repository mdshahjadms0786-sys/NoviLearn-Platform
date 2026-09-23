"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
export function useSignOut() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [signingOut, setSigningOut] = React.useState(false);
  const signOut = async () => {
    setSigningOut(true);
    await logout();
    router.replace("/login");
  };
  return {
    signingOut,
    signOut,
  };
}
export function SignOutButton({ children, className, ...props }) {
  const { signingOut, signOut } = useSignOut();
  return (
    <Button
      variant="ghost"
      className={cn("w-full justify-start", className)}
      onClick={() => void signOut()}
      disabled={signingOut}
      {...props}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {children ?? (signingOut ? "Signing out..." : "Sign out")}
    </Button>
  );
}
