import type { LucideIcon } from 'lucide-react';
import { BookOpen, CircleUser, Dumbbell, Home, TrendingUp } from 'lucide-react';

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/practice', label: 'Practice', icon: Dumbbell },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
];

export const PROFILE_NAV_ITEM: AppNavItem = {
  href: '/account',
  label: 'Profile',
  icon: CircleUser,
};

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
