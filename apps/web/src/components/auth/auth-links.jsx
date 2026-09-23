"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
export function AuthLinks() {
  const { status, user } = useAuth();
  if (status === "loading") {
    return null;
  }
  if (status === "authenticated") {
    return (
      <Button variant="outline" asChild>
        <Link href="/account">{user?.name ?? "My account"}</Link>
      </Button>
    );
  }
  return (
    <Button asChild>
      <Link href="/login">Sign in</Link>
    </Button>
  );
}
