'use client';

import { StyleSheet, View } from 'react-native';

import { ContinueLearningSection } from './continue-learning-section';
import { LearningEntry } from './learning-entry';
import { QuickActions } from './quick-actions';
import { RecentActivitySection } from './recent-activity-section';
import { RecommendedSection } from './recommended-section';
import { WelcomeSection } from './welcome-section';
import { useAuthStore } from '../../lib/auth-store';

export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const userName = user?.name?.trim() || 'there';

  return (
    <View style={styles.container}>
      <WelcomeSection userName={userName} />
      <LearningEntry />
      <QuickActions />
      <ContinueLearningSection />
      <RecentActivitySection />
      <RecommendedSection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
});
