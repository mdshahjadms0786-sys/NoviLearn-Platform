"use client";

import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
export function WelcomeSection({ userName }) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.onBackground,
          },
        ]}
      >
        Welcome back, {userName}
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: theme.colors.onSurfaceVariant,
          },
        ]}
      >
        Your personalized learning home is ready. Explore a topic or keep going.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "System",
    lineHeight: 22,
  },
});
