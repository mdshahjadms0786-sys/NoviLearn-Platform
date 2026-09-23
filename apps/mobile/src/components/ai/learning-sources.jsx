"use client";

import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
import { Card, CardContent, CardHeader } from "../ui/card";
export function LearningSources({ sources }) {
  const { theme } = useTheme();
  if (sources.length === 0) {
    return null;
  }
  return (
    <Card>
      <CardHeader
        title="Sources"
        subtitle="This answer was grounded in the following knowledge."
      />
      <CardContent style={styles.content}>
        {sources.map((source, index) => (
          <View key={index} style={styles.source}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.onSurface,
                },
              ]}
            >
              {index + 1}. {source.title}
            </Text>
            <Text
              style={[
                styles.meta,
                {
                  color: theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {source.topic} · {source.source} · {source.confidence} confidence
            </Text>
            <Text
              style={[
                styles.excerpt,
                {
                  color: theme.colors.onSurfaceVariant,
                },
              ]}
            >
              “{source.excerpt}”
            </Text>
          </View>
        ))}
      </CardContent>
    </Card>
  );
}
const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  source: {
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "System",
  },
  meta: {
    fontSize: 13,
    fontFamily: "System",
  },
  excerpt: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "System",
    marginTop: 2,
  },
});
