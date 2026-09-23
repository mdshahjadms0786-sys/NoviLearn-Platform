"use client";

import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
import { Card, CardContent, CardHeader } from "../ui/card";
export function RelatedConcepts({ concepts }) {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <Card>
      <CardHeader
        title="Related concepts"
        subtitle="Explore connected ideas to go deeper."
      />
      <CardContent style={styles.content}>
        <View style={styles.wrap}>
          {concepts.map((concept, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Learn about ${concept}`}
              onPress={() =>
                router.push(`/learn?q=${encodeURIComponent(concept)}`)
              }
              style={({ pressed }) => [
                styles.chip,
                {
                  borderColor: theme.colors.outline,
                },
                pressed && {
                  opacity: 0.7,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: theme.colors.primary,
                  },
                ]}
              >
                {concept}
              </Text>
            </Pressable>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
});
