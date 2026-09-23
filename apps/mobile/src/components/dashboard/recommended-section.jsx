"use client";

import { Ionicons } from "@expo/vector-icons";

import { DashboardEmpty } from "./dashboard-empty";
import { DashboardSection } from "./dashboard-section";
import { useTheme } from "../../theme-provider";
export function RecommendedSection() {
  const { theme } = useTheme();
  return (
    <DashboardSection
      title="Recommended for you"
      description="Hand-picked topics to spark your curiosity"
    >
      <DashboardEmpty
        icon={
          <Ionicons
            name="star-outline"
            size={26}
            color={theme.colors.onSurfaceVariant}
          />
        }
        title="Recommendations are coming soon"
        description="Personalized suggestions powered by your interests and progress will be introduced in a future phase."
      />
    </DashboardSection>
  );
}
