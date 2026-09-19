'use client';

import * as React from 'react';

import { AppNavList } from '@/components/navigation/app-nav-list';
import { Separator } from '@/components/ui/separator';

import { SignOutButton } from './sign-out-button';

export function Sidebar() {
  return (
    <aside
      className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r p-4 lg:flex"
      aria-label="Student navigation"
    >
      <div className="flex flex-col gap-1">
        <AppNavList />
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Separator />
        <SignOutButton />
      </div>
    </aside>
  );
}
