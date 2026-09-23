import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import type { TopicProgress } from "@novilearn/types";

import { truncateTopic } from "./format";
import { MasteryBadge } from "./mastery-badge";
import { useTheme } from "../../theme-provider";
import { DashboardEmpty } from "../dashboard/dashboard-empty";
import { DashboardSection } from "../dashboard/dashboard-section";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface TopicProgressListProps {
  topics: TopicProgress[];
}

export function TopicProgressList({ topics }: TopicProgressListProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <DashboardSection
      title="Topic progress"
      description="How far you have come on each topic you have learned or practiced."
    >
      {topics.length === 0 ? (
        <DashboardEmpty
          icon={
            <Ionicons
              name="bar-chart-outline"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          }
          title="No topics tracked yet"
          description="Topics appear here once you ask about them in Learn or complete practice."
          action={
            <Button onPress={() => router.push("/learn")}>
              Start learning
            </Button>
          }
        />
      ) : (
        <View style={styles.list}>
          {topics.map((topic) => (
            <View
              key={topic.topic}
              style={[styles.card, { borderColor: theme.colors.outline }]}
            >
              <View style={styles.cardHeader}>
                <Text
                  numberOfLines={2}
                  style={[styles.topic, { color: theme.colors.onSurface }]}
                >
                  {truncateTopic(topic.topic, 80)}
                </Text>
                <MasteryBadge mastery={topic.mastery} />
              </View>
              <View style={styles.detailsRow}>
                <Text
                  style={[
                    styles.details,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {topic.learningCount} learned · {topic.practiceCount}{" "}
                  practiced
                </Text>
                <Text
                  style={[
                    styles.details,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {topic.progress}%
                </Text>
              </View>
              <Progress value={topic.progress} size="sm" animated={false} />
            </View>
          ))}
        </View>
      )}
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  topic: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  details: {
    fontSize: 12,
    fontFamily: "System",
  },
});
