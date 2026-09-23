"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "../../lib/auth-store";
import { useTheme } from "../../theme-provider";
export function AppHeader({ topInset }) {
  const { theme, colorScheme, toggleTheme } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initials = user
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .filter((char) => char !== undefined)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "NL";
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topInset,
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outline,
        },
      ]}
    >
      <View style={styles.brand}>
        <Ionicons name="school" size={20} color={theme.colors.primary} />
        <Text
          style={[
            styles.brandText,
            {
              color: theme.colors.onSurface,
            },
          ]}
        >
          NoviLearn
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle theme"
          onPress={toggleTheme}
          style={styles.iconButton}
        >
          <Ionicons
            name={colorScheme === "dark" ? "sunny" : "moon"}
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push("/account")}
          style={[
            styles.avatar,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              {
                color: theme.colors.onPrimary,
              },
            ]}
          >
            {initials}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "System",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "System",
  },
});
