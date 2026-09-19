'use client';

import * as React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Spinner } from './spinner';
import { useTheme } from '../../theme-provider';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ title, description, action, icon, style }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
        {icon || (
          <Text style={[styles.iconText, { color: theme.colors.onSurfaceVariant }]}>📭</Text>
        )}
      </View>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>{description}</Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function ErrorState({ title, description, action, style }: ErrorStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: theme.colors.error + '20' }]}>
        <Text style={[styles.iconText, { color: theme.colors.error }]}>⚠️</Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>{description}</Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export function LoadingState({ message = 'Loading...', style }: LoadingStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <Spinner size="lg" />
      <Text style={[styles.messageText, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  title: {
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
  },
  action: {
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'System',
    textAlign: 'center',
  },
});