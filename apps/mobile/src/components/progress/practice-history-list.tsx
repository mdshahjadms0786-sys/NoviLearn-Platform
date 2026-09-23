import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PracticeSessionSummary } from "@novilearn/types";

import { formatDateTime, truncateTopic } from "./format";
import { useTheme } from "../../theme-provider";
import { DashboardEmpty } from "../dashboard/dashboard-empty";
import { DashboardSection } from "../dashboard/dashboard-section";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface PracticeHistoryListProps {
  sessions: PracticeSessionSummary[];
  onOpenSession: (session: PracticeSessionSummary) => void;
}

export function PracticeHistoryList({
  sessions,
  onOpenSession,
}: PracticeHistoryListProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <DashboardSection
      title="Practice history"
      description="Your completed practice sessions, with topics and scores."
    >
      {sessions.length === 0 ? (
        <DashboardEmpty
          icon={
            <Ionicons
              name="fitness-outline"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          }
          title="No practice yet"
          description="Complete your first practice session to see your results here."
          action={
            <Button onPress={() => router.push("/practice")}>
              Start practicing
            </Button>
          }
        />
      ) : (
        <View style={styles.list}>
          {sessions.map((session) => (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${session.topic}`}
              onPress={() => onOpenSession(session)}
              style={[styles.row, { borderBottomColor: theme.colors.outline }]}
            >
              <Ionicons
                name="fitness-outline"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
              <View style={styles.rowText}>
                <Text
                  numberOfLines={2}
                  style={[styles.topic, { color: theme.colors.onSurface }]}
                >
                  {truncateTopic(session.topic, 80)}
                </Text>
                <Text
                  style={[styles.at, { color: theme.colors.onSurfaceVariant }]}
                >
                  {formatDateTime(session.completedAt)}
                </Text>
              </View>
              <Badge
                variant={session.accuracy >= 80 ? "success" : "outline"}
                size="sm"
              >
                {session.score}/{session.totalQuestions} · {session.accuracy}%
              </Badge>
            </Pressable>
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
    minHeight: 48,
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
