'use client';

import { GraduationCap, Menu } from 'lucide-react';
import * as React from 'react';

import { AppNavList } from '@/components/navigation/app-nav-list';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { SignOutButton } from './sign-out-button';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <GraduationCap
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
            NoviLearn
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 py-4">
          <AppNavList onNavigate={() => setOpen(false)} />
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t pt-4">
          <SignOutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
