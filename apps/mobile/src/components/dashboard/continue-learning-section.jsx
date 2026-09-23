"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { DashboardEmpty } from "./dashboard-empty";
import { DashboardSection } from "./dashboard-section";
import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
export function ContinueLearningSection() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <DashboardSection
      title="Continue learning"
      description="Pick up where you left off"
    >
      <DashboardEmpty
        icon={
          <Ionicons
            name="play-circle-outline"
            size={26}
            color={theme.colors.onSurfaceVariant}
          />
        }
        title="Nothing in progress yet"
        description="When you start a learning path, your progress will appear here."
        action={
          <Button
            size="sm"
            variant="outlined"
            onPress={() => router.push("/learn")}
          >
            Explore learning
          </Button>
        }
      />
    </DashboardSection>
  );
}
