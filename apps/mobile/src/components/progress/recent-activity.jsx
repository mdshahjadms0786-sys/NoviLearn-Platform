import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { formatDateTime, truncateTopic } from "./format";
import { useTheme } from "../../theme-provider";
import { DashboardEmpty } from "../dashboard/dashboard-empty";
import { DashboardSection } from "../dashboard/dashboard-section";
import { Badge } from "../ui/badge";
export function RecentActivity({ summary }) {
  const items = summary.recentActivity;
  const { theme } = useTheme();
  return (
    <DashboardSection
      title="Recent activity"
      description="Your latest learning and practice, calculated from real data."
    >
      {items.length === 0 ? (
        <DashboardEmpty
          icon={
            <Ionicons
              name="time-outline"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          }
          title="Nothing here yet"
          description="When you learn or practice, your recent activity will appear here."
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <RecentActivityRow key={`${item.type}-${item.id}`} item={item} />
          ))}
        </View>
      )}
    </DashboardSection>
  );
}
function RecentActivityRow({ item }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: theme.colors.outline,
        },
      ]}
    >
      <Ionicons
        name={item.type === "learn" ? "sparkles-outline" : "fitness-outline"}
        size={18}
        color={
          item.type === "learn"
            ? theme.colors.primary
            : theme.colors.onSurfaceVariant
        }
      />
      <View style={styles.rowText}>
        <Text
          numberOfLines={2}
          style={[
            styles.topic,
            {
              color: theme.colors.onSurface,
            },
          ]}
        >
          {truncateTopic(item.topic, 80)}
        </Text>
        <Text
          style={[
            styles.at,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {formatDateTime(item.at)}
        </Text>
      </View>
      <Badge variant="outline" size="sm">
        {item.type === "learn" ? "Learned" : "Practiced"}
      </Badge>
    </View>
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
