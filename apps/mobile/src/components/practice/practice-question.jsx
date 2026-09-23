"use client";

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
function OptionRow({ label, selected, onPress }) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{
        checked: selected,
        disabled: false,
      }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          backgroundColor: selected
            ? theme.colors.primaryContainer
            : theme.colors.surface,
        },
        pressed && styles.optionPressed,
      ]}
    >
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? theme.colors.primary : theme.colors.outline,
            backgroundColor: selected ? theme.colors.primary : "transparent",
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.radioDot,
              {
                backgroundColor: theme.colors.onPrimary,
              },
            ]}
          />
        )}
      </View>
      <Text
        style={[
          styles.optionText,
          {
            color: theme.colors.onSurface,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function PracticeQuestionView({
  topic,
  question,
  index,
  total,
  value,
  onAnswerChange,
  onSubmit,
  submitting,
  disabled,
}) {
  const { theme } = useTheme();
  const options =
    question.type === "true_false"
      ? ["True", "False"]
      : (question.options ?? []);
  const canSubmit = !submitting && !disabled && value.trim() !== "";
  return (
    <Card>
      <CardHeader
        title={question.question}
        subtitle={`${topic} · Question ${index + 1} of ${total}`}
        style={styles.header}
      />
      <CardContent style={styles.content}>
        {question.type === "short_answer" ? (
          <Input
            label="Your answer"
            value={value}
            onChangeText={onAnswerChange}
            placeholder="Type your answer"
            editable={!disabled && !submitting}
            autoCorrect={false}
            multiline
            numberOfLines={2}
          />
        ) : (
          <>
            <Text
              style={[
                styles.answerLabel,
                {
                  color: theme.colors.onSurface,
                },
              ]}
            >
              Your answer
            </Text>
            <View style={styles.options}>
              {options.map((option) => (
                <OptionRow
                  key={option}
                  label={option}
                  selected={value === option}
                  onPress={() => onAnswerChange(option)}
                />
              ))}
            </View>
          </>
        )}

        <Button
          fullWidth
          disabled={!canSubmit}
          loading={submitting}
          icon={
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.onPrimary}
            />
          }
          onPress={onSubmit}
        >
          Submit Answer
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
  answerLabel: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionPressed: {
    opacity: 0.8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "System",
  },
});
