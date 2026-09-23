import { BookOpen, CircleUser, Dumbbell, Home, TrendingUp } from "lucide-react";
export const APP_NAV_ITEMS = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
  },
  {
    href: "/learn",
    label: "Learn",
    icon: BookOpen,
  },
  {
    href: "/practice",
    label: "Practice",
    icon: Dumbbell,
  },
  {
    href: "/progress",
    label: "Progress",
    icon: TrendingUp,
  },
];
export const PROFILE_NAV_ITEM = {
  href: "/account",
  label: "Profile",
  icon: CircleUser,
};
export function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
