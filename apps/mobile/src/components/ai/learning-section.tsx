"use client";

import { StyleSheet, View } from "react-native";

import type { LearningResponseSection } from "@novilearn/types";

import { MarkdownText } from "./markdown";
import { useTheme } from "../../theme-provider";
import { Card, CardContent, CardHeader } from "../ui/card";

interface LearningSectionProps {
  section: LearningResponseSection;
}

export function LearningSection({ section }: LearningSectionProps) {
  const { theme } = useTheme();

  return (
    <Card>
      <CardHeader title={section.title} />
      <CardContent style={styles.content}>
        {section.content !== undefined && (
          <MarkdownText text={section.content} />
        )}
        {section.items !== undefined && (
          <View style={styles.items}>
            {section.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.bulletWrapper}>
                  <View
                    style={[
                      styles.bulletDot,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                </View>
                <View style={styles.itemBody}>
                  <MarkdownText text={item} />
                </View>
              </View>
            ))}
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  items: {
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    gap: 10,
  },
  bulletWrapper: {
    paddingTop: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemBody: {
    flex: 1,
  },
});
