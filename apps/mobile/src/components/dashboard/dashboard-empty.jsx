"use client";

import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
export function DashboardEmpty({ icon, title, description, action }) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      {icon && (
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: theme.colors.surfaceVariant,
            },
          ]}
        >
          {icon}
        </View>
      )}
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.onSurface,
          },
        ]}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {description}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: "System",
    textAlign: "center",
    maxWidth: 280,
  },
  action: {
    marginTop: 4,
  },
});
