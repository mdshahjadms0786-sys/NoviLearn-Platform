'use client';

import { useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme-provider';
import { Button } from '../ui/button';

interface ComingSoonProps {
  title: string;
  heading: string;
  description: string;
  icon: React.ReactNode;
}

export function ComingSoon({
  title,
  heading,
  description,
  icon,
}: ComingSoonProps) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {title}
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          This area of NoviLearn is under construction.
        </Text>
      </View>
      <View style={styles.empty}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          {icon}
        </View>
        <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
          {heading}
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {description}
        </Text>
        <Button variant="outlined" onPress={() => router.push('/')}>
          Back to Home
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  textBlock: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'System',
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: 'System',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
