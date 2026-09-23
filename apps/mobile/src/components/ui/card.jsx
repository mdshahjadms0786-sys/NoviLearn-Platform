"use client";

import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
export function Card({ children, style, elevation = 1, padding = 16 }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          elevation,
          padding,
        },
        elevation > 0 && {
          shadowColor: theme.colors.onSurface,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function CardHeader({ title, subtitle, action, style }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: theme.colors.outline,
        },
        style,
      ]}
    >
      <View style={styles.headerContent}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.onSurface,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}
export function CardContent({ children, style }) {
  return <View style={[styles.content, style]}>{children}</View>;
}
export function CardActions({ children, style }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.actions,
        {
          borderTopColor: theme.colors.outline,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "System",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "System",
    marginTop: 2,
  },
  content: {
    paddingVertical: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
});
