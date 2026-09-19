'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { LoadingState } from '@/components/ui/states';
import { useAuthStore } from '@/lib/auth-store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingState message="Checking your session..." />
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
