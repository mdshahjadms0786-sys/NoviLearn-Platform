"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { DashboardEmpty } from "./dashboard-empty";
import { DashboardSection } from "./dashboard-section";
import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
export function RecentActivitySection() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <DashboardSection
      title="Recent activity"
      description="Your latest learning moments"
    >
      <DashboardEmpty
        icon={
          <Ionicons
            name="time-outline"
            size={26}
            color={theme.colors.onSurfaceVariant}
          />
        }
        title="No activity yet"
        description="Your completed lessons, questions, and milestones will show up here."
        action={
          <Button size="sm" onPress={() => router.push("/learn")}>
            Start learning
          </Button>
        }
      />
    </DashboardSection>
  );
}
