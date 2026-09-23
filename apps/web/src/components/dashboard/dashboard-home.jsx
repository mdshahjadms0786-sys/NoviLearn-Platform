"use client";

import { ContinueLearningSection } from "@/components/dashboard/continue-learning-section";
import { LearningEntry } from "@/components/dashboard/learning-entry";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivitySection } from "@/components/dashboard/recent-activity-section";
import { RecommendedSection } from "@/components/dashboard/recommended-section";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { useAuthStore } from "@/lib/auth-store";
export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const userName = user?.name?.trim() || "there";
  return (
    <div className="space-y-8">
      <WelcomeSection userName={userName} />
      <LearningEntry />
      <QuickActions />
      <ContinueLearningSection />
      <RecentActivitySection />
      <RecommendedSection />
    </div>
  );
}
