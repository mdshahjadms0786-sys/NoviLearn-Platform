'use client';

import { Ionicons } from '@expo/vector-icons';

import { AppShell } from '../components/layout/app-shell';
import { ComingSoon } from '../components/placeholder/coming-soon';
import { useTheme } from '../theme-provider';

export default function ProgressScreen() {
  const { theme } = useTheme();

  return (
    <AppShell>
      <ComingSoon
        title="Progress"
        heading="Progress tracking is coming soon"
        description="Progress tracking will be available in a future phase."
        icon={
          <Ionicons
            name="stats-chart-outline"
            size={28}
            color={theme.colors.onSurfaceVariant}
          />
        }
      />
    </AppShell>
  );
}
