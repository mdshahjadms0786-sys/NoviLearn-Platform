'use client';

import { Ionicons } from '@expo/vector-icons';

import { AppShell } from '../components/layout/app-shell';
import { ComingSoon } from '../components/placeholder/coming-soon';
import { useTheme } from '../theme-provider';

export default function PracticeScreen() {
  const { theme } = useTheme();

  return (
    <AppShell>
      <ComingSoon
        title="Practice"
        heading="Practice experiences are on the way"
        description="Practice experiences to reinforce your learning will be introduced in a future phase."
        icon={
          <Ionicons
            name="fitness-outline"
            size={28}
            color={theme.colors.onSurfaceVariant}
          />
        }
      />
    </AppShell>
  );
}
