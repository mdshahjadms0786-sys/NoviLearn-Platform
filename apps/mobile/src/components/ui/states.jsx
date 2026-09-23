"use client";

import { StyleSheet, Text, View } from "react-native";

import { Spinner } from "./spinner";
import { useTheme } from "../../theme-provider";
export function EmptyState({ title, description, action, icon, style }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
      >
        {icon || (
          <Text
            style={[
              styles.iconText,
              {
                color: theme.colors.onSurfaceVariant,
              },
            ]}
          >
            📭
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.onBackground,
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
export function ErrorState({ title, description, action, style }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: theme.colors.error + "20",
          },
        ]}
      >
        <Text
          style={[
            styles.iconText,
            {
              color: theme.colors.error,
            },
          ]}
        >
          ⚠️
        </Text>
      </View>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.onBackground,
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
export function LoadingState({ message = "Loading...", style }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      <Spinner size="lg" />
      <Text
        style={[
          styles.messageText,
          {
            color: theme.colors.onSurfaceVariant,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
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
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    fontFamily: "System",
    textAlign: "center",
  },
});
