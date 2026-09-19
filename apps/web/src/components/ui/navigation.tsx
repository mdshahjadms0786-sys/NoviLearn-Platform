'use client';

import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface NavLinkProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
  href: string;
}

export function NavLink({
  className,
  isActive,
  children,
  ...props
}: NavLinkProps) {
  return (
    <Link
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

interface NavMainProps {
  children: React.ReactNode;
  className?: string;
}

export function NavMain({ children, className }: NavMainProps) {
  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {children}
    </nav>
  );
}

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function Header({ children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {children}
      </div>
    </header>
  );
}

interface HeaderBrandProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export function HeaderBrand({
  children,
  href = '/',
  className,
}: HeaderBrandProps) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2 text-xl font-bold', className)}
      aria-label="NoviLearn Home"
    >
      {children}
    </Link>
  );
}

interface HeaderActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function HeaderActions({ children, className }: HeaderActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  );
}