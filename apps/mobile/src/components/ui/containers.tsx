'use client';

import * as React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme-provider';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  backgroundColor?: string;
}

export function Screen({ children, style, padding = 16, backgroundColor }: ScreenProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: backgroundColor || theme.colors.background, padding },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

interface SectionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  spacing?: number;
}

export function Section({ children, style, title, spacing = 24 }: SectionProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.section, { gap: spacing }, style]}>
      {title && (
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>{title}</Text>
      )}
      {children}
    </View>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function Header({ title, subtitle, action, style }: HeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text>
        )}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 8,
  },
  header: {
    width: '100%',
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 2,
  },
});