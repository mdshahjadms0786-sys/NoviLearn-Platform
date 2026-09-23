"use client";

import { useEffect } from "react";

import { useAuthStore } from "./auth-store";
export function useAuth() {
  const restore = useAuthStore((s) => s.restore);
  useEffect(() => {
    void restore();
  }, [restore]);
  return useAuthStore();
}
