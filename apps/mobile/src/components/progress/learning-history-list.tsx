import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import type { LearningActivity } from "@novilearn/types";

import { formatDateTime, truncateTopic } from "./format";
import { useTheme } from "../../theme-provider";
import { DashboardEmpty } from "../dashboard/dashboard-empty";
import { DashboardSection } from "../dashboard/dashboard-section";
import { Button } from "../ui/button";

interface LearningHistoryListProps {
  activities: LearningActivity[];
}

export function LearningHistoryList({ activities }: LearningHistoryListProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <DashboardSection
      title="Learning history"
      description="Topics you asked about, from your real learning activity."
    >
      {activities.length === 0 ? (
        <DashboardEmpty
          icon={
            <Ionicons
              name="book-outline"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          }
          title="No learning yet"
          description="Head over to Learn and ask your first question to start your history."
          action={
            <Button onPress={() => router.push("/learn")}>
              Start learning
            </Button>
          }
        />
      ) : (
        <View style={styles.list}>
          {activities.map((activity) => (
            <View
              key={activity.id}
              style={[styles.row, { borderBottomColor: theme.colors.outline }]}
            >
              <Ionicons
                name="sparkles-outline"
                size={18}
                color={theme.colors.primary}
              />
              <View style={styles.rowText}>
                <Text
                  numberOfLines={2}
                  style={[styles.topic, { color: theme.colors.onSurface }]}
                >
                  {truncateTopic(activity.topic, 80)}
                </Text>
                <Text
                  style={[styles.at, { color: theme.colors.onSurfaceVariant }]}
                >
                  {formatDateTime(activity.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  topic: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  at: {
    fontSize: 12,
    fontFamily: "System",
  },
});
