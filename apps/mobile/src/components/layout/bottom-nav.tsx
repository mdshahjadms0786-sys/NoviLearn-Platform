'use client';

import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme-provider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface NavTab {
  href: string;
  label: string;
  icon: IoniconName;
  activeIcon: IoniconName;
}

const TABS: NavTab[] = [
  { href: '/', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { href: '/learn', label: 'Learn', icon: 'book-outline', activeIcon: 'book' },
  {
    href: '/practice',
    label: 'Practice',
    icon: 'fitness-outline',
    activeIcon: 'fitness',
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: 'stats-chart-outline',
    activeIcon: 'stats-chart',
  },
  {
    href: '/account',
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

interface BottomNavProps {
  bottomInset: number;
}

export function BottomNav({ bottomInset }: BottomNavProps) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View
      style={[
        styles.nav,
        {
          paddingBottom: bottomInset + 4,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
      ]}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const color = active
          ? theme.colors.primary
          : theme.colors.onSurfaceVariant;
        return (
          <Pressable
            key={tab.href}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={active ? { selected: true } : undefined}
            onPress={() => router.push(tab.href)}
            style={styles.tab}
          >
            <Ionicons
              name={active ? tab.activeIcon : tab.icon}
              size={22}
              color={color}
            />
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'System',
  },
});
