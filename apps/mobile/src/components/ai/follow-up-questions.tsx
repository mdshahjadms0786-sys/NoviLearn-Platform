"use client";

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "../../theme-provider";
import { Card, CardContent, CardHeader } from "../ui/card";

interface FollowUpQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function FollowUpQuestions({
  questions,
  onSelect,
}: FollowUpQuestionsProps) {
  const { theme } = useTheme();

  return (
    <Card>
      <CardHeader
        title="Keep learning"
        subtitle="Pick a follow-up question to keep exploring this topic."
      />
      <CardContent style={styles.content}>
        {questions.map((question, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`Ask follow-up: ${question}`}
            onPress={() => onSelect(question)}
            style={({ pressed }) => [
              styles.row,
              { borderColor: theme.colors.outline },
              pressed && { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={[styles.rowText, { color: theme.colors.onSurface }]}>
              {question}
            </Text>
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
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "System",
  },
});
