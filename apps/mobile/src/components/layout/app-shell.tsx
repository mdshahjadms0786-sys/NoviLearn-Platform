'use client';

import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme-provider';
import { RequireAuth } from '../require-auth';
import { AppHeader } from './app-header';
import { BottomNav } from './bottom-nav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <RequireAuth>
      <ShellContent>{children}</ShellContent>
    </RequireAuth>
  );
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <AppHeader topInset={insets.top} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        alwaysBounceVertical={false}
      >
        {children}
      </ScrollView>
      <BottomNav bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
});
