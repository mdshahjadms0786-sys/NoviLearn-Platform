'use client';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme-provider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: IoniconName;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    href: '/learn',
    label: 'Start learning',
    description: 'Explore a new topic',
    icon: 'book-outline',
  },
  {
    href: '/practice',
    label: 'Practice',
    description: 'Reinforce what you know',
    icon: 'fitness-outline',
  },
  {
    href: '/progress',
    label: 'View progress',
    description: 'Track your journey',
    icon: 'stats-chart-outline',
  },
  {
    href: '/account',
    label: 'My profile',
    description: 'Manage your account',
    icon: 'person-outline',
  },
];

export function QuickActions() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Quick actions
      </Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.href}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => router.push(action.href)}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              {action.label}
            </Text>
            <Text
              style={[
                styles.description,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {action.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  description: {
    fontSize: 13,
    fontFamily: 'System',
    lineHeight: 18,
  },
});
