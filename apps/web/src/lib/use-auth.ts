'use client';

import { useEffect } from 'react';

import { useAuthStore, type AuthState } from './auth-store';

export function useAuth(): AuthState {
  const restore = useAuthStore((s) => s.restore);

  useEffect(() => {
    void restore();
  }, [restore]);

  return useAuthStore();
}
