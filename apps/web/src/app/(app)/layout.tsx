'use client';

import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/protected-route';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
