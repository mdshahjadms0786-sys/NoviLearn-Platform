"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
import { Card, CardContent, CardHeader } from "../ui/card";
export function ContinueLearning({ topics }) {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <Card>
      <CardHeader
        title="Continue learning"
        subtitle="Take the next step in this path."
      />
      <CardContent style={styles.content}>
        {topics.map((topic, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`Continue learning ${topic}`}
            onPress={() => router.push(`/learn?q=${encodeURIComponent(topic)}`)}
            style={({ pressed }) => [
              styles.row,
              {
                borderColor: theme.colors.outline,
              },
              pressed && {
                backgroundColor: theme.colors.surfaceVariant,
              },
            ]}
          >
            <View
              style={[
                styles.number,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text
                style={[
                  styles.numberText,
                  {
                    color: theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.rowText,
                {
                  color: theme.colors.onSurface,
                },
              ]}
            >
              {topic}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        ))}
      </CardContent>
    </Card>
  );
}
const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  number: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "System",
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "System",
  },
});
