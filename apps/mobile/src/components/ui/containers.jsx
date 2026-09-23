"use client";

import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../theme-provider";
export function Screen({ children, style, padding = 16, backgroundColor }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      style={[
        styles.screen,
        {
          backgroundColor: backgroundColor || theme.colors.background,
          padding,
        },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}
export function Section({ children, style, title, spacing = 24 }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.section,
        {
          gap: spacing,
        },
        style,
      ]}
    >
      {title && (
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.onBackground,
            },
          ]}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
export function Header({ title, subtitle, action, style }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.onBackground,
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
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  section: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "System",
    marginBottom: 8,
  },
  header: {
    width: "100%",
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "System",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "System",
    marginTop: 2,
  },
});
