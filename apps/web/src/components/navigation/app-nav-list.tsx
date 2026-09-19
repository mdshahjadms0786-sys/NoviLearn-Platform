'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  APP_NAV_ITEMS,
  PROFILE_NAV_ITEM,
  isActivePath,
} from '@/components/navigation/nav-config';
import { NavLink } from '@/components/ui/navigation';

interface AppNavListProps {
  onNavigate?: () => void;
}

export function AppNavList({ onNavigate }: AppNavListProps) {
  const pathname = usePathname();

  return (
    <React.Fragment>
      {APP_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            href={item.href}
            isActive={isActivePath(pathname, item.href)}
            {...(onNavigate !== undefined ? { onClick: onNavigate } : {})}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
      <NavLink
        href={PROFILE_NAV_ITEM.href}
        isActive={isActivePath(pathname, PROFILE_NAV_ITEM.href)}
        {...(onNavigate !== undefined ? { onClick: onNavigate } : {})}
      >
        <PROFILE_NAV_ITEM.icon className="h-4 w-4" aria-hidden="true" />
        {PROFILE_NAV_ITEM.label}
      </NavLink>
    </React.Fragment>
  );
}
