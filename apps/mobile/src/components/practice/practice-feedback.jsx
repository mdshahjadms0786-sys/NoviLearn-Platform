"use client";

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
const SUCCESS_GREEN = "#22c55e";
export function PracticeFeedbackView({
  correct,
  explanation,
  correctAnswer,
  isLast,
  onNext,
  loading,
}) {
  const { theme } = useTheme();
  const accent = correct ? SUCCESS_GREEN : theme.colors.error;
  return (
    <Card>
      <CardHeader
        title={correct ? "Correct" : "Incorrect"}
        subtitle={
          correct
            ? "Nice work, keep going!"
            : `Correct answer: ${correctAnswer}`
        }
        action={
          <Ionicons
            name={correct ? "checkmark-circle" : "close-circle"}
            size={32}
            color={accent}
          />
        }
        style={styles.header}
      />
      <CardContent style={styles.content}>
        <View>
          <Text
            style={[
              styles.label,
              {
                color: theme.colors.onSurface,
              },
            ]}
          >
            Explanation
          </Text>
          <Text
            style={[
              styles.explanation,
              {
                color: theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {explanation}
          </Text>
        </View>
        <Button fullWidth loading={loading} onPress={onNext}>
          {isLast ? "See Results" : "Next Question"}
        </Button>
      </CardContent>
    </Card>
  );
}
const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
  },
  content: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
    marginBottom: 4,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "System",
  },
});
