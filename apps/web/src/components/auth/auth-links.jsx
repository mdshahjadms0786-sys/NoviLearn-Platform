"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

export function AuthLinks() {
  const { status, user } = useAuth();

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" asChild>
          <Link href="/home">Dashboard</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/account">{user?.name ?? "Account"}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/signup">Get started</Link>
      </Button>
    </div>
  );
}
