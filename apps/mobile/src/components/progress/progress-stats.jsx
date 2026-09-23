import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
import { DashboardEmpty } from "../dashboard/dashboard-empty";
import { Card, CardContent } from "../ui/card";
function ProgressStat({ label, value }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.stat,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.onSurface,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {
            color: theme.colors.onSurfaceVariant,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
export function ProgressStats({ summary }) {
  const stats = [
    {
      label: "Learning activities",
      value: String(summary.learningActivityCount),
    },
    {
      label: "Practice sessions",
      value: String(summary.practiceSessionCount),
    },
    {
      label: "Topics tracked",
      value: String(summary.uniqueTopicCount),
    },
    {
      label: "Average accuracy",
      value:
        summary.averageAccuracy === null ? "—" : `${summary.averageAccuracy}%`,
    },
  ];
  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <ProgressStat key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </View>
  );
}
export function EmptyProgressStats({ action, icon }) {
  const { theme } = useTheme();
  return (
    <Card>
      <CardContent>
        <DashboardEmpty
          icon={
            icon ?? (
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 22,
                }}
              >
                📊
              </Text>
            )
          }
          title="No progress yet"
          description="Statistics here are calculated only from your real learning and practice activity."
          action={action}
        />
      </CardContent>
    </Card>
  );
}
const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stat: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "System",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "System",
  },
});
