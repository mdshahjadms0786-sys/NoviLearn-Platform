"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { useAuth } from "@/lib/use-auth";
export function AuthenticatedRedirect() {
  const { status } = useAuth();
  const router = useRouter();
  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home");
    }
  }, [router, status]);
  return null;
}
