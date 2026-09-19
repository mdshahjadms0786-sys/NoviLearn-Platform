'use client';

import { useRouter } from 'expo-router';
import * as React from 'react';

import { useAuthStore } from '../lib/auth-store';
import { LoadingState } from './ui/states';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const restore = useAuthStore((s) => s.restore);

  React.useEffect(() => {
    void restore();
  }, [restore]);

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  if (status === 'loading') {
    return <LoadingState message="Checking your session..." />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
